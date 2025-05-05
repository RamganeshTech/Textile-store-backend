import mongoose from 'mongoose'

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING as string, {
          maxPoolSize: 500, //maxlimit we can set is 65536
          // serverSelectionTimeoutMS: 10000, // Increase to 10 seconds if network is sometimes slow
          // socketTimeoutMS: 60000, // Increase to 60 seconds for complex queries
        });
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