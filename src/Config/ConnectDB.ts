import mongoose from 'mongoose'


const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING as string);
    }
    catch(error){
        if(error instanceof Error)
        console.log(error.message);
    }

}

export default connectDB;