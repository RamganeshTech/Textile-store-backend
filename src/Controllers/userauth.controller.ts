import express, { Response, Request } from "express";
import bcrypt from "bcrypt";
import jwt, { VerifyErrors } from "jsonwebtoken";
import { UserModel } from "../Models/user.model.js";
import sendResetEmail from "../Utils/forgotPasswordMail.js";
import crypto from 'crypto'
import { AuthenticatedRequest } from "../Types/types.js";
// import admin from "../Config/firebaseAdmin.js";


interface AuthenticationRequest extends Request {
  cookies: { userAccessToken?: string }
}

interface RefreshTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}




const loginUser = async (req: AuthenticationRequest, res: Response) => {
  try {
    let isTokenExists = req.cookies?.userAccessToken

    if (isTokenExists) {
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

    let user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "invalid credentials",
        ok: false,
      })
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        error: true,
        message: "invalid credentials",
        ok: false,
      });
    }

    // Simulate credential verification (replace with real logic)
    if (user) {
      // Simulate token generation (replace with a real token, e.g., JWT)

      // Set cookie with the token (httpOnly for security)
      const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      const refreshtoken = jwt.sign({ _id: user._id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

      res.cookie("userrefreshtoken", refreshtoken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 })

      res.cookie("useraccesstoken", accessToken, { httpOnly: true, maxAge: 1000 * 60 * 60 });

      return void res.status(200).json({
        error: false,
        message: "Login successful",
        ok: true,
        user: {
          userId: user._id, userName: user.userName, email, password, address: {
            doorno: user.address?.doorno,
            street: user.address?.street,
            landmark: user.address?.landmark,
            district: user.address?.district,
            state: user.address?.state,
            pincode: user.address?.pincode,
          }
        }
      });
    } else {
      return void res.status(401).json({
        error: true,
        message: "Invalid credentials",
        ok: false,
      });
    }

  }
  catch (error) {
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
    const { userName, email, password, address: { doorno, street, state, district, pincode, landmark }, phoneNumber } = req.body;

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
      address: {
        doorno: doorno || null,
        street: street || null,
        landmark: landmark || null,
        district: district || null,
        state: state || null,
        pincode: pincode || null,
      },
      phoneNumber: phoneNumber ? phoneNumber : null
    });

    // Generate a JWT token for the new user
    const tokenPayload = { _id: newUser._id };
    const accesstoken = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    const refreshtoken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

    res.cookie("useraccesstoken", accesstoken, { httpOnly: true, maxAge: 1000 * 60 * 5 })
    res.cookie("userrefreshtoken", refreshtoken, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 })

    // Return success response with the token and minimal user info
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accesstoken,
      user: {
        _id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        password: newUser.password,
        address: {
          doorno: newUser.address?.doorno || null,
          street: newUser.address?.street || null,
          landmark: newUser.address?.landmark || null,
          district: newUser.address?.district || null,
          state: newUser.address?.state || null,
          pincode: newUser.address?.pincode || null,
        }
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
    const refreshToken = req.cookies?.userrefreshtoken; // Use the refresh token from cookies
    if (!refreshToken) {
      res.status(401).json({ message: "Unauthorized: No refresh token provided", error: true, ok: false });
      return; // Explicit return to ensure void
    }

    // Verify the refresh token using the refresh secret
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string, (err: VerifyErrors | null, decoded: unknown) => {
      if (err || !decoded) {
        res.status(403).json({ message: "Invalid or expired refresh token", error: true, ok: false });
        return;
      }

      const payload = { _id: (decoded as any)._id };

      // Create a new access token using the correct secret and expiration
      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: "15m" });
      res.cookie("useraccesstoken", newAccessToken, { httpOnly: true, maxAge: 1000 * 60 * 10 })

      // Return the new access token in the response
      res.status(200).json({
        message: "Access token created successfully",
        accessToken: newAccessToken,
        ok: true,
        error: false,
        userId: payload._id,
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: true, ok: false, userId: null, });
  }

};


const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;

  // Check if the email exists in the database
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // const user = await UserModel.findOne({ email });
    if (user.resetPasswordExpire) {
      console.log("Stored Expiry Time:", new Date(user?.resetPasswordExpire));
      console.log("Current Time:", new Date());
      console.log("Time Difference:", user?.resetPasswordExpire - Date.now(), "ms");
    }

    // Generate a token for password reset (using crypto or JWT)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the token and store it in the database for later validation
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Store the hashed token and set an expiration time (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = (Date.now() + 3600000); // 1 hour in milliseconds


    console.log("After updating:");
    console.log("New Expiry Time:", new Date(user.resetPasswordExpire));

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
    return res.status(500).json({ message: 'Server error. Please try again later.', error: true, ok: false });
  }
};

const resetForgotPassword = async (req: Request, res: Response): Promise<any> => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Invalid request. Token and password are required." });
  }

  console.log("password", password)

  try {
    // Hash the received token to match the stored one
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find the user with the provided reset token (and check if it’s not expired)
    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    console.log("before save", user)

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    let isMatching = await bcrypt.compare(password, user.password)
    if (isMatching) {
      console.log("yes the password is updated")
    }
    else {
      console.log("yes the password is not updated")
    }

    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save the updated user data
    await user.save();
    // console.log("after save",user)

    return res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
}

const logout = async (req: Request, res: Response) => {
  try {
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


    res.status(200).json({ message: "Logout successful", ok: true, error: false });
    return;
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ message: "internal server error", errormessage: error, ok: false, error: true });

  }
}

const isUserAuthenticated = async (req: Request, res: Response) => {
  try {
    let user = (req as AuthenticatedRequest).user;

    let data = await UserModel.findById(user._id)

    if (!data) {
      return res.status(404).json({ ok: true, message: "user is not authenticated", error: false, data: null });
    }

    res.status(200).json({ ok: true, message: "user is authenticated", error: false, data })
  }
  catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
      res.status(500).json({ message: "error.message", ok: false, error: true, data: null })
    }
  }
}


export {
  loginUser,
  registerUser,
  // googleLogin,
  refreshToken,
  forgotPassword,
  logout,
  resetForgotPassword,
  isUserAuthenticated
} 