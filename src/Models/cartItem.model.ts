// import mongoose, { Document, Schema } from "mongoose";

// interface ICartItem {
//     productId: mongoose.Schema.Types.ObjectId;
//     quantity: number;
//     price: number;
// }

// export interface ICart extends Document {
//     userId: mongoose.Schema.Types.ObjectId;
//     items: ICartItem[];
//     // total: number;
// }

// const CartSchema = new Schema<ICart>({
//     userId: { type: mongoose.Types.ObjectId, required: true, ref: "UserModel" },
//     items: [
//         {
//             productId: { type: mongoose.Types.ObjectId, required: true, ref: "ProductModel" },
//             quantity: { type: Number, required: true, min: 1 },
//             price: { type: Number, required: true },
//         },
//     ],
//     // total: { type: Number, required: true, default: 0 },
// });

// const CartModel = mongoose.model<ICart>("Cart", CartSchema);
// export default CartModel;


import mongoose, { Document , Schema} from 'mongoose';

interface Items {
    productId: mongoose.Schema.Types.ObjectId,
            quantity: number,
            price:number,
}

interface ICart extends Document{
    userId: mongoose.Schema.Types.ObjectId
    items: Items[]
    // total:number
}


const CartSchema = new Schema<ICart>({
    userId: {type: mongoose.Types.ObjectId,required:true, ref:"UserModel"},
    items:[
        {
            productId: {type:mongoose.Types.ObjectId, required:true ,ref:"ProductModel"},
            price:{type:Number, required:true},
            quantity:{type:Number, min:1, required:true}
        }
    ],
    // total:{type:Number}
})


const CartModel = mongoose.model<ICart>("CartModel", CartSchema)

export default CartModel;
