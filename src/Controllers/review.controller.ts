import { Response, Request } from 'express';
import ReviewModel from '../Models/review.model.js';
import { AuthenticatedRequest } from '../Types/types.js';
import { IUser, UserModel } from '../Models/user.model.js';
import ProductModel from '../Models/products.model.js';
import mongoose from 'mongoose';

const createReview = async (req: Request, res: Response) => {
    try {

        let { productId, star:stars, description } = req.body;

        let product = await ProductModel.findById(productId)

        if (!product) {
            res.status(404).json({ message: "Product not found", error: true });
            return;
        }

        let user = (req as AuthenticatedRequest).user;

        let isUserExists = await UserModel.findById(user._id);

        if (!isUserExists) {
            res.status(404).json({ message: "User not found", error: true });
            return;
        }


        let isReviewsExists = await ReviewModel.findOne({ productId })

        let isUserReviewExists = isReviewsExists?.reviews.find(review => review.userId.toString() === user._id.toString())

        if (isUserReviewExists) {
            res.status(400).json({ message: "Already review has created if you want please edit it.", error: true });
            return;
        }

        if (!isReviewsExists) {
            await ReviewModel.create({
                productId: product._id,
                reviews: [{ userId: isUserExists._id, userName: isUserExists.userName, stars, description }]
            })
        }
        else {
            isReviewsExists.reviews.push({ userId: isUserExists._id as mongoose.Schema.Types.ObjectId, userName: isUserExists.userName, stars, description })
            await isReviewsExists?.save()
        }


        res.status(201).json({ message: "reveiw created", data: isReviewsExists, error: false, ok: true });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error from create Review", error.message)
            res.status(400).json({ message: error.message, error: true, ok: false })
            return;
        }
    }
}



const editReview = async (req: Request, res: Response) => {
    try {

        let { reviewid } = req.params
        let { productId, stars, description } = req.body

        let user = (req as AuthenticatedRequest).user;

        let isUserExists = await UserModel.findById(user._id);

        if (!isUserExists) {
            res.status(404).json({ message: "User not found", error: true });
            return;
        }

        if (!productId) {
            res.status(404).json({ message: "please provide the productId", error: true });
            return;
        }
        let product = await ProductModel.findById(productId)

        if (!product) {
            res.status(404).json({ message: "Product not found", error: true });
            return;
        }


        if (!reviewid) {
            res.status(404).json({ message: "please select the review to delete", error: true });
            return;
        }

        let reviewsExists = await ReviewModel.findOne({ productId })

        if (!reviewsExists) {
            res.status(404).json({ message: "review for this product not found", error: true });
            return;
        }

        let userReviewIndex = reviewsExists.reviews.findIndex(review =>  (review._id as mongoose.Schema.Types.ObjectId).toString() === reviewid.toString())

        if(userReviewIndex === -1) {
             res.status(404).json({ message: "Review not found", error: true });
             return;
        }

        // reviewsExists.reviews[userReviewIndex] = {
        //     ...reviewsExists.reviews[userReviewIndex],
        //     stars, description
        // }


        reviewsExists.reviews[userReviewIndex].stars = stars
        reviewsExists.reviews[userReviewIndex].description = description


        reviewsExists.save()
        res.status(200).json({message:"review",data:reviewsExists, ok:true, error:false})
        return;

    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error from create Review", error.message)
            res.status(400).json({ message: error.message, error: true, ok: false })
            return;
        }
    }
}



const removeReview = async (req: Request, res: Response) => {
    try {

        let user = (req as AuthenticatedRequest).user;

        let isUserExists = await UserModel.findById(user._id);

        if (!isUserExists) {
            res.status(404).json({ message: "User not found", error: true });
            return;
        }

        let { reviewid } = req.params
        let { productId } =  req.query;

        if (!productId) {
            res.status(404).json({ message: "please provide the productId", error: true });
            return;
        }
        let product = await ProductModel.findById(productId)

        if (!product) {
            res.status(404).json({ message: "Product not found", error: true });
            return;
        }


        if (!reviewid) {
            res.status(404).json({ message: "please select the review to delete", error: true });
            return;
        }

        let reviewsExists = await ReviewModel.findOne({ productId })

        if (!reviewsExists) {
            res.status(404).json({ message: "review for this product not found", error: true });
            return;
        }

        reviewsExists.reviews = reviewsExists.reviews.filter(review => (review._id as mongoose.Schema.Types.ObjectId).toString() !== reviewid)
        reviewsExists.save()


        res.status(200).json({ message: "review deleted", data: reviewsExists, error: false, ok: true });

    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error from create Review", error.message)
            res.status(400).json({ message: error.message, error: true, ok: false })
            return;
        }
    }
}


const getAllReview = async (req: Request, res: Response) => {
    try {
        let { productId } = req.params;

        let product = await ProductModel.findById(productId)

        if (!product) {
            res.status(404).json({ message: "Product not found", error: true });
            return;
        }

        let reviewItem = await ReviewModel.findOne({ productId })

        if (!reviewItem?.reviews.length) {
            res.status(200).json({ message: "No Reviews yet for this product...", data: [], error: true, ok: false });
            return;
        }

        res.status(200).json({ message: "Reviews retrieved successfully", data: reviewItem.reviews, ok: true, error: false });


    }
    catch (error) {
        if (error instanceof Error) {
            console.log("error from create Review", error.message)
            res.status(400).json({ message: error.message, error: true, ok: false })
            return;
        }
    }
}

export { createReview, getAllReview, editReview, removeReview }