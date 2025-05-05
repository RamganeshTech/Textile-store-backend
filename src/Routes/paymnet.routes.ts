 import express, { RequestHandler } from 'express';
import { paymentAPi , redirectUrl} from '../Payment/payment.controller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { paymentFailure, razorpayPayment, verifyPayment } from '../Payment/razorpay.controller.js';

 const router = express.Router()

 router.get('/pay', authMiddleware, paymentAPi)
 router.get('/payment-status/:merchantTransactionId', redirectUrl)
//  router.post('/orders', authMiddleware, orders as RequestHandler)

//  down is razorypay process routes, above are phonepe routes
 router.post('/payment/order', authMiddleware, razorpayPayment as RequestHandler)
 router.post('/payment/verify', authMiddleware, verifyPayment)
 router.post('/payment/failure', authMiddleware, paymentFailure)



 export default router;
