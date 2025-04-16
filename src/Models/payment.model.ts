import mongoose, { Document, Schema } from 'mongoose';

interface IPayment extends Document {
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  status: 'PENDING' | 'PAYMENT_SUCCESS' | 'PAYMENT_ERROR';
  phonepeResponse: Record<string, any>;
}

const paymentSchema: Schema<IPayment> = new Schema(
  {
    merchantTransactionId: {
      type: String,
      required: true,
      unique: true,
    },
    merchantUserId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAYMENT_SUCCESS', 'PAYMENT_ERROR'],
      default: 'PENDING',
    },
    phonepeResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // automatically adds `createdAt` and `updatedAt` fields
  }
);


paymentSchema.index({merchantTransactionId:1})

const PaymentModel = mongoose.model<IPayment>('PaymentModel', paymentSchema);

export default PaymentModel;
