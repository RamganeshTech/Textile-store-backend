import mongoose, { Document, Schema } from "mongoose";

interface AdminModel extends Document{
    email:string,
    password:string,
}

const AdminSchema = new Schema<AdminModel>({
    email:{type:String, required:true},
    password:{type:String, required:true},
})

const AdminModel = mongoose.model<AdminModel>("AdminModel", AdminSchema)

export default AdminModel;