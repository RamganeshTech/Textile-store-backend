import { Request, Response } from "express";
import ProductModel from '../Models/products.model.js';

// export const createProduct = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       productName,
//       price,
//       // size,
//       availableSizes,
//       // color,
//       imageUrls,
//       availableColors,
//       availableStocks,
//       description,
//       category,
//     } = req.body;

// //     // req.files will contain the uploaded files by multer-s3
// //     const files = req.files as Express.Multer.File[];
// //     // Each file object from multer-s3 has a `location` property containing the S3 URL
// //     const imageUrls = files.map(file => file.location);

//     // Create a new product document. Here we assume that availableSizes, availableColors, and category are sent as CSV strings.
//     const newProduct = new ProductModel({
//       productName,
//       price,
//       // size,
//       availableSizes: availableSizes ? availableSizes.split(",") : [],
//       // color,
//       availableColors: availableColors ? availableColors.split(",") : [],
//       availableStocks,
//       images: imageUrls, // Save the S3 URLs for the images
//       description,
//       category: category ? category.split(",") : [],
//     });

//     await newProduct.save();

//     res.status(201).json({ message: "Product created successfully!", product: newProduct });
//   } catch (error) {
//     console.error("Error creating product:", error);
//     res.status(500).json({ message: "Internal Server Error", error: true });
//   }
// };



export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      productName,
      price,
      description,
      category,
      colorVariants,   // expected to be an array of { color, images }
      sizeVariants ,    // expected to be an array of { size, colors: [{ color, availableStock }] }
      reviewStar,
    } = req.body;

    // If no colorVariants are sent, assign random placeholder images to some default colors
    // const defaultColors = ["Red", "Blue", "Green", "Black"];
    // const defaultColorVariants = defaultColors.map((color, index) => ({
    //   color,
    //   images: [
    //     `https://picsum.photos/200/300?random=${index + 1}`,
    //     `https://picsum.photos/200/300?random=${index + 10}`
    //   ]
    // }));

    const newProduct = await ProductModel.create({
      productName,
      price,
      description,
      reviewStar : 0,
      category,
      colorVariants,
      sizeVariants,

      // [
      //   {
      //     size: "M",
      //     colors: [
      //       { color: "Red", availableStock: 10 },
      //       { color: "Blue", availableStock: 5 }
      //     ]
      //   },
      //   {
      //     size: "L",
      //     colors: [
      //       { color: "Green", availableStock: 8 }
      //     ]
      //   }
      // ],
    });

    // await newProduct.save();

    res.status(201).json({
      message: "Product created successfully!",
      data: newProduct,
      ok:true,
      error:false,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: true,
      ok:false,
    });
  }
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
      const products = await ProductModel.find(); // Fetch all products

      if (products.length === 0) {
          return res.status(200).json({ message: "No products found", data:[], ok:false, error:true  });
      }

      return res.status(200).json({ message: "Products retrieved successfully", data:products, ok:true, error:false });
  } catch (error) {
    
    if (error instanceof Error) {
      console.error("Error fetching products:", error);
       res.status(500).json({ message: "Internal Server Error", error: error.message , ok:false});
      return;
  }
    }
};

export {getAllProducts}