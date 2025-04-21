 import express, { RequestHandler } from 'express';
import { paymentAPi , redirectUrl, orders} from '../Payment/payment.controller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { razorpayPayment, verifyPayment } from '../Payment/razorpay.controller.js';

 const router = express.Router()

 router.get('/pay', authMiddleware, paymentAPi)
 router.get('/payment-status/:merchantTransactionId', redirectUrl)
 router.post('/orders', authMiddleware, orders as RequestHandler)

 router.post('/payment/order', authMiddleware, razorpayPayment as RequestHandler)
 router.post('/payment/verify', authMiddleware, verifyPayment)



 export default router;
