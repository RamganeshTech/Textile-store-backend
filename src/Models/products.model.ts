import mongoose, { Document, Schema } from "mongoose";

interface IReview {
  username: string;
  comment: string;
  rating: number;
}

  // interface IColorVariant {
  //   color: string;
  //   availableStocks: number;
  //   images: string[];
  // }

  // interface ISizeVariant {
  //   size: string;
  //   colorVariants: IColorVariant[];
  // }

// export interface IProduct extends Document {
//   productName: string;
//   price: number;
//   size: string;
//   sizes: ISizeVariant[];
//   // color: string;
//   // availableColors: string[];
//   // availableStocks: number;
//   description: string;
//   reviews: IReview[];
//   reviewStar: number;
//   category?: string[];
// }


interface IProduct extends Document {
  productName: string;
  price: number;
  description: string;
  category?: string[];
  colorVariants: {
    color: string;
    images: string[];
  }[];
  sizeVariants: {
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
    colors: {
      color: string;
      availableStock: number;
    }[];
  }[];
  // reviews: IReview[];
  reviewStar: number;
}

// const reviewSchema = new Schema<IReview>({
//   username: { type: String, required: true },
//   comment: { type: String, required: true },
//   rating: { type: Number, required: true, min: 0, max: 5 },
// }); 

// Color Variant Schema (global color -> images)
const colorVariantSchema = new Schema({
  color: { type: String, required: true },
  images: { type: [String], required: true },
});

// Size Variant Schema (each size -> available colors and stock)
const sizeVariantSchema = new Schema({
  size: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    required: true,
  },
  colors: [
    {
      color: { type: String, required: true },
      availableStock: { type: Number, required: true },
    },
  ],
});

// Final Product Schema
const productSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: [String], default: [] },
    colorVariants: { type: [colorVariantSchema], default: [] },
    sizeVariants: { type: [sizeVariantSchema], default: [] },
    reviewStar: { type: Number, default: 0 },
  },
  { timestamps: true }
);
// Create Product Model
const ProductModel = mongoose.model<IProduct>("ProductModel", productSchema);

export default ProductModel;
