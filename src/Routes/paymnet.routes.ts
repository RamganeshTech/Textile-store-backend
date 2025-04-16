 import express, { RequestHandler } from 'express';
import { paymentAPi , redirectUrl, orders} from '../Payment/payment.controller.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

 const router = express.Router()

 router.get('/pay', authMiddleware, paymentAPi)
 router.get('/payment-status/:merchantTransactionId', redirectUrl)
 router.post('/orders', authMiddleware, orders as RequestHandler)

 export default router;
