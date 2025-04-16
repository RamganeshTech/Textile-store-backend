import mongoose, { Document, Schema } from "mongoose";


interface SingleReview {
    _id?: mongoose.Schema.Types.ObjectId,
    userName: string,
    stars: number,
    description: string,
    userId:mongoose.Schema.Types.ObjectId,
}


interface ReviewType extends Document {
    productId: mongoose.Schema.Types.ObjectId,
    reviews: SingleReview[]
}


const ReviewSchema = new Schema<ReviewType>({
    productId: { type: mongoose.Schema.ObjectId, ref: "ProductModel" },
    reviews: [
        {
            userId:{type: mongoose.Schema.ObjectId, ref:"UserModel"},
            userName: { type: String },
            stars: { type: Number },
            description: { type: String }
        }
    ]
})
ReviewSchema.index({productId:1})
const ReviewModel = mongoose.model<ReviewType>('ReviewModel', ReviewSchema);

export default ReviewModel;
