import mongoose, { Document, Schema } from "mongoose";

interface IReview {
  username: string;
  comment: string;
  rating: number;
}

// Define Product Type
export interface IProduct extends Document {
  productName: string;
  price: number;
  size: string;
  availableSizes: string[];
  color: string;
  availableColors: string[];
  availableStocks: number;
  images: string[];
  description: string;
  reviews: IReview[];
  reviewStar: number;
  category?: string[];
}

// Create Review Schema
const reviewSchema = new Schema<IReview>({
  username: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
}); 

// Create Product Schema
const productSchema = new Schema<IProduct>({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  availableSizes: { type: [String], required: true },
  color: { type: String, required: true },
  availableColors: { type: [String], required: true },
  availableStocks: { type: Number, required: true },
  images: { type: [String], required: true },
  description: { type: String, required: true },
  reviews: { type: [reviewSchema], default: [] },
  reviewStar: { type: Number, default: 0 },
  category: { type: [String], default: [] }, // ✅ Ensure category is always an array
});

// Create Product Model
const ProductModel = mongoose.model<IProduct>("ProductModel", productSchema);

export default ProductModel;
