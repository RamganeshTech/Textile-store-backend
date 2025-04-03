 import express, { RequestHandler } from 'express';
import { paymentAPi , redirectUrl} from '../Payment/payment.js';

 const router = express.Router()

 router.get('/pay', paymentAPi)
 router.get('/redirect-url/:merchantTransactionId', redirectUrl)

 export default router;
