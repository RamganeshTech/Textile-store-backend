import { Response, Request } from 'express';
import { IUser, UserModel } from '../Models/user.model.js';
import { AuthenticatedRequest } from '../Types/types.js';
import bcrypt  from 'bcrypt';
import OrderModel from '../Models/orders.model.js';

const changePassword = async (req: Request, res: Response):Promise<void> => {
try{
     let user = (req as AuthenticatedRequest).user;
    
    let {currentPassword, newPassword} = req.body

    let isUserExists = await UserModel.findById(user._id);

    if(!isUserExists){
        res.status(404).json({ message: "User not found", error: true , ok:false});
        return;
    }

    let isPasswordMatching = await bcrypt.compare(currentPassword, isUserExists.password)

    if(!isPasswordMatching){
        res.status(404).json({ message: "Enter correct current passwrod", error: true , ok:false});
        return;
    }

    const saltRounds = 10
    let hashedPassword = await bcrypt.hash(newPassword, saltRounds)

    isUserExists.password = hashedPassword

    await isUserExists.save()

    res.status(200).json({ message: "password updated", data:isUserExists, error: false, ok: true })
}
catch(error){
    if (error instanceof Error) {
        console.log("error from changepassword Review", error.message)
        res.status(400).json({ message: error.message, error: true, ok: false })
        return;
    }
}
}

const verifyPassword = async (req: Request, res: Response):Promise<void> => {
    try { 
      let user = (req as AuthenticatedRequest).user;
      let { password } = req.body;
  
      let isUserExists = await UserModel.findById(user._id);
  
      if (!isUserExists) {
         res.status(404).json({ message: "User not found", error: true, ok:false });
         return;
      }
  
      let isPasswordMatching = await bcrypt.compare(password, isUserExists.password);
  
      if (!isPasswordMatching) {
         res.status(400).json({ message: "Incorrect password", error: true, ok:false });
         return;
      }
  
      res.status(200).json({ message: "Password verified successfully", error: false, ok:true });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in verifyPassword API:", error.message);
        res.status(500).json({ message: error.message, error: true , ok:false});
      }
    }
  };

  
const updateEmail = async (req: Request, res: Response):Promise<void> => {
    try {
      let user = (req as AuthenticatedRequest).user;
      let { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "Email is required", error: true , ok:false});
        return;
     }
  
      let isUserExists = await UserModel.findById(user._id);
  
      if (!isUserExists) {
         res.status(404).json({ message: "User not found", error: true, ok:false });
         return;
      }
  
      isUserExists.email = email;
      await isUserExists.save();
  
      res.status(200).json({ message: "Email updated successfully", error: false , ok:true});
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in updateEmail API:", error.message);
        res.status(500).json({ message: error.message, error: true, ok:false });
      }
    }
  };

  
  const updatePhoneNumber = async (req: Request, res: Response):Promise<void> => {
    try {
      let user = (req as AuthenticatedRequest).user;
      let { phoneNo } = req.body;
  
      if (!phoneNo) {
        res.status(400).json({ message: "Phone number is required", error: true , ok:false});
        return;
     }


      let isUserExists = await UserModel.findById(user._id);
  
      if (!isUserExists) {
         res.status(404).json({ message: "User not found", error: true, ok:false });
         return;
      }
  
     
  
      isUserExists.phoneNumber = phoneNo;
      await isUserExists.save();
  
      res.status(200).json({ message: "Phone number updated successfully", error: false , ok:true});
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in updatePhoneNumber API:", error.message);
        res.status(500).json({ message: error.message, error: true, ok:false });
      }
    }
  };

  
  const updateUserName = async (req: Request, res: Response):Promise<void> => {
    try {
      let user = (req as AuthenticatedRequest).user;
      let { userName } = req.body;

      if (!userName) {
        res.status(400).json({ message: "Username is required", error: true, ok:false });
        return;
     }
  
      let isUserExists = await UserModel.findById(user._id);
  
      if (!isUserExists) {
         res.status(404).json({ message: "User not found", error: true , ok:false});
         return;
      }
  
    
  
      isUserExists.userName = userName;
      await isUserExists.save();
  
      res.status(200).json({ message: "Username updated successfully", error: false ,ok:true});
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error in updateUserName API:", error.message);
        res.status(500).json({ message: error.message, error: true, ok:false });
      }
    }
  };
  

const updateAddress = async (req:Request, res:Response)=>{
  try{
    let user = (req as AuthenticatedRequest).user;
    let address = req.body;

    let {doorno, street, landmark, district, state, pincode } = address

    let isUserExists = await UserModel.findById(user._id);

    if (!isUserExists) {
       res.status(404).json({ message: "User not found", error: true , ok:false});
       return;
    }

    if (!isUserExists.address) {
      isUserExists.address = {
        doorno: null,
        street: null,
        landmark: null,
        district: null,
        state: null,
        pincode: null
      };
    }

    isUserExists.address.doorno = doorno;
    isUserExists.address.street = street;
    isUserExists.address.landmark = landmark;
    isUserExists.address.district= district;
    isUserExists.address.state= state;
    isUserExists.address.pincode = pincode;

    await isUserExists.save();

    res.status(200).json({ message: "user address updated successfully", data:isUserExists.address, error: false ,ok:true});
  }
  catch (error) {
    if (error instanceof Error) {
      console.error("Error in updateAddress API:", error.message);
      res.status(500).json({ message: error.message, error: true, ok:false });
    }
  }
}


const myOrders = async (req:Request, res:Response)=>{
  try{

    let user = (req as AuthenticatedRequest).user
    let isUserExists = await UserModel.findById(user._id);

    if (!isUserExists) {
       res.status(404).json({ message: "User not found", error: true , ok:false});
       return;
    }

    const products = await OrderModel.findOne({userId: isUserExists._id}).populate('products.productId')

    res.status(200).json({ message: "Ordered Products fetched", data:products?.products,  error: false, ok:true });
  }
  catch (error) {
    if (error instanceof Error) {
      console.error("Error in myorderss API:", error.message);
      res.status(500).json({ message: error.message, error: true, ok:false });
    }
  }

}

export {
    changePassword,
    // updateMobileEmail,
    updateEmail,
    updatePhoneNumber,
    updateUserName,
    verifyPassword,
    updateAddress,
    myOrders
}