const Product = require('../models/productModel');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

//get product trash

const getProductsTrash = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find({ isDelete: true });
        res.json(products);
    } catch (err) {
        throw new Error(err);
    }
});

const getBlogsTrash = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find({ isDelete: true });
        res.json(blogs);
    } catch (err) {
        throw new Error(err);
    }
});
const getUsersTrash = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({ isDelete: true });
        res.json(users);
    } catch (err) {
        throw new Error(err);
    }
});
// clear trash bin
const clearUserTrashBin = asyncHandler(async (req, res, next) => {
    try {
        const findUser = await User.find({ isDelete: true });
        await Promise.all(
            findUser.map(async () => {
                await User.findOneAndDelete({ isDelete: true });
            }),
        );
        res.json('Deleted.');
    } catch (err) {
        next(err);
    }
});

module.exports = {
    getProductsTrash,
    getBlogsTrash,
    getUsersTrash,
    clearUserTrashBin,
};
