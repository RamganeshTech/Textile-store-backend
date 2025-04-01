import express, { RequestHandler }  from "express";
import { addToCart, filterProducts, getCartItems, removeCartItem, removeQuantity, searchProducts } from "../Controllers/usercart.controller.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const route = express.Router()

route.get('/searchproducts',authMiddleware, searchProducts as RequestHandler)
route.post('/cart/addtocart', authMiddleware ,addToCart)
route.post('/filterproducts',authMiddleware, filterProducts as RequestHandler)
route.get('/cart/getcartitems', authMiddleware, getCartItems as RequestHandler)
route.delete('/cart/deletecartitem/:id', authMiddleware, removeCartItem as RequestHandler)
route.patch('/cart/removequantity/:id', authMiddleware, removeQuantity as RequestHandler)

export default route;

