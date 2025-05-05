import { Request, Response } from "express";
import ProductModel, { SizeVariant } from '../Models/products.model.js';

import cloudinary from '../Config/cloudinary.js';
import fs from 'fs';

import path from 'path';
import { uploadImageToS3 } from "../Utils/s3upload.js";


export interface InputSizeVariant {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  colors: ColorsList[];
}

export interface ColorsList {
  color: string;
  availableStock: number;
  images: String[]
}


// CLOUDINARY PART
//  const uploadImage = async (req: Request, res: Response) => {
//   try {
//     const files = req.files as Express.Multer.File[];

//     if (!files || files.length === 0) {
//       return res.status(400).json({ message: 'No files uploaded', ok: false });
//     }

//     const uploadedImages = await Promise.all(
//       files.map(async (file) => {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: 'bmbfashion',
//           transformation: [
//             { width: 800, height: 800, crop: 'limit' },  // Resize image (optional)
//             { quality: 'auto' }, // Auto-quality compression
//             { fetch_format: 'auto' },  // Automatically convert to WebP or other formats
//           ],
//         });

//         fs.unlinkSync(file.path); // Delete temp file after upload
//         return {
//           url: result.secure_url,
//           public_id: result.public_id,
//         };
//       })
//     );

//     res.status(200).json({
//       message: 'Images uploaded successfully',
//       images: uploadedImages, // this is an array of { url, public_id }
//       ok: true
//     });

//     // const result = await cloudinary.uploader.upload(file.path, {
//     //   folder: 'bmbfashion', // your folder in cloudinary
//     // });

//     // // delete the local file after upload
//     // fs.unlinkSync(file.path);

//     // res.status(200).json({
//     //   message: 'Image uploaded successfully',
//     //   url: result.secure_url,
//     //   public_id: result.public_id,
//     // });

//   } catch (error) {
//     console.log("Image upload failed", error)
//     res.status(500).json({ message: 'Image upload failed', error });
//   }
// };


//  const createProduct = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       productName,
//       price,
//       description,
//       category,
//       sizeVariants,
//     } = req.body;

//     // expected to be an array of
//     //  [{ size:"s", 
//     // colors: [
//     //         { color:"red", 
//     //           availableStock:"10",
//     //           images: ["file1", "file2"]
//     //          }
//     //          ]
//     //  }]



//     if (!productName || !price || !description || !category) {
//       res.status(400).json({ message: "all fields must be filled", error: true, ok: false })
//       return;
//     }

//     if (!sizeVariants.every((size: any) => Object.entries(size).every(([key, value]) => size[key]))) {
//       res.status(400).json({ message: "size must be provided", error: true, ok: false })
//       return;
//     }


//     // [{ size:"s", 
//     // colors: [
//     //         { color:"red", 
//     //           availableStock:"10",
//     //           images: ["file1", "file2"]
//     //          }
//     //          ]
//     //  }]
//     let colorVariants: any = [];





//     sizeVariants.forEach((item: InputSizeVariant) => {
//       item.colors.forEach((colorItem: ColorsList) => {

//         if (colorItem.availableStock <= 0 || !colorItem.color) {
//           res.status(400).json({ message: "available stock should be atleast above zero", error: true, ok: false })
//           return;
//         }

//         // const singleColorVariant = {
//         //   color: colorItem.color,
//         //   images: [...colorItem.images]
//         // };
//         // colorVariants.push(singleColorVariant)
//         // console.log("singleColorVariant",singleColorVariant)
//         const imageUrls = colorItem.images.map((img: any) => img.url); // extract only URLs

//         const singleColorVariant = {
//           color: colorItem.color,
//           images: imageUrls
//         };

//         colorVariants.push(singleColorVariant);

//       });
//     })


//     const newProduct = await ProductModel.create({
//       productName,
//       price,
//       description,
//       reviewStar: 0,
//       category,
//       colorVariants,
//       sizeVariants,

//       // [
//       //   {
//       //     size: "M",
//       //     colors: [
//       //       { color: "Red", availableStock: 10 },
//       //       { color: "Blue", availableStock: 5 }
//       //     ]
//       //   },
//       //   {
//       //     size: "L",
//       //     colors: [
//       //       { color: "Green", availableStock: 8 }
//       //     ]
//       //   }
//       // ],
//     });

//     // await newProduct.save();

//     res.status(201).json({
//       message: "Product created successfully!",
//       data: newProduct,
//       ok: true,
//       error: false,
//     });
//   } catch (error) {
//     console.error("Error creating product:", error);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: true,
//       ok: false,
//     });
//   }
// };

