import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { changePassword, updateEmail, updatePhoneNumber, updateUserName, verifyPassword, updateAddress, myOrders } from '../Controllers/userprofile.controller.js';


const router = express.Router()

router.patch('/profile/updateemail', authMiddleware, updateEmail)
router.patch('/profile/updatephoneno', authMiddleware, updatePhoneNumber)
router.patch('/profile/updateusername', authMiddleware, updateUserName)
router.patch('/profile/verifypassword', authMiddleware, verifyPassword)
router.patch('/profile/changepassword', authMiddleware, changePassword)
router.patch('/profile/updateaddress', authMiddleware, updateAddress)
router.get('/profile/myorders', authMiddleware, myOrders)

export default router;