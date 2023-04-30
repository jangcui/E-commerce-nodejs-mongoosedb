const express = require('express');
const router = express.Router();
const { uploadImages, deleteImage } = require('../controller/uploadCtrl');

const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImagResize } = require('../middlewares/uploadImages');

router.post('/', authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImagResize, uploadImages);

router.delete('/:id', authMiddleware, isAdmin, deleteImage);

module.exports = router;
