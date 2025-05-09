

import mongoose, { Document, Schema } from "mongoose";

interface IShippingAddress {
    userName: string;
    phoneNumber: string;
    addressLine1: string;
    // addressLine2?: string;
    landmark: string;
    district: string;
    state: string;
    pincode: string;
}

interface IProductItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    size?: string;
    color?: string;
    orderStatus:string;
}

interface IPaymentInfo {
    orderId: string;    // Razorpay order_id
    paymentId: string;  // Razorpay payment_id
    signature: string;  // Razorpay signature
    status: "pending" | "paid" | "failed";
}

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    products: IProductItem[];
    shippingAddress: IShippingAddress;
    totalAmount: number;
    paymentInfo: IPaymentInfo;
    orderStatus: "processing" | "shipped" | "delivered" | "cancelled";
    placedAt: Date;
}

const orderSchema: Schema = new Schema<IOrder>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductModel", required: true },
            quantity: { type: Number, required: true },
            size: {type: String},
            color: {type:String},
            orderStatus: {
                type: String,
                enum: ["processing", "shipped", "delivered", "cancelled"],
                default: "processing",
            },
        
        },
    ],

    shippingAddress: {
        userName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        addressLine1: { type: String, required: true },
        // addressLine2: { type: String },
        district: { type: String, required: true },
        landmark: { type: String },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },

    totalAmount: { type: Number, required: true },

    paymentInfo: {
        orderId: { type: String, required: true },
        paymentId: { type: String, required: false },
        signature: { type: String, required: false },
        status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
    },

    // orderStatus: {
    //     type: String,
    //     enum: ["processing", "shipped", "delivered", "cancelled"],
    //     default: "processing",
    // },

    placedAt: {
        type: Date,
        default: Date.now,
    },
});


const   OrderModel = mongoose.model<IOrder>("Order", orderSchema);
export default OrderModel;
