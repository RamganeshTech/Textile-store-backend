import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  address?: string | null;
  pincode?: string | null;
  state?: string | null;
  phoneNumber?: string | null;
  resetPasswordToken?: string;  // Store the reset token here
  resetPasswordExpire?: number; // Store the expiration time here
}

const UserSchema: Schema<IUser> = new Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, default: null },
    pincode: { type: String, default: null },
    state: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    resetPasswordToken: { type: String },  // Token for password reset
    resetPasswordExpire: { type: Number },  // Expiration time for the reset token
  },
  {
    timestamps: true ,
    minimize: false
  }
);

export const UserModel = mongoose.model<IUser>('UserModel', UserSchema);
