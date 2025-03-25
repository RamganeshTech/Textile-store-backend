import mongoose from 'mongoose'

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING as string);
        console.log(process.env.MONGODB_CONNECTIONSTRING)
        console.log("db connected")
    }
    catch(error){
        if (error instanceof Error) {
            console.error("Error connecting to the database:", error.message);
          } else {
            console.error("Unknown error while connecting to the database.");
          }
    }
 
}

export default connectDB;