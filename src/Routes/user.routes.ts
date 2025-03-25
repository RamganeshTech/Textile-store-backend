import express, { RequestHandler }  from "express";
import { addToCart, filterProducts, getCartItems, searchProducts } from "../Controllers/user.controller.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const route = express.Router()

route.post('/addtocart', authMiddleware ,addToCart)
route.post('/searchproducts',authMiddleware, searchProducts as RequestHandler)
route.post('/filterproducts',authMiddleware, filterProducts as RequestHandler)
route.post('/getcartitems', authMiddleware, getCartItems as RequestHandler)

export default route;

