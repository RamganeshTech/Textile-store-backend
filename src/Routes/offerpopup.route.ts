import express from 'express';
import { getActiveOffer, createOffer, editOffer, deleteOffer } from '../Controllers/offerpopup.controller.js';
import { isAdminAuthenticated } from '../Controllers/adminauth.controller.js';
import authAdminMiddleware from '../Middleware/authAdminMiddleware.js';
import multer from 'multer';
const upload = multer();
const router = express.Router();

// GET /api/offers/active
router.get('/activeoffers', getActiveOffer);
router.post('/createoffer', authAdminMiddleware, upload.none(), createOffer);
router.put('/editoffer/:offerId', authAdminMiddleware, upload.none(), editOffer);
router.delete('/deleteoffer/:offerId', authAdminMiddleware, deleteOffer);

export default router
