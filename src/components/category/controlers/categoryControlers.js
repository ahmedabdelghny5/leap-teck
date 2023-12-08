import categoryModel from '../../../../DB/models/categoryModel.js';
import ErrorClass from '../../../utils/ErrorClass.js';
import cloudinary from '../../../utils/cloudinary.js';
import mealModel from './../../../../DB/models/mealModel.js';
import { nanoid } from 'nanoid';

import {
    StatusCodes
} from 'http-status-codes';
import { ApiFeatures } from '../../../utils/apiFeatures.js';
import { allMessages } from '../../../utils/localizationHelper.js';



export const createCategory = async (req, res, next) => {
    const { nameAR, nameEN } = req.body;
    const isNameExist = await categoryModel.findOne({ $or: [{ nameAR }, { nameEN }] })
    console.log(isNameExist);
    if (isNameExist) {
        console.log(isNameExist);

        return next(new ErrorClass(allMessages[req.query.ln].GENERAL_EXISTENCE))
    }
    if (!req.file) {
        return next(new ErrorClass(allMessages[req.query.ln].FILE_IS_REQUIRED))
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: `categories/${req.file.originalname + nanoid(4)}`,
        }
    );
    const category = await categoryModel.create({ nameAR, nameEN, image: { secure_url, public_id } })

    res.status(202).json({ message: allMessages[req.query.ln].SUCCESS, category });
}


export const getCategories = async (req, res, next) => {
    const filter = {}
    if (req.params.id) {
        filter._id = req.params.id
    }
    let query;
    if (req.query.fields == '-meals') {
        query = categoryModel.find(filter)
    }
    else {
        query = categoryModel.find(filter).populate([{
            path: 'meals',
            populate: [{
                path: 'chefId',
                select: 'name email phone'
            }]
        }])
    }

    const api = new ApiFeatures(query, req.query)
        .pagination()
        .search()
        .select()
        .sort()
        .filter()
    const categories = await api.mongooseQuery

    const all = await mealModel.find({ status: 'accepted' }).populate([{
        path: 'chefId',
        select: 'name email phone'
    }])
    console.log(all);
   
    categories.unshift({
        _id: "6518906271d19dde803b05ff",
        nameEN: 'all',
        nameAR: 'الجميع',
        image: {
            secure_url: 'https://res.cloudinary.com/dx2kspdex/image/upload/v1696001256/categories/bg.jpg3nYp/boqfnjhd0jmufsap6sql.jpg',
            public_id: "categories/Screenshot (1).pnggT3G/xvsbjvqu8aicb2bln09k"
        },
        meals: all,
        createdAt: "2023-09-30T21:17:22.468Z",
        updatedAt: "2023-09-30T21:17:22.468Z",
        __v: 0,
        id: "6518906271d19dde803b05ff"
    })
    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS, categories })
}


export const deleteCategory = async (req, res, next) => {
    const id = req.params.id
    const category = await categoryModel.findByIdAndDelete(id)
    if (!category) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, 404))
    }
    await mealModel.deleteMany({ category: category._id })
    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS })
}

export const updateCategory = async (req, res, next) => {
    const id = req.params.id
    console.log(id);
    console.log(0);

    const category = await categoryModel.findById(id)
    console.log(1);
    if (!category) {
        return next(new ErrorClass(allMessages[req.query.ln].NOT_FOUND, 404))
    }
    if (req.body.name) {
        category.name = req.body.name
    }
    if (req.file) {
        await cloudinary.uploader.destroy(category.image.public_id);
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: `categories/${req.file.originalname + nanoid(4)}`,
            }
        );
        category.image = { secure_url, public_id }
    }
    await category.save()
    res.status(200).json({ message: allMessages[req.query.ln].SUCCESS, category })
}