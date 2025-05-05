import express from 'express';
import { getOrders, updateShippingStatus } from '../Controllers/orders.controller.js';

const router = express.Router()

router.get('/getorder', getOrders)
router.put('/updateshippingstatus/:orderId', updateShippingStatus)

export default router
