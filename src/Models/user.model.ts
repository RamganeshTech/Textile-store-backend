import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  address?: string | null;
  pincode?: string | null;
  state?: string | null;
  phoneNumber?: string | null;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, default: null },
    pincode: { type: String, default: null },
    state: { type: String, default: null },
    phoneNumber: { type: String, default: null }
  },
  {
    timestamps: true ,
    minimize: false
  }
);

export const UserModel = mongoose.model<IUser>('UserModel', UserSchema);
