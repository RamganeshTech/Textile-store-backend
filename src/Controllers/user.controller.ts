import { Response, Request, RequestHandler } from 'express';
import ProductModel from '../Models/products.model.js';
import CartModel from '../Models/cartItem.model.js';


interface AuthenticatedRequest extends Request {
    user?: any; // Define user property to avoid TypeScript error
}

const addToCart:RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {

        let user= (req as AuthenticatedRequest).user;

        let cartItems = req.body.cartItems

        if (!cartItems.productId || !cartItems.quantity || cartItems.quantity < 0) {
             res.status(400).json({ message: "Invalid product ID or quantity", error: true })
             return;
        }


        let product = await ProductModel.findById(cartItems.productId)

        if (!product) {
             res.status(404).json({ message: "Product not found", error: true });
             return;
        }

        if ((product?.availableStocks || 0) < cartItems.quantity) {
             res.status(400).json({ message: "Not Available stocks", error: true })
             return;
        }

        let userCartExists = await CartModel.findOne({ userId: user._id })

        // if(!userExists)  res.status(404).json({ message: "User Not Available ", error: true })

        if (!userCartExists) {
            userCartExists = await CartModel.create({
                userId: user._id,
                items: [{ productId: cartItems.productId, quantity: cartItems.quantity, price: cartItems.price }]
            })
        }
        else {
            let itemExists = userCartExists.items.find(item => item.productId.toString() === cartItems.productId.toString())

            if (itemExists) {
                if (product.availableStocks < itemExists.quantity + cartItems.quantity) {
                     res.status(400).json({ message: "Exceeds available stock", error: true })
                     return;
                }
                itemExists.quantity += cartItems.quantity

            } else {
                userCartExists.items.push({ productId: cartItems.productId, quantity: cartItems.quantity, price: cartItems.price })
            }
        }

        await userCartExists.save()
            product.availableStocks -= cartItems.quantity
            await product.save()
        


         res.status(200).json({message:"Item added to cart Successfully", ok:true, })
         return;
    }
    catch (error) {
        if(error instanceof Error){
            console.log("error from addToCart", error.message)
            res.status(400).json({ message: error.message, error: true, ok: false })
            return;
        }
    }
}


const searchProducts = async (req: Request, res: Response) => {

    try {
        if (!req.query.search) {
            return res.status(400).json({ message: "Search Box is Empty", error: true, ok: false })
        }

        let productName = req.query.search as string;

        let filter = req.query.filter as string | undefined;

        let productRegex = new RegExp(productName, "i")

        let product: Record<string, any> = { productName: { $regex: productRegex } };

        if (filter) {
            let parsedFilter = JSON.parse(filter)

            if (parsedFilter && Object.keys(parsedFilter).length) {

                if (parsedFilter.category && Array.isArray(parsedFilter.category)) {
                    product.category = { $in: parsedFilter.category }
                }

                if (parsedFilter.Min || parsedFilter.Max) {
                    if (parsedFilter.Max) product.Min.$gte = parsedFilter.Max
                    if (parsedFilter.Min) product.Min.$gte = parsedFilter.Min
                }

                if (parsedFilter.availability.length) {
                    product.availability = { $in: parsedFilter.availability }
                }

                if (parsedFilter.sizes.length) {
                    product.sizes = { $in: parsedFilter.sizes }
                }

                if (parsedFilter.colors.length) {
                    product.colors = { $in: parsedFilter.colors }
                }

            }
        }

        let data = await ProductModel.find(product)

        if (!data.length) {
            return res.status(402).json({ message: "No Proudcts Available", error: true, ok: false })
        }

        return res.status(200).json({ message: "Products Fetched successfully", error: true, ok: false })

    }
    catch (error) {
        console.log("error from addToCart", addToCart)
        res.status(400).json({ message: "", error: true, ok: false })
    }
}


const filterProducts = async (req: Request, res: Response) => {
    try {

    }
    catch (error) {
        console.log("error from addToCart", addToCart)
        res.status(400).json({ message: "", error: true, ok: false })
    }
}


export {
    searchProducts,
    addToCart,
    filterProducts
}