// npm install razorpay
import Razorpay from "razorpay";
import { Request, Response } from "express";
import crypto from "crypto";
import OrderModel from "../Models/orders.model.js";
import { AuthenticatedRequest } from '../Types/types.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});


const razorpayPayment = async (req: Request, res: Response) => {
  // const { amount } = req.body;
  let user = (req as AuthenticatedRequest).user;

  const {
    products,
    shippingAddress,
    amount,
  } = req.body

  const options = {
    amount: amount * 100, // amount in paise
    currency: "INR",
    // receipt: "receipt_order_" + new Date().getTime(),
    receipt: `rcpt_${Date.now()}`,

  };

  try {
    const order = await razorpay.orders.create(options);

    const maunalOrder = new OrderModel({
      userId: user._id,
      products,
      shippingAddress,
      totalAmount:amount,
      paymentInfo: {
        orderId: order.id,
        // paymentId: '',
        // signature: '',
        status: 'pending'
      },
      // orderStatus: 'processing'
    });
    await maunalOrder.save();

    // res.json({ ok:true, success: true, order });
    res.json({
      ok: true,
      success: true,
      order,
      internalOrderId: maunalOrder._id
    });

  } catch (err) {
    console.error("Order create error", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extracting the Razorpay order ID, payment ID, and signature from the request body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // console.log("razorpyay details", { razorpay_order_id, razorpay_payment_id, razorpay_signature });
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ success: false, message: "Missing required parameters" });
      return;
    }

    // Create an HMAC hash with SHA256 algorithm using the Razorpay secret
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);  // Razorpay order_id and payment_id must be joined by a pipe symbol "|"
    const generatedSignature = hmac.digest("hex");

    // Comparing the generated signature with the provided signature from Razorpay
    if (generatedSignature === razorpay_signature) {
      // Payment verified successfully
     
      await OrderModel.findOneAndUpdate(
        { 'paymentInfo.orderId': razorpay_order_id },
        {
          $set: {
            'paymentInfo.status': 'paid',
            'paymentInfo.paymentId': razorpay_payment_id,
            'paymentInfo.signature': razorpay_signature,
            'products.$[].orderStatus': 'processing' // this sets orderStatus for all products in the array
          }
        }
      );

      res.json({ success: true });
      return;
    } 
    // else {
    //   // Payment verification failed, signatures do not match

    //   await OrderModel.findOneAndUpdate(
    //     { 'paymentInfo.orderId': razorpay_order_id },
    //     { 'paymentInfo.status': 'failed' }
    //   );
    //   res.status(400).json({ success: false, message: "Payment verification failed" });
    //   return;
    // }
  } catch (error) {
    // await OrderModel.findOneAndUpdate(
    //   { 'paymentInfo.orderId': razorpay_order_id },
    //   { 'paymentInfo.status': 'failed' }
    // );
    console.error("Payment verification failed:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
    return;
  }
};


const paymentFailure = async (req: Request, res: Response): Promise<void>=> {
  try {
    const { razorpay_order_id } = req.body;

    if (!razorpay_order_id) {
       res.status(400).json({ success: false, message: "Missing order ID" });
       return
    }

    const updatedOrder = await OrderModel.findOneAndUpdate(
      { 'paymentInfo.orderId': razorpay_order_id },
      {
        $set: {
          'paymentInfo.status': 'failed',
          'products.$[].orderStatus': 'cancelled',
        }
      },
      { returnDocument: "after" }
    );

    if (!updatedOrder) {
       res.status(404).json({ success: false, message: "Order not found" });
       return
    }

     res.json({ success: true, message: "Payment marked as failed" });
     return;
  } catch (error) {
    console.error("Payment failure update error:", error);
     res.status(500).json({ success: false, message: "Internal server error" });
     return
  }
}




export { razorpayPayment, verifyPayment , paymentFailure}