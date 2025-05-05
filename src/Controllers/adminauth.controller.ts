import { Response, Request } from "express";
import AdminModel from "../Models/admin.model.js";
import jwt, { VerifyErrors } from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { AuthenticateAdminRequest, AuthenticatedRequest } from "../Types/types.js";
import ProductModel from "../Models/products.model.js";

const adminLogin = async (req: Request, res: Response) => {
    try {
        let accessToken = req.cookies?.adminaccesstoken

        if (accessToken) {
            res.status(400).json({
                message: "Admin already logged in ", error: true, ok: false,
                isAuthenticated: false
            });
            return;
        }

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Email and password are required",
                ok: false,
                isAuthenticated: false
            });
        }


        let isExisting = await AdminModel.findOne({ email })

        if (!isExisting) {
            return res.status(404).json({
                error: true,
                message: "invalid credentials",
                ok: false,
                isAuthenticated: false
            })
        }

        const isMatching = isExisting.password !== password

        if (isMatching) {
            return res.status(400).json({
                error: true,
                message: "invalid credentials",
                ok: false,
                isAuthenticated: false
            });
        }

        let adminaccesstoken = jwt.sign({ _id: isExisting._id, email: isExisting.email }, process.env.JWT_ADMIN_SECRET as string, { expiresIn: "15m" })
        let adminrefreshtoken = jwt.sign({_id: isExisting._id, email: isExisting.email}, process.env.JWT_ADMIN_REFRESH_SECRET as string, { expiresIn: "7d" })

        res.cookie("adminaccesstoken", adminaccesstoken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",

        })

        res.cookie("adminrefreshtoken", adminrefreshtoken, {
            maxAge: 1000*60*60*24*7,
            secure: process.env.NODE_ENV==="production",
            httpOnly:true,
            sameSite: process.env.NODE_ENV==="production" ? "none" : "lax"
        } )


        res.status(200).json({ message: "admin loggin successfull", isAuthenticated: true, email: isExisting.email, ok: true, error: false })
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error form adminlogin:", error);
            res.status(500).json({ message: "Internal Server Error", error: true, ok: false, isAuthenticated: true });
            return;
        }
    }
}

const adminLogout = async (req: Request, res: Response) => {
    try {
        // let adminUser = (req as AuthenticateAdminRequest).admin

        // console.log(adminUser)
        // let isExists = await AdminModel.findById(adminUser._id)

        // if (!isExists) {
        //     res.status(404).json({ message: "admin not found", error: true, ok: false, isAuthenticated: false })
        //     return;
        // } 

        res.clearCookie("adminaccesstoken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });


        res.clearCookie("adminrefreshtoken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Only secure in production
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        res.status(200).json({ message: "admin logged out successfull", error: false, ok: true, isAuthenticated: false })
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error form adminlogout:", error);
            res.status(500).json({ message: "Internal Server Error", error: true, ok: false, isAuthenticated: false });
            return;
        }
    }
}


const isAdminAuthenticated = async (req: Request, res: Response) => {
    try {
        let admin = (req as AuthenticateAdminRequest).admin;

        let data = await AdminModel.findById(admin._id)

        if (!data) {
            return res.status(404).json({ ok: true, message: "admin is not authenticated", error: false, isAuthenticated: false });
        }

        res.status(200).json({ isAuthenticated: true, error: false, ok: true, email: data.email })
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error form isautheitncated admin api:", error);
            res.status(500).json({ message: "Internal Server Error", error: true, ok: false });
            return;
        }
    }

}

const adminRefreshToken = async (req:Request, res:Response)=>{
    try{
        let refreshtoken =  req.cookies?.adminrefreshtoken

        if(!refreshtoken){
            res.status(401).json({message:"UnAuthorized: no refresh token provided please login", ok:false, error:true})
            return;
        }

        jwt.verify(refreshtoken, process.env.JWT_ADMIN_REFRESH_SECRET as string, (err:VerifyErrors|null, decoded:unknown)=>{
        if(err || !decoded){
            res.status(403).json({ message: "Invalid or expired refresh token", error: true, ok: false });
            return;
        }

        let adminaccesstoken = jwt.sign({_id: (decoded as any)._id, email: (decoded as any).email}, process.env.JWT_ADMIN_SECRET as string, {expiresIn: "15m"} )

        res.cookie("adminaccesstoken",adminaccesstoken, {
            maxAge: 1000*60*15,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        })

        res.status(200).json({
            message: "Access token created successfully",
            accessToken: adminaccesstoken,
            ok: true,
            error: false,
            adminId:(decoded as any)._id,
            email: (decoded as any).email
          });
          return;

       })


    }
    catch(error){
        if(error instanceof Error){
            res.status(500).json({message:error.message, error:true, ok:false, adminId: null, email:null})
        }
    }
}

const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await ProductModel.find(); // Fetch all products

        if (products.length === 0) {
            return res.status(200).json({ message: "No products found", data: [], ok: false, error: true });
        }

        return res.status(200).json({ message: "Products retrieved successfully", data: products, ok: true, error: false });
    } catch (error) {

        if (error instanceof Error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message, ok: false });
            return;
        }
    }
};

export { adminLogin, adminLogout, isAdminAuthenticated, getAllProducts , adminRefreshToken}