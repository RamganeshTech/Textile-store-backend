import express , {request, response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import connectDB from './Config/ConnectDB.js';

import userRoute from './Routes/userauth.route.js'
import productRoute from './Routes/product.route.js'
import cartRoute from './Routes/usercart.routes.js'
import favouriteRoute from './Routes/userfavourite.route.js'
import reviewRoute from './Routes/review.routes.js'
import profileRoute from './Routes/userprofile.routes.js'
import paymentRoute from './Routes/paymnet.routes.js'

import fs from 'fs';
import path from 'path';
dotenv.config()

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express()
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


app.use('/api', userRoute)
app.use('/api', productRoute)
app.use('/api', cartRoute)
app.use('/api', favouriteRoute)
app.use('/api', reviewRoute)
app.use('/api', profileRoute)
// app.use('/api', paymentRoute)

const uploadsPath = path.join(__dirname, 'temp_uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`Created folder: ${uploadsPath}`);
}


connectDB().then(()=>{
  app.listen(3000, ()=>{
    console.log("Server running on http://localhost:3000")
  })
})
.catch((error:Error)=>{
    console.log("error in promise of DB connection",error.message)
})