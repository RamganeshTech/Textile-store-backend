import express, { RequestHandler } from 'express';
import {loginUser, registerUser} from '../Controllers/user.controller.js'
let route = express.Router()



route.post('/userlogin', loginUser as RequestHandler);
route.post('/registeruser', registerUser as RequestHandler);
// route.post('/googlelogin', googleLogin as RequestHandler);


export default route;
