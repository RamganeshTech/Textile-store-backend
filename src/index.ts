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
dotenv.config()

const app = express()
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())


app.use('/api', userRoute)
app.use('/api', productRoute)
app.use('/api', cartRoute)
app.use('/api', favouriteRoute)
app.use('/api', reviewRoute)

connectDB().then(()=>{
  app.listen(3000, ()=>{
    console.log("Server running on http://localhost:3000")
  })
})
.catch((error:Error)=>{
    console.log("error in promise of DB connection",error.message)
})