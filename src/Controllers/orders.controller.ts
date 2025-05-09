import { Request, Response } from "express";
import OrderModel from "../Models/orders.model.js";
import { AuthenticateAdminRequest } from "../Types/types.js";

const sendInfo = {userID:1, shippingAddress:1, products: 1, totalAmount:1, orderStatus:1, placedAt:1, "paymentInfo.orderId":1, "paymentInfo.paymentId":1, "paymentInfo.status":1}

const getOrders = async (req: Request, res: Response): Promise<void> =>{
    try{
        // let admin = (req as AuthenticateAdminRequest).admin

            const orders = await OrderModel.find({products: { $elemMatch: { orderStatus: { $ne: "cancelled" } } } }, sendInfo)
            .populate("products.productId", "productName"); // Fetch all order

            // .populate({
                // path: "product.productId",
                // select: "productName"a
            //   });

        if (orders.length === 0) {
           res.status(404).json({ message: "No order found", data: [], ok: false, error: true });
           return
        }

        const flattenedOrders = orders.flatMap(order =>{
            // console.log("order.products",order.products)
           return  order.products
            .filter(ele=> ele.orderStatus !== "cancelled")
            .map(product => ({
              _id: (product as any)._id,
              userId: order.userId,
              placedAt: order.placedAt,
              paymentInfo: order.paymentInfo,
              shippingAddress: order.shippingAddress,
              products: product, // already populated
            }))
        }
          );
    
         res.status(200).json({ message: "order retrieved successfully", data: flattenedOrders, ok: true, error: false });
         return
    
    } 
    catch(error){
        if (error instanceof Error) {
            console.error("Error fetching order:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message, ok: false });
            return;
          }
    }  
}

const updateShippingStatus = async (req: Request, res: Response):Promise<void> =>{
    try{
        let {orderId} = req.params
        let {orderStatus, productId} = req.body

        // const order = await OrderModel.findOneAndUpdate({"paymentInfo.orderId": orderId}, {orderStatus}, {projection:sendInfo, returnDocument:"after"}); // Fetch all order

       const order =  await OrderModel.findOneAndUpdate(
            { "paymentInfo.orderId": orderId , "products._id":productId},
            {  $set: { "products.$.orderStatus": orderStatus }  },
            { new: true }
          ).select(sendInfo)

        if(!order){
            res.status(404).json({message:"order not found , check the orderId", ok:false, error:true})
            return;
        }
    
         res.status(200).json({ message: "order status updated successfully", data: order, ok: true, error: false });
         return
    } 
    catch(error){
        if (error instanceof Error) {
            console.error("Error updating order status:", error);
            res.status(500).json({ message: "Internal Server Error", error: error.message, ok: false });
            return;
          }
    }  
}


export {getOrders, updateShippingStatus}