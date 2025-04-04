import mongoose, { Document, Schema } from "mongoose";

interface Orders extends Document {
    // _id?:mongoose.Types.ObjectId;
    userId:mongoose.Types.ObjectId,
    productId:mongoose.Types.ObjectId,
    color:string,
    size:string,
    quantity:number
}


const OrderSchema = new Schema<Orders>({
    userId:{
        type:mongoose.Schema.Types.ObjectId, required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId, required:true
    },
    color:{
        type:String, required:true
    },
    size:{
        type:String, required:true
    },
    quantity:{
        type:Number, required:true
    }
}, {
    timestamps: true
})

const OrderModel = mongoose.model<Orders>('Order', OrderSchema)

export default OrderModel;