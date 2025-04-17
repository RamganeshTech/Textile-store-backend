import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { AuthenticateAdminRequest } from "../Types/types.js";




const authAdminMiddleware = async (req:AuthenticateAdminRequest, res:Response, next:NextFunction)=>{
    try{
       let token =  req.cookies.adminaccesstoken

       if(!token){
        res.status(401).json({ message: "Unauthorized: Please login", error: true });
        return;
       }

       const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET as string)

       req.admin = decoded as Record<string , any>;
       next();
    }
    catch(error){
        res.status(403).json({ message: "Invalid or expired token", error: true });
        return;
    }
}

export default authAdminMiddleware;