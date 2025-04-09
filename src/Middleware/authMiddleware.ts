import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Request interface
interface AuthenticatedRequest extends Request {
    user?: any; // Define user property
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.useraccesstoken;

        if (!token) {
            res.status(401).json({ message: "Unauthorized: Please login", error: true });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        // console.log("decoded", decoded)
        req.user = decoded as Record<string, any>;

        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token", error: true });
        return;
    }
};

export { authMiddleware };