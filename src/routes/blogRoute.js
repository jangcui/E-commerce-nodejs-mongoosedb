const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const {
    createBlog,
    updateBlog,
    getAllBlogs,
    deleteBlog,
    getTheBlog,
    likeTheBlog,
    disLikeTheBlog,
    uploadImages,
} = require('../controller/blogCtrl');
const { uploadPhoto, blogImagResize } = require('../middlewares/uploadImages');

router.post('/', authMiddleware, isAdmin, createBlog);

router.get('/', getAllBlogs);
router.get('/:id', getTheBlog);

router.put('/likes', authMiddleware, likeTheBlog);
router.put('/dislikes', authMiddleware, disLikeTheBlog);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 3), blogImagResize, uploadImages);
router.put('/:id', authMiddleware, isAdmin, updateBlog);

router.delete('/:id', authMiddleware, isAdmin, deleteBlog);

module.exports = router;
