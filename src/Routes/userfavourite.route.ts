import express, { RequestHandler }  from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import { addToFavourites, getfavouriteItems, removeFavouritesItems} from '../Controllers/userFavourite.controller.js';


const route  = express.Router()


route.post('/favourite/addtofavourite', authMiddleware ,addToFavourites)
route.get('/favourite/getfavouriteitems', authMiddleware, getfavouriteItems as RequestHandler)
route.delete('/favourite/deletefavouriteitem', authMiddleware, removeFavouritesItems as RequestHandler)



export default route;