import express, { RequestHandler } from "express";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { createProduct, getAllProducts } from "../Controllers/product.controller.js";
// import { createProduct } from "../Controllers/product.controller.js";
// import upload from "../Utils/s3upload.js"; // Path to the S3 upload middleware

const router = express.Router();

// The endpoint expects a multipart/form-data request with the "images" field for file uploads.
// You can limit the number of images to 5 (or any number) using upload.array("images", 5)
// router.post("/addProduct", upload.array("images", 5), createProduct);
router.get('/products/getproducts', getAllProducts as RequestHandler)
router.post('/products/createproduct', createProduct as RequestHandler)

export default router;
