import express , {request, response} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import connectDB from './Config/ConnectDB.js';

import userRoute from './Routes/userauth.route.js'
dotenv.config()

const app = express()
app.use(cors())
app.use(cookieParser())
app.use(express.json())



app.use('/api', userRoute)

connectDB().then(()=>{
  app.listen(3000, ()=>{
    console.log("Server running on http://localhost:3000")
  })
})
.catch((error:Error)=>{
    console.log("error in promise of DB connection",error.message)
})