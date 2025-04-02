import { Response, Request, RequestHandler } from 'express';
import ProductModel from '../Models/products.model.js';
import CartModel from '../Models/cartItem.model.js';
import { AuthenticatedRequest } from '../Types/types.js';


const addToCart: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {

        let user = (req as AuthenticatedRequest).user;

        let cartItems = req.body.cartItems

        console.log(cartItems)
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
        console.log(user)

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
        // product.availableStocks -= cartItems.quantity
        // await product.save()

        res.status(200).json({ message: "Item added to cart Successfully", data: userCartExists, ok: true, })
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error from addToCart", error)
            res.status(400).json({ message: error.message, error: true, ok: false })
            return;
        }
    }
}


const searchProducts = async (req: Request, res: Response) => {
    try {
        // if (!req.query.search) {
        //     return res.status(400).json({ message: "Search Box is Empty", error: true, ok: false })
        // }

        let productName = req.query.search as string;

        let filter = req.query.filter as string | undefined;

        // console.log(filter)
        let productRegex = new RegExp(productName, "i")

        let product: Record<string, any> = { productName: { $regex: productRegex } };
        let sort: { [key: string]: 1 | -1 } = {};

        if (filter) {
            let parsedFilter = JSON.parse(filter)
            console.log(parsedFilter)

            const hasFilterValues = Object.keys(parsedFilter).some(key => {
                const value = parsedFilter[key];
                if (Array.isArray(value)) {
                    return value.length > 0;
                }
                return value !== null && value !== undefined && value !== "";
            });

            if (hasFilterValues) {
                if (parsedFilter && Object.keys(parsedFilter).length) {

                    if (parsedFilter.category && Array.isArray(parsedFilter.category) && parsedFilter.category.length > 0) {
                        product.category = { $in: parsedFilter.category }
                    }

                    // 1ST OPTION
                    // if (parsedFilter.Min || parsedFilter.Max) {
                    //     if (parsedFilter.Max) product.price.$gte = parsedFilter.Max
                    //     if (parsedFilter.Min) product.price.$gte = parsedFilter.Min
                    // }

                    // 2ND OPTION
                    if (parsedFilter.Min || parsedFilter.Max) {
                        product.price = {}; // Define price object before using it

                        if (parsedFilter.Min) product.price.$gte = parsedFilter.Min; // Min price filter
                        if (parsedFilter.Max) product.price.$lte = parsedFilter.Max; // Max price filter
                    }

                    // 3RD OPTION
                    // if (parsedFilter.Min || parsedFilter.Max) {
                    //     let priceFilter: Record<string, any> = {};

                    //     if (parsedFilter.Min) priceFilter.$gte = parsedFilter.Min;
                    //     if (parsedFilter.Max) priceFilter.$lte = parsedFilter.Max;

                    //     if (Object.keys(priceFilter).length) {
                    //         product.price = priceFilter;
                    //     }
                    // }


                    // if (parsedFilter.availability.length) {
                    //     product.availability = { $in: parsedFilter.availability }
                    // }

                    if (parsedFilter.availability.length) {
                        if (parsedFilter.availability.includes("out of stock") && parsedFilter.availability.includes("in stock")) {
                            // If both are selected, show all products (no filter)

                        } else if (parsedFilter.availability.includes("out of stock")) {
                            // console.log("inside the parsedFilter of out of stock")
                            product.availableStocks = { $lte: 0 }  // Filter products where stocks are 0 or less
                        } else if (parsedFilter.availability.includes("in stock")) {
                            // console.log("inside the parsedFilter of in stock")
                            product.availableStocks = { $gt: 0 }  // Filter products where stocks are greater than 0
                            console.log(product)
                        }
                    }

                    if (parsedFilter.sizes.length) {
                        product.availableSizes = { $in: parsedFilter.sizes }
                    }

                    if (parsedFilter.colors.length) {
                        product.availableColors = { $in: parsedFilter.colors }
                    }

                    if (parsedFilter.arrival && parsedFilter.arrival.length) {
                       if (parsedFilter.arrival.includes("new arrival")) {
                            sort.createdAt = -1; // Newest products first
                            console.log(".inside teh new arrival")

                        } else if (parsedFilter.arrival.includes("old arrival")) {
                            console.log(".inside teh old arrival")
                            sort.createdAt = 1; // Oldest products first
                        }
                    }

                }
            }

        }

        console.log(sort)
        let data = await ProductModel.find(product).sort(sort)
        // let data = await ProductModel.find({}).sort({ createdAt: -1 });
        // let data = await ProductModel.find({}, { productName: 1, createdAt: 1 }).sort({ createdAt: -1 }).lean();
        console.log(data);


        if (!data.length) {
            return res.status(404).json({ message: "No Products Available", error: true, ok: false })
        }

        return res.status(200).json({ message: "Products Fetched successfully", data, error: false, ok: true })

    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error from searchProducts", error.message)
            res.status(400).json({ message: error.message, error: true, ok: false })
        }
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

const getCartItems: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ message: "Unauthorized: User not found", error: true });
            return;
        }
        const userId = authReq.user._id;
        const cart = await CartModel.findOne({ userId }).populate("items.productId"); // Populates product details if needed

        if (!cart) {
            res.status(200).json({ message: "Cart is empty", data: [] });
            return;
        }
        res.status(200).json({ message: "Cart items retrieved successfully", data: cart.items });
    } catch (error) {
        console.error("Error retrieving cart items:", error);
        res.status(500).json({ message: "Internal Server Error", error: true });
    }
};


