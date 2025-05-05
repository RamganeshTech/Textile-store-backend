import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  message: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const OfferSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false, // Optional: In case you want to show an image in popup
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const OfferModel = mongoose.models.OfferSchema || mongoose.model<IOffer>('OfferModel', OfferSchema);
export default OfferModel;
