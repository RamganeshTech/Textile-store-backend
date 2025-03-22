import express , {Response, Request} from "express";
import bcrypt from "bcrypt";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { UserModel } from "../Models/user.model.js";

// import admin from "../Config/firebaseAdmin.js";

interface AuthenticationRequest extends Request{
    cookies: {userAccessToken?:string}
}

interface RefreshTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}


const loginUser = async (req:AuthenticationRequest, res:Response)=>{
    try{
        let isTokenExists = req.cookies?.userAccessToken

        if(isTokenExists){
            return res.status(403).json({ error: true, message: "Already logged in", ok: false });
        }

        
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if both email and password are provided
    if (!email || !password) {
      return void res.status(400).json({
        error: true,
        message: "Email and password are required",
        ok: false,
      });
    }

    // Simulate credential verification (replace with real logic)
    if (email === "test@example.com" && password === "password123") {
      // Simulate token generation (replace with a real token, e.g., JWT)
      const accessToken = "dummyaccesstoken123";

      // Set cookie with the token (httpOnly for security)
      res.cookie("userAccessToken", accessToken, { httpOnly: true });

      return void res.status(200).json({
        error: false,
        message: "Login successful",
        ok: true,
      });
    } else {
      return void res.status(401).json({
        error: true,
        message: "Invalid credentials",
        ok: false,
      });
    }

    }
    catch(error){
        const err = error as Error;
        console.error(err.message);
        return void res.status(500).json({
          error: true,
          message: "Internal Server Error",
          ok: false,
        });
    }
}

const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userName, email, password, address, pincode, state, phoneNumber } = req.body;
  
      // Validate required fields
      if (!userName || !email || !password) {
        res.status(400).json({ error: true, message: "All fields are required" });
        return;
      }
  
      // Check if the email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        res.status(409).json({ error: true, message: "Email already exists" });
        return;
      }
  
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create user using create() method
      const newUser = await UserModel.create({
        userName,
        email,
        password: hashedPassword,
        address: address ? address : null,
        pincode: pincode ? pincode : null,
        state: state ? state : null,
        phoneNumber: phoneNumber ? phoneNumber : null
      });
  
      // Generate a JWT token for the new user
      const tokenPayload = { id: newUser._id, email: newUser.email };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  
      // Return success response with the token and minimal user info
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newUser._id,
          userName: newUser.userName,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error("Error in registerUser:", error);
      res.status(500).json({ error: true, message: "Internal server error" });
    }
  };

  // const googleLogin = async (req: Request, res: Response) => {
  //   try {
  //     const { idToken } = req.body;
  //     if (!idToken) {
  //       return res.status(400).json({ error: "ID token is required" });
  //     }
  
  //     // Verify ID token with Firebase
  //     const decodedToken = await admin.auth().verifyIdToken(idToken);
  //     const { email, name, uid } = decodedToken;
  
  //     if (!email) {
  //       return res.status(400).json({ error: "No email found in Google account" });
  //     }
  
  //     // Check if user already exists in DB
  //     let user = await UserModel.findOne({ email });
  
  //     if (!user) {
  //       // Create a new user if not found
  //       user = await UserModel.create({
  //         userName: name,
  //         email,
  //         password: null, // No password since it's Google Auth
  //         address: null,
  //         pincode: null,
  //         state: null,
  //         phoneNumber: null,
  //       });
  //     }
  
  //     // Generate a JWT token for the session
  //     const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET as string, {
  //       expiresIn: "1h",
  //     });
  
  //     res.status(200).json({ success: true, message: "Google login successful", token, user });
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // };

  const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get refresh token from request body (or you can also extract from cookies or headers)
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: true, message: "Refresh token is required" });
        return;
      }
  
      // Verify the refresh token using JWT_REFRESH_SECRET
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err: VerifyErrors | null, decoded: unknown) => {
        if (err instanceof Error) {
          return res.status(401).json({ error: true, message: "Invalid refresh token" });
        }
        // decoded should contain the payload we signed (e.g. userId and email)
        const payload = decoded as RefreshTokenPayload;
        // Optionally, you might want to check if the refresh token is in a database of valid tokens
  
        // Generate a new access token using JWT_SECRET
        const newAccessToken = jwt.sign(
          { userId: payload.userId, email: payload.email },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" } // Adjust the expiry as needed
        );
  
        return res.status(200).json({
          success: true,
          accessToken: newAccessToken,
        });
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({ error: true, message: "Internal server error" });
    }
  };


export {
    loginUser,
    registerUser,
    // googleLogin,
    refreshToken
} 