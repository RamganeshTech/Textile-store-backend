import  express, { RequestHandler }  from 'express';
import { adminLogin, adminLogout, isAdminAuthenticated } from '../Controllers/adminauth.controller.js';
import authAdminMiddleware from '../Middleware/authAdminMiddleware.js';


const router = express.Router()

router.post('/admin/adminlogin', adminLogin as RequestHandler)
router.post('/admin/adminlogout', adminLogout as RequestHandler)
router.get('/admin/isauthenticated', authAdminMiddleware,  isAdminAuthenticated as RequestHandler)

export default router;