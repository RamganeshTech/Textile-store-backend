import { Request, Response } from 'express';
import OfferModel from '../Models/offerpopup.model.js';

const getActiveOffer = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const offer = await OfferModel.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
    });

    if (!offer) {
       res.status(204).json({message:"no active offers", error:true, ok:false}); // No active offer
       return;
    }

     res.status(200).json({data:offer,  ok:true, error:false });
     return;
  } catch (error) {
    console.error('Error fetching active offer:', error);
     res.status(500).json({ message: 'Server error', ok:false, error:true });
     return;
  }
};

const createOffer = async(req:Request, res:Response)=>{
  try{
    const {title, image,  message, startDate, endDate} = req.body;
 
    if(!title.trim() || !image ||  !message.trim() || !startDate.trim() || !endDate.trim()){
      res.status(404).json({message:"please provide all the field data", ok:false, error:true  })
      return;
    }

    if(new Date(startDate) >= new Date(endDate)){
      res.status(400).json({message:"starting date should not be after ending date", ok:false, error:true  })
      return;
    }

   const data =  await OfferModel.create({
      title,
      message,
      image,
      startDate,
      endDate,
      isActive:true
    })

    res.status(201).json({message:"offer created successfully", data, ok:true, error:false})
    return;
  }
  catch(error){
    console.error('Error fetching active offer:', error);
    res.status(500).json({ message: 'Server error', ok:false, error:true });
    return;
  }
}

const editOffer = async(req:Request, res:Response)=>{
  try{

    let {offerId} = req.params

    const {title, image,  message, startDate, endDate} = req.body;

    if(!offerId){
      res.status(404).json({message:"please provide offerid to edit", ok:false, error:true  })
      return;
    }

    if(!title || !image ||  !message || !startDate || !endDate){
      res.status(404).json({message:"please provide all the field data", ok:false, error:true  })
      return;
    }

    if(new Date(startDate) > new Date(endDate)){
      res.status(400).json({message:"starting date shoudl not be after ending date", ok:false, error:true  })
      return;
    }

   const data =  await OfferModel.findByIdAndUpdate(offerId,{
      title,
      message,
    image,
      startDate,
      endDate,
      isActive:true
    }, {returnDocument:"after"})

    res.status(201).json({message:"offer created successfully", data,  ok:true, error:false})
    return;
  }
  catch(error){
    console.error('Error editin offer:', error);
    res.status(500).json({ message: 'Server error', ok:false, error:true });
    return;
  }
}


const deleteOffer = async (req:Request, res:Response)=>{
  try{
    const {offerId}= req.params

    if(!offerId){
      res.status(404).json({message:"please provide offerid to edit", ok:false, error:true  })
      return;
    }

      let data = await OfferModel.findByIdAndDelete(offerId)

      if(!data){
        res.status(404).json({message:"Offer didnt Exists", ok:false, error:true  })
        return;
      }


      res.status(200).json({message:"offer deleted successfully", data,  ok:true, error:false})
      return;
  }
  catch(error){
    console.error('Error deleteing offer:', error);
    res.status(500).json({ message: 'Server error', ok:false, error:true });
    return;
  }
}

export {getActiveOffer, createOffer, editOffer, deleteOffer}