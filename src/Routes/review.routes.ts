import express,{ Request, Response } from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { createReview, editReview, getAllReview, removeReview } from '../Controllers/review.controller.js';

const router = express.Router()

router.post('/review/addreview', authMiddleware, createReview);
router.patch('/review/editreview/:reviewid', authMiddleware, editReview);
router.get('/review/getallreviews/:productId', getAllReview);
router.delete('/review/removereview/:reviewid', authMiddleware, removeReview);

export default router;