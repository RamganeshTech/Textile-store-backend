import express, { RequestHandler } from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { createProduct, getAllProducts, uploadImage, editProducts,deleteProduct } from "../Controllers/product.controller.js";
import { upload } from "../Utils/s3upload.js";
// import { createProduct } from "../Controllers/product.controller.js";
// import upload from "../Utils/s3upload.js"; // Path to the S3 upload middleware

const router = express.Router();

router.post('/products/uploadimage', upload.array('file'), uploadImage as RequestHandler);
router.get('/products/getproducts', getAllProducts as RequestHandler)
router.post('/products/createproduct', createProduct as RequestHandler)
router.put('/products/editproducts/:productId', editProducts as RequestHandler)
router.delete('/products/deleteproduct/:productId', deleteProduct as RequestHandler)

export default router;