const removeQuantity = async (req: Request, res: Response) => {
    try {
        let user = (req as AuthenticatedRequest).user
        let productId = req.params.id

        let { quantity } = req.body

        if (!productId) {
            res.status(400).json({ message: "Please the product to provide productId", error: true, ok: false })
            return;
        }

        let product = await ProductModel.findById(productId)

        if (!product) {
            res.status(404).json({ message: "Product not found", error: true, ok: false });
            return;
        }

        let userCart = await CartModel.findOne({ userId: user._id })

        if (!userCart) {
            res.status(404).json({ message: "UserCart not found", error: true, ok: false });
            return;
        }

        let cartItem = userCart.items.find(item => item.productId.toString() === productId);

        if (!cartItem) {
            res.status(404).json({ message: "Product not found in cart", error: true, ok: false });
            return;
        }

        cartItem.quantity = Math.max(cartItem.quantity - quantity, 0);
        await userCart.save()

        res.status(200).json({ message: "Product quantity reduced", data: userCart, error: false, ok: true });
        return;

    }
    catch (error) {
        console.error("Error retrieving cart items:", error);
        res.status(500).json({ message: "Internal Server Error", error: true });
    }
}


const removeCartItem = async (req: Request, res: Response) => {
    try {
        const user = (req as AuthenticatedRequest).user

        let productId = req.params.id

        if (!productId) {
            res.status(400).json({ message: "Please the product to provide productId", error: true, ok: false })
            return;
        }

        let product = await ProductModel.findById(productId)

        if (!product) {
            res.status(404).json({ message: "Product not found", error: true, ok: false });
            return;
        }

        let userCart = await CartModel.findOne({ userId: user._id })

        if (!userCart) {
            res.status(404).json({ message: "UserCart not found", error: true, ok: false });
            return;
        }



        let isMatching = userCart.items.find(item => item.productId.toString() === productId)

        if (!isMatching) {
            res.status(404).json({ message: "Product not found in cart", error: true, ok: false });
            return;
        }

        // let data = await CartModel.findByIdAndDelete(isMatching.productId, { returnDocument: "after" })

        // res.status(200).json({ message: "Product deleted from cart successfully", data,  error: false, ok: true });
        // return;


        userCart.items = userCart.items.filter(item => item.productId.toString() !== isMatching.productId.toString())
        await userCart.save()

        res.status(200).json({ message: "Product removed from cart", data: userCart, error: false, ok: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error from addToCart", error.message)
            res.status(400).json({ message: error.message, error: true, ok: false })
            return;
        }
    }


}


export {
    searchProducts,
    addToCart,
    filterProducts,
    getCartItems,
    removeCartItem,
    removeQuantity
}