
import { Request } from "express";
export interface AuthenticatedRequest extends Request {
    user?: any; 
}

export interface AuthenticateAdminRequest extends Request {
    admin?:any
}