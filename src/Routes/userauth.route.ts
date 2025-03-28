import express, { RequestHandler } from 'express';
import {loginUser, registerUser, refreshToken, forgotPassword, logout} from '../Controllers/userauth.controller.js'
let route = express.Router()



route.post('/auth/userlogin', loginUser as RequestHandler);
route.post('/auth/registeruser', registerUser as RequestHandler);
route.post('/auth/refreshtoken', refreshToken as RequestHandler);
route.post('/auth/forgotpassword',  forgotPassword as RequestHandler);
route.post('/auth/logout',  logout as RequestHandler);
// route.post('/googlelogin', googleLogin as RequestHandler);


export default route;
