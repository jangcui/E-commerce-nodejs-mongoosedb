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

module.exports = {
    getProductsTrash,
    getBlogsTrash,
    getUsersTrash,
};
