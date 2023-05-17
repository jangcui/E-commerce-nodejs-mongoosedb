const Blog = require('../models/blogModel');
const validateMongooseDbId = require('../untils/validateMongooseDbId');
const asyncHandler = require('express-async-handler');
const cloudinaryUploadImg = require('../untils/cloudinary');
const fs = require('fs');

///create blog
const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    } catch (err) {
        throw new Error(err);
    }
});

///update blog
const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateBlog);
    } catch (err) {
        throw new Error(err);
    }
});
///get a blog
const getTheBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const getTheBlog = await Blog.findById(id).populate('likes').populate('dislikes');
        await Blog.findByIdAndUpdate(
            id,
            {
                $inc: { numViews: 1 },
            },
            { new: true },
        );
        res.json(getTheBlog);
    } catch (err) {
        throw new Error(err);
    }
});

///get all blog
const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const getAllBlogs = await Blog.find({ isDelete: { $ne: true } });
        res.json(getAllBlogs);
    } catch (err) {
        throw new Error(err);
    }
});
//// add to trash bin
const toggleBlogToTrashBin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 10);
        const blog = await Blog.findById(id);
        const isDeleted = blog.isDelete || false;
        const blogUpdate = await Blog.findOneAndUpdate(
            id,
            { $set: { isDelete: !isDeleted, deleteDate: deadline } },
            { new: true },
        );
        res.json(blogUpdate);
    } catch (err) {
        throw new Error(err);
    }
});
///delete blog
const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);

    try {
        const deleteBlog = await Blog.findByIdAndDelete(id);
        res.json({ message: 'Deleted.' });
    } catch (err) {
        throw new Error(err);
    }
});

//like blog
const likeTheBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongooseDbId(blogId);
    /// find the  blog want to liked
    const blog = await Blog.findById(blogId);
    if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
    }
    //find login user
    const loginUserId = req?.user?._id;
    //find user liked blog
    const isLiked = blog?.isLiked;
    //find user disliked blog
    const alreadyDisLiked = blog?.dislikes?.find((userId) => userId?.toString() === loginUserId?.toString());
    if (alreadyDisLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisLiked: false,
            },
            { new: true },
        );
        res.json(blog);
    }
    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            { new: true },
        );
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { likes: loginUserId },
                isLiked: true,
            },
            { new: true },
        );
        res.json(blog);
    }
});

//dislike blog
const disLikeTheBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    validateMongooseDbId(blogId);
    /// find the  blog want to liked
    const blog = await Blog.findById(blogId);
    //find login user
    const loginUserId = req?.user?._id;
    //find user liked blog
    const isDisLiked = blog?.isDisLiked;
    //find user disliked blog
    const alreadyLiked = blog?.likes?.find((userId) => userId?.toString() === loginUserId?.toString());
    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { likes: loginUserId },
                isLiked: false,
            },
            { new: true },
        );
        res.json(blog);
    }
    if (isDisLiked) {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull: { dislikes: loginUserId },
                isDisLiked: false,
            },
            { new: true },
        );
        res.json(blog);
    } else {
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push: { dislikes: loginUserId },
                isDisLiked: true,
            },
            { new: true },
        );
        res.json(blog);
    }
});

////upload image
const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath);
            fs.unlinkSync(path);
        }
        const findBlog = await Blog.findByIdAndUpdate(
            id,
            {
                images: urls.map((file) => {
                    return file;
                }),
            },
            { new: true },
        );
        res.json(findBlog);
    } catch (err) {
        throw new Error(err);
    }
});
module.exports = {
    createBlog,
    updateBlog,
    getAllBlogs,
    deleteBlog,
    getTheBlog,
    likeTheBlog,
    disLikeTheBlog,
    uploadImages,
    toggleBlogToTrashBin,
};
