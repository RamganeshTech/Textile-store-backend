import express, { RequestHandler }  from "express";
import { addToCart, filterProducts, searchProducts } from "../Controllers/user.controller.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const route = express.Router()

route.post('/addtocart', authMiddleware ,addToCart)
route.post('/searchproducts', searchProducts as RequestHandler)
route.post('/filterproducts', filterProducts as RequestHandler)

export default route;

