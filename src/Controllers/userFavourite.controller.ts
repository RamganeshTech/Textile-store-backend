import { Request, Response } from 'express';
import FavouriteModel from '../Models/Favourite.model.js';
import ProductModel from '../Models/products.model.js';
import { AuthenticatedRequest } from '../Types/types.js';


let allowedSize = [
    "S",
    "M",
    "L",
    "XL",
    "XXL"
]

// const addToFavourites = async (req: Request, res: Response): Promise<void> => {
//     try {

//         let user = (req as AuthenticatedRequest).user;

//         let {
//             productId,
//             size,
//             color
//         } = req.body;

//         if (!productId) {
//             res.status(400).json({ message: "select product to add in the favourite items", error: true, ok: false })
//             return;
//         }

//         if (!allowedSize.includes(size)) {
//             res.status(400).json({ message: "select proper size", error: true, ok: false })
//             return;
//         }

//         let product = await ProductModel.findById(productId);

//         if (!product) {
//             res.status(404).json({ message: "Product not found", error: true, ok: false });
//             return;
//         }

//         if (!product.availableSizes.includes(size)) {
//             res.status(400).json({ message: "Size not available", error: true, ok: false })
//             return;
//         }

//         if (!product.availableColors.includes(color)) {
//             res.status(400).json({ message: "color not available", error: true, ok: false })
//             return;
//         }

//         let userFavouriteList = await FavouriteModel.findOne({ userId: user._id })
//         let data;
//         console.log(userFavouriteList)
//         if (!userFavouriteList) {
//             data = await FavouriteModel.create({
//                 userId: user._id,
//                 items: [{ productId, size, color }]
//             })
//         }
//         else {
//             let isExists = userFavouriteList.items.find(item => item.productId.toString() === productId)

//             if (isExists) {
//                 console.log("isExists", isExists)
//                 if (isExists.color === color && isExists.size === size) {
//                     res.status(400).json({ message: "Product already added to favourites", error: true, ok: false });
//                     return;
//                 }
//             }

//             // console.log("userFavouriteList", userFavouriteList)
//             userFavouriteList.items.push({
//                 productId,
//                 size,
//                 color
//             })

//             data = await userFavouriteList.save()
//         }

//         res.status(200).json({ message: "Product added to favourites", data, error: false, ok: true });
//         return;
//     }
//     catch (error) {
//         if (error instanceof Error) {
//             console.log("error from addToFavourites", error.message)
//             res.status(400).json({ message: error.message, error: true, ok: false })
//             return;
//         }
//     }
// }

const addToFavourites = async (req: Request, res: Response): Promise<void> => {
    try {
        let user = (req as AuthenticatedRequest).user;
        let { productId, size, color } = req.body;

        if (!productId || !size || !color) {
            res.status(400).json({
                message: "Please provide productId, size, and color",
                error: true,
                ok: false,
            });
            return;
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            res.status(404).json({
                message: "Product not found",
                error: true,
                ok: false,
            });
            return;
        }

        // ✅ Check if given size exists
        const sizeVariant = product.sizeVariants.find(variant => variant.size === size);
        if (!sizeVariant) {
            res.status(400).json({
                message: "Selected size is not available for this product",
                error: true,
                ok: false,
            });
            return;
        }

        // ✅ Check if color is available for that size
        const colorInSize = sizeVariant.colors.find(c => c.color === color);
        if (!colorInSize) {
            res.status(400).json({
                message: "Selected color is not available for this size",
                error: true,
                ok: false,
            });
            return;
        }

        // ✅ Get image for that color
        const colorVariant = product.colorVariants.find(cv => cv.color === color);
        const image = colorVariant?.images?.[0] || "";

        // Check if favourite already exists
        let userFavouriteList = await FavouriteModel.findOne({ userId: user._id });
        let data;

        if (!userFavouriteList) {
            data = await FavouriteModel.create({
                userId: user._id,
                items: [{ productId, size, color, image }],
            });
        } else {
            const isExists = userFavouriteList.items.find(
                item =>
                    item.productId.toString() === productId &&
                    item.size === size &&
                    item.color === color
            );

            if (isExists) {
                res.status(400).json({
                    message: "Product already added to favourites",
                    error: true,
                    ok: false,
                });
                return;
            }

            userFavouriteList.items.push({ productId, size, color, image });
            data = await userFavouriteList.save();
        }

        res.status(200).json({
            message: "Product added to favourites",
            data,
            error: false,
            ok: true,
        });
    } catch (error) {
        console.error("error from addToFavourites:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: true,
            ok: false,
        });
    }
};


