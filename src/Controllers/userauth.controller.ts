import express , {Response, Request} from "express";
import bcrypt from "bcrypt";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { UserModel } from "../Models/user.model.js";
import sendResetEmail from "../Utils/forgotPasswordMail.js";
import crypto from 'crypto'
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

    let user = await UserModel.findOne({email})

    if(!user){
      return res.status(404).json({  error: true,
        message: "invalid credentials",
        ok: false,})
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({  error: true,
        message: "invalid credentials",
        ok: false,});
    }

    // Simulate credential verification (replace with real logic)
    if (user) {
      // Simulate token generation (replace with a real token, e.g., JWT)

      // Set cookie with the token (httpOnly for security)
      const accessToken = jwt.sign({_id: user._id}, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      const refreshtoken = jwt.sign({_id: user._id}, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
      
      res.cookie("userrefreshtoken", refreshtoken, {httpOnly:true, maxAge:1000 * 60 * 60 * 24 * 7})

      res.cookie("useraccesstoken", accessToken, { httpOnly: true, maxAge:1000 * 60 * 60});

      return void res.status(200).json({
        error: false,
        message: "Login successful",
        ok: true,
        user:{userId: user._id, userName:user.userName, email, password}
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
      const tokenPayload = { _id: newUser._id};
      const accesstoken = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      const refreshtoken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

      res.cookie("useraccesstoken", accesstoken, {httpOnly:true, maxAge:1000 * 60 * 5})
      res.cookie("userrefreshtoken", refreshtoken, {httpOnly:true, maxAge:1000 * 60 * 60 * 24 * 7})
  
      // Return success response with the token and minimal user info
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        accesstoken,
        user: {
          _id: newUser._id,
          userName: newUser.userName,
          email: newUser.email,
          password:newUser.password
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
    // try {
    //   // Get refresh token from request body (or you can also extract from cookies or headers)
      
    //   const { refreshToken } = req.body;
    //   if (!refreshToken) {
    //     res.status(400).json({ error: true, message: "Refresh token is required" });
    //     return;
    //   }
  
    //   // Verify the refresh token using JWT_REFRESH_SECRET
    //   jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err: VerifyErrors | null, decoded: unknown) => {
    //     if (err instanceof Error) {
    //       return res.status(401).json({ error: true, message: "Invalid refresh token" });
    //     }
    //     // decoded should contain the payload we signed (e.g. userId and email)
    //     const payload = decoded as RefreshTokenPayload;
    //     // Optionally, you might want to check if the refresh token is in a database of valid tokens
  
    //     // Generate a new access token using JWT_SECRET
    //     const newAccessToken = jwt.sign(
    //       { userId: payload.userId, email: payload.email },
    //       process.env.JWT_SECRET as string,
    //       { expiresIn: "1h" } // Adjust the expiry as needed
    //     );
  
    //     return res.status(200).json({
    //       success: true,
    //       accessToken: newAccessToken,
    //     });
    //   });
    // } catch (error) {
    //   console.error("Refresh token error:", error);
    //   res.status(500).json({ error: true, message: "Internal server error" });
    // }



    try {
      const refreshToken = req.cookies?.userrefreshtoken; // Use the refresh token from cookies
      if (!refreshToken) {
          res.status(401).json({ message: "Unauthorized: No refresh token provided", error: true });
          return; // Explicit return to ensure void
      }

      // Verify the refresh token using the refresh secret
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err: VerifyErrors | null, decoded: unknown) => {
          if (err || !decoded) {
              res.status(403).json({ message: "Invalid or expired refresh token", error: true });
              return;
          }
          
          const payload = { userId: (decoded as any).userId };
          
          // Create a new access token using the correct secret and expiration
          const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "15m" });
      res.cookie("useraccesstoken", newAccessToken, {httpOnly:true, maxAge:1000 * 60 * 10 })
          
          // Return the new access token in the response
          res.status(200).json({
              message: "Access token created successfully",
              accessToken: newAccessToken
          });
      });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: true });
  }

  };


  const forgotPassword =  async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;
  
    // Check if the email exists in the database
    try {
      const user = await UserModel.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Generate a token for password reset (using crypto or JWT)
      const resetToken = crypto.randomBytes(32).toString('hex');
  
      // Hash the token and store it in the database for later validation
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
      // Store the hashed token and set an expiration time (1 hour)
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 3600000; // 1 hour in milliseconds
  
      await user.save();
  
      // Generate the password reset URL (ensure to use your real app's URL)
      const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  
      // Send the password reset email
      await sendResetEmail(user.email, user.userName, resetLink);
  
      return res.status(200).json({
        message: 'Password reset email sent. Please check your inbox.',
      });
    } catch (error) {
      console.error('Error handling forgot password request: ', error);
      return res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };


  const logout = async (req:Request,res:Response)=>{
    try{
      res.clearCookie("useraccesstoken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/", // Clear the cookie for the entire domain
    });

    res.clearCookie("userrefreshtoken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/", // Clear the cookie for the entire domain
  });


  res.json({ message: "Logout successful", ok: true });
  
    }
    catch(error){
      console.log(error)
    }
  }


export {
    loginUser,
    registerUser,
    // googleLogin,
    refreshToken,       
    forgotPassword,
    logout
} 