const uploadImage = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    // console.log('Received file:', files.originalname, files.mimetype); // Check file mime type and name

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedUrls = await Promise.all(
      files.map(file => uploadImageToS3(file))
    );

    res.status(200).json({ images: uploadedUrls });
  } catch (error) {
    console.log("Image upload failed", error)
    res.status(500).json({ message: 'Image upload failed', error , ok:false});
  }
};

const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      productName,
      price,
      description,
      category,
      sizeVariants,
    } = req.body;


    // expected to be an array of
    //  [{ size:"s", 
    // colors: [
    //         { color:"red", 
    //           availableStock:"10",
    //           images: ["file1", "file2"]
    //          }
    //          ]
    //  }]

    
    if (!productName || !price || !description || !category) {
      res.status(400).json({ message: "all fields must be filled", error: true, ok: false })
      return;
    }
    
    // previous version of cheking size avaible or not
    // if (!sizeVariants.every((size: any) => Object.entries(size).every(([key, value]) => size[key]))) {
    //   res.status(400).json({ message: "size must be provided", error: true, ok: false })
    //   return;
    // }
    
    
    const sizeSet = new Set();
    const isValid = sizeVariants.every((variant: SizeVariant) => {
      // 1. Check size exists
      if (!variant.size) {
        res.status(400).json({ message: "Size must be provided", error: true, ok: false });
        return false;
      }
    
      // 2. Check duplicate sizes
      if (sizeSet.has(variant.size)) {
        res.status(400).json({ message: `Duplicate size found: ${variant.size}`, error: true, ok: false });
        return false;
      }
      sizeSet.add(variant.size);
    
      // 3. Check colors array exists and has at least one valid color with available stock > 0
      if (!variant.colors || variant.colors.length === 0) {
        res.status(400).json({ message: `Size ${variant.size} must have at least one color`, error: true, ok: false });
        return false;
      }
    
      const hasAtLeastOneValidColor = variant.colors.some(colorItem => colorItem.color && colorItem.availableStock > 0);
      
      if (!hasAtLeastOneValidColor) {
        res.status(400).json({ message: `Size ${variant.size} must have at least one color with available stock`, error: true, ok: false });
        return false;
      }
    
      return true; // everything ok for this variant
    });


    if (!isValid) {
      return;
    }
    
    

    // let colorVariants: any = [];

    // sizeVariants.forEach((item: InputSizeVariant) => {
    //   item.colors.forEach((colorItem: ColorsList) => {

    //     if (colorItem.availableStock <= 0 || !colorItem.color) {
    //       res.status(400).json({ message: "available stock should be atleast above zero", error: true, ok: false })
    //       return;
    //     }

    //     const imageUrls = colorItem.images.map((img: any) => img.url); 

    //     const singleColorVariant = {
    //       color: colorItem.color,
    //       images: imageUrls
    //     };

    //     colorVariants.push(singleColorVariant);

    //   });
    // })


    const colorVariants = sizeVariants.reduce((acc: any[], item:any) => {
      for (const colorItem of item.colors) {
        if (!colorItem.color || colorItem.availableStock <= 0) {
          // Early error return
          res.status(400).json({ message: `Color '${colorItem.color || "Unknown"}' in size '${item.size}' must have available stock atleast one`, error: true, ok: false });
          return acc; // Return early to stop further execution
        }
    
        acc.push({
          color: colorItem.color,
          images: colorItem.images
        });
      }
      return acc; 
    }, []);

    const newProduct = await ProductModel.create({
      productName,
      price,
      description,
      reviewStar: 0,
      category,
      colorVariants,
      sizeVariants,
    });
    
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

    res.status(201).json({
      message: "Product created successfully!",
      data: newProduct,
      ok: true,
      error: false,
    });


  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: true,
      ok: false,
    });
  }
};

const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.find(); // Fetch all products

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found", data: [], ok: false, error: true });
    }

    return res.status(200).json({ message: "Products retrieved successfully", data: products, ok: true, error: false });
  } catch (error) {

    if (error instanceof Error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message, ok: false });
      return;
    }
  }
};


