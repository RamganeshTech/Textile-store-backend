 import express, { RequestHandler } from 'express';
import { paymentAPi , redirectUrl, orders} from '../Payment/payment.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';

 const router = express.Router()

 router.get('/pay', paymentAPi)
 router.get('/redirect-url/:merchantTransactionId', redirectUrl)
 router.post('/orders', authMiddleware, orders as RequestHandler)

 export default router;
