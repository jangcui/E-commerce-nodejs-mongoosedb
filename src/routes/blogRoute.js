'use strict'

const express = require('express')
const router = express.Router()
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')
const { uploadPhoto, reSizeImage } = require('../middlewares/uploadImages')
const {
   createBlog,
   updateBlog,
   getAllBlogs,
   deleteBlog,
   getTheBlog,
   likeTheBlog,
   disLikeTheBlog,
   uploadImages,
   toggleBlogToTrashBin,
} = require('../controller/blogCtrl')

router.post('/', authMiddleware, isAdmin, createBlog)

router.get('/', getAllBlogs)
router.get('/:id', getTheBlog)

router.put('/likes', authMiddleware, likeTheBlog)
router.put('/dislikes', authMiddleware, disLikeTheBlog)
router.put('/trash/:id', authMiddleware, isAdmin, toggleBlogToTrashBin)
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 3), reSizeImage, uploadImages)
router.put('/:id', authMiddleware, isAdmin, updateBlog)

router.delete('/:id', authMiddleware, isAdmin, deleteBlog)

module.exports = router
