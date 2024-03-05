import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary'
import Restaurant from '../models/restaurant';
import mongoose from 'mongoose';

const getRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });
        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found"
            });
        }
        res.json(restaurant);

    } catch (error) {
        console.log(error); 
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
}

const createRestaurant = async (req: Request, res: Response) => {
    try {
        const existingRestaurant = await Restaurant.findOne({ user: req.userId });

        if (existingRestaurant) {
            res.status(409).json({
                message: "User restaurant already exists"
            })
        }

        const image = req.file as Express.Multer.File;
        const base64Image = Buffer.from(image.buffer).toString("base64");
        const dataURI = `data:${image.mimetype};base64,${base64Image}`;

        const uploadRespone = await cloudinary.uploader.upload(dataURI);

        const restaurant = new Restaurant(req.body);
        restaurant.imageUrl = uploadRespone.url;
        restaurant.user = new mongoose.Types.ObjectId(req.userId);
        restaurant.lastUpdate = new Date();
        await restaurant.save();

        res.status(201).send(restaurant);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong"
        })
    }
};

export default {
    getRestaurant,
    createRestaurant,
}