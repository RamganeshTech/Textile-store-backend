// npm install razorpay
import Razorpay from "razorpay";
import { Request, Response } from "express";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

const razorpayPayment =  async (req:Request, res:Response) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // amount in paise
    currency: "INR",
    receipt: "receipt_order_" + new Date().getTime(),
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ ok:true, success: true, order });
  } catch (err) {
    console.error("Order create error", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const verifyPayment =  async (req:Request, res:Response): Promise<void> => {
    try {
        // Extracting the Razorpay order ID, payment ID, and signature from the request body
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
           res.status(400).json({ success: false, message: "Missing required parameters" });
           return;
        }
    
        // Create an HMAC hash with SHA256 algorithm using the Razorpay secret
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET!);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);  // Razorpay order_id and payment_id must be joined by a pipe symbol "|"
        const generatedSignature = hmac.digest("hex");
    
        // Comparing the generated signature with the provided signature from Razorpay
        if (generatedSignature === razorpay_signature) {
          // Payment verified successfully
           res.json({ success: true });
           return;
        } else {
          // Payment verification failed, signatures do not match
           res.status(400).json({ success: false, message: "Payment verification failed" });
           return;
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
         res.status(500).json({ success: false, message: "Internal Server Error" });
         return;
      }
  };
  



export {razorpayPayment, verifyPayment}