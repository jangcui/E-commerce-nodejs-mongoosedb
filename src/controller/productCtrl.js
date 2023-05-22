const Product = require('../models/productModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const validateMongooseDbId = require('../untils/validateMongooseDbId');

//// create a new product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (err) {
        throw new Error(err);
    }
});

/// update a product
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const updateProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateProduct);
    } catch (err) {
        throw new Error(err);
    }
});

//// get a product
const getAProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const findProduct = await Product.findById(id).populate('color');
        if (!findProduct) {
            throw new Error('Present product not found');
        }
        res.json(findProduct);
    } catch (err) {
        throw new Error(err);
    }
});

//get all products
const getAllProducts = asyncHandler(async (req, res) => {
    try {
        ///filtering
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`); // find product greater than or equal to, greater than, less than, and less than or equal to

        let query = Product.find(JSON.parse(queryStr));

        // Add the condition to exclude isDelete: true
        query = query.where('isDelete').ne(true);

        //sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createAt');
        }

        ///limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        //pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCounts = await Product.countDocuments();

            if (skip >= productCounts) {
                throw new Error('this page dose not exists');
            }
        }

        const product = await query;
        res.json(product);
    } catch (err) {
        throw new Error(err);
    }
});
//// add to trash bin
const toggleProductToTrashBin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 10);
        const product = await Product.findById(id);
        const isDeleted = product.isDelete || false;
        const productUpdate = await Product.findByIdAndUpdate(
            id,
            { isDelete: !isDeleted, deleteDate: deadline },
            { new: true },
        );
        res.json(productUpdate);
    } catch (err) {
        throw new Error(err);
    }
});

///delete a product
const deleteAProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const product = await Product.findByIdAndDelete(id);
        res.json({ message: 'Deleted.' });
    } catch (err) {
        throw new Error(err);
    }
});

///add to wishlist
const addToWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    validateMongooseDbId(_id);

    try {
        const user = await User.findById(_id);
        const alreadyAdded = user?.wishlist?.find((id) => id.toString() === prodId);
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: { wishlist: prodId },
                },
                { new: true },
            );
            res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $push: { wishlist: prodId },
                },
                { new: true },
            );
            res.json(user);
        }
    } catch (err) {
        throw new Error(err);
    }
});

///handler ratings
const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, comment, prodId } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings?.find((userId) => userId.postedBy.toString() === _id.toString());
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: { 'ratings.$.star': star, 'ratings.$.comment': comment },
                },
                { new: true },
            );
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: { star, comment, postedBy: _id },
                    },
                },
                { new: true },
            );
        }
        const getAllRatings = await Product.findById(prodId);
        let totalRating = getAllRatings?.ratings?.length;
        let ratingSum = getAllRatings.ratings?.map((item) => item.star)?.reduce((prev, crr) => prev + crr, 0);
        let actualRating = Math.round(ratingSum / totalRating);
        let finalProduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalRating: actualRating,
            },
            { new: true },
        );
        res.json(finalProduct);
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = {
    createProduct,
    getAProduct,
    deleteAProduct,
    getAllProducts,
    updateProduct,
    addToWishList,
    toggleProductToTrashBin,
    rating,
};
