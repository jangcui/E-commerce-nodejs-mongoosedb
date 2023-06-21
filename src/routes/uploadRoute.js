const express = require('express');
const router = express.Router();
const { uploadImages, deleteImage, deleteManyImage } = require('../controller/uploadCtrl');

const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto } = require('../middlewares/uploadImages');

router.post('/', authMiddleware, isAdmin, uploadPhoto.array('images', 10), uploadImages);

router.delete('/', authMiddleware, isAdmin, deleteManyImage);
router.delete('/:id', authMiddleware, isAdmin, deleteImage);

module.exports = router;