const editProducts = async (req: Request, res: Response) => {
  try {
    let { productId } = req.params
    let { productName, description, price, sizeVariants, category } = req.body

    if (!productId) {
      res.status(404).json({ message: "productId not Found", error: true, ok: false })
      return;
    }

    let product = await ProductModel.findById(productId)

    if (!product) {
      res.status(404).json({ message: "product not available", error: true, ok: false })
      return;
    }

    if (productName) {
      product.productName = productName
    }

    if (description) {
      product.description = description
    }

    if (price) {
      product.price = price
    }

    if (category) {
      product.category = category
    }

    if(sizeVariants.length){
      // let colorVariants: any = [];

      // sizeVariants.forEach((item: InputSizeVariant) => {
      //   item.colors.forEach((colorItem: ColorsList) => {
  
      //     if (colorItem.availableStock <= 0 || !colorItem.color) {
      //       res.status(400).json({ message: "available stock should be atleast above zero", error: true, ok: false })
      //       return;
      //     }
  
      //     const imageUrls = colorItem.images // extract only URLs
  
      //     const singleColorVariant = {
      //       color: colorItem.color,
      //       images: imageUrls
      //     };
  
      //     colorVariants.push(singleColorVariant);
  
      //   });
      // })

      const sizeSet = new Set();
      const isValid = sizeVariants.every((variant: SizeVariant) => {
        // 1. Check size exists
        if (!variant.size) {
          res.status(400).json({ message: "Size must be provided", error: true, ok: false });
          return false;
        }
      
        // 2. Check duplicate sizes
        if (sizeSet.has(variant.size)) {
          res.status(400).json({ message: `Duplicate size found: ${variant.size}`, error: true, ok: false });
          return false;
        }
        sizeSet.add(variant.size);
      
        // 3. Check colors array exists and has at least one valid color with available stock > 0
        if (!variant.colors || variant.colors.length === 0) {
          res.status(400).json({ message: `Size ${variant.size} must have at least one color`, error: true, ok: false });
          return false;
        }
      
        const hasAtLeastOneValidColor = variant.colors.some(colorItem => colorItem.color && colorItem.availableStock > 0);
        
        if (!hasAtLeastOneValidColor) {
          res.status(400).json({ message: `Size ${variant.size} must have at least one color with available stock`, error: true, ok: false });
          return false;
        }
      
        return true; // everything ok for this variant
      });
  
  
      if (!isValid) {
        return;
      }
      
      
  
      // let colorVariants: any = [];
  
      // sizeVariants.forEach((item: InputSizeVariant) => {
      //   item.colors.forEach((colorItem: ColorsList) => {
  
      //     if (colorItem.availableStock <= 0 || !colorItem.color) {
      //       res.status(400).json({ message: "available stock should be atleast above zero", error: true, ok: false })
      //       return;
      //     }
  
      //     const imageUrls = colorItem.images.map((img: any) => img.url); 
  
      //     const singleColorVariant = {
      //       color: colorItem.color,
      //       images: imageUrls
      //     };
  
      //     colorVariants.push(singleColorVariant);
  
      //   });
      // })
  
  
      const colorVariants = sizeVariants.reduce((acc: any[], item:any) => {
        for (const colorItem of item.colors) {
          if (!colorItem.color || colorItem.availableStock <= 0) {
            // Early error return
            res.status(400).json({ message: `Color '${colorItem.color || "Unknown"}' in size '${item.size}' must have available stock atleast one`, error: true, ok: false });
            return acc; // Return early to stop further execution
          }
      
          acc.push({
            color: colorItem.color,
            images: colorItem.images
          });
        }
        return acc; 
      }, []);
  

      product.sizeVariants = sizeVariants
      product.colorVariants = colorVariants
    }

    let data = await product.save()

    res.status(200).json({ message: "changes made to the product", data, ok: true, error: false })
  }
  catch (error) {
    if (error instanceof Error) {
      console.error("Error editing products:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message, ok: false });
      return;
    }
  }
}

const deleteProduct = async (req:Request, res:Response)=>{
  try{
    let {productId} = req.params

    if (!productId) {
      res.status(404).json({ message: "productId not Found", error: true, ok: false })
      return;
    }

    let product = await ProductModel.findById(productId)

    if (!product) {
      res.status(404).json({ message: "product not available", error: true, ok: false })
      return;
    }

    let data = await ProductModel.findByIdAndDelete(productId, {returnDocument:"after"})

    res.status(200).json({message:"product Deleted Successfully", ok:true, error:false, data})
  }
  catch(error){
    if(error instanceof Error){
      console.error("Error deleting products:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message, ok: false });
      return;
    }
  }
}

export { getAllProducts, editProducts, deleteProduct, uploadImage, createProduct }