// const removeFavouritesItems = async (req: Request, res: Response): Promise<void> => {
//     try {
//         let user = (req as AuthenticatedRequest).user;

//         let {
//             productId,
//             size,
//             color
//         } = req.body;

//         if (!productId) {
//             res.status(400).json({ message: "select product to  remove from the favourite items", error: true, ok: false })
//             return;
//         }

//         let product = await ProductModel.findById(productId);

//         if (!product) {
//             res.status(404).json({ message: "Product not found", error: true, ok: false });
//             return;
//         }

//         let isUserExists = await FavouriteModel.findOne({ userId: user._id })

//         if (!isUserExists) {
//             res.status(404).json({ message: "Favourite carts not found", error: true, ok: false });
//             return;
//         }

//         let isExists: any = isUserExists.items.find(item => item.productId.toString() === productId && item.color.toLowerCase() === color.toLowerCase() && item.size.toLowerCase() === size.toLowerCase())

//         if (!isExists) {
//             res.status(404).json({ message: "Favourite Item not found", error: true, ok: false });
//             return;
//         }


//         isUserExists.items = isUserExists.items.filter(item => item._id?.toString() !== isExists._id.toString())
//         await isUserExists.save()

//         res.status(200).json({ message: "Product removed from favourites", data: isUserExists, error: false, ok: true });
//         return;

//     }
//     catch (error) {
//         if (error instanceof Error) {
//             console.log("error from removeFavourites", error.message)
//             res.status(400).json({ message: error.message, error: true, ok: false })
//             return;
//         }
//     }
// }

const removeFavouritesItems = async (req: Request, res: Response): Promise<void> => {
    try {
        let user = (req as AuthenticatedRequest).user;
        let { productId, size, color } = req.body;

        if (!productId || !size || !color) {
            res.status(400).json({
                message: "Please provide productId, size, and color",
                error: true,
                ok: false,
            });
            return;
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            res.status(404).json({
                message: "Product not found",
                error: true,
                ok: false,
            });
            return;
        }

        const userFavourites = await FavouriteModel.findOne({ userId: user._id });
        if (!userFavourites) {
            res.status(404).json({
                message: "No favourites found for this user",
                error: true,
                ok: false,
            });
            return;
        }

        const targetItem = userFavourites.items.find(
            item =>
                item.productId.toString() === productId &&
                item.size.toLowerCase() === size.toLowerCase() &&
                item.color.toLowerCase() === color.toLowerCase()
        );

        if (!targetItem) {
            res.status(404).json({
                message: "Favourite item not found",
                error: true,
                ok: false,
            });
            return;
        }

        userFavourites.items = userFavourites.items.filter(
            item => item._id?.toString() !== targetItem._id?.toString()
        );

        await userFavourites.save();

        res.status(200).json({
            message: "Product removed from favourites",
            data: userFavourites,
            error: false,
            ok: true,
        });
    } catch (error) {
        console.error("Error from removeFavouritesItems:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: true,
            ok: false,
        });
    }
};



const getfavouriteItems = async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthenticatedRequest;
        if (!authReq.user) {
            res.status(401).json({ message: "Unauthorized: User not found", error: true });
            return;
        }
        const userId = authReq.user._id;
        const favouriteItem = await FavouriteModel.findOne({ userId }).populate("items.productId"); // Populates product details if needed


        console.log("favouriteItem", favouriteItem)


        if (!favouriteItem) {
            res.status(200).json({ message: "Favourite is empty", data: [] });
            return;
        }
        res.status(200).json({ message: "Favourite items retrieved successfully", data: favouriteItem });
    } catch (error) {
        console.error("Error retrieving favourite items:", error);
        res.status(500).json({ message: "Internal Server Error", error: true });
    }
}


export {
    addToFavourites,
    removeFavouritesItems,
    getfavouriteItems
}