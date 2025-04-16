import mongoose , {Schema, Document} from "mongoose";

interface FavouriteItems {
    productId: mongoose.Types.ObjectId;
    // size:string;
    // color:string;
    _id?:mongoose.Types.ObjectId;
    image:string,
}

interface IFavourite extends Document {
    userId: mongoose.Types.ObjectId;
    items: FavouriteItems[]
}


const FavouriteSchema = new Schema<IFavourite>({
    userId:{type: mongoose.Schema.Types.ObjectId, ref:"UserModel"},
    items:[
        {
            productId: {type: mongoose.Schema.Types.ObjectId, ref:"ProductModel"},
            // size:{type:String},
            // color:{type:String},
            image:{type:String}
        }
    ]
})

FavouriteSchema.index({userId:1})

const FavouriteModel = mongoose.model<IFavourite>('FavouriteModel', FavouriteSchema)

export default FavouriteModel;
