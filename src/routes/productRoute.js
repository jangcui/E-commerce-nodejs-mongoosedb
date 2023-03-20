const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAProduct,
    deleteAProduct,
    getAllProducts,
    updateProduct,
    addToWishList,
    rating,
    uploadImages,
    createRandomProduct,
} = require('../controller/productCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { uploadPhoto, productImagResize } = require('../middlewares/uploadImages');

router.post('/', authMiddleware, isAdmin, createProduct);
router.post('/random-product', authMiddleware, isAdmin, createRandomProduct);

router.get('/', getAllProducts);
router.get('/:id', getAProduct);

router.put('/wishlist', authMiddleware, addToWishList);
router.put('/rating', authMiddleware, rating);
router.put('/update-product/:id', authMiddleware, isAdmin, updateProduct);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImagResize, uploadImages);

router.delete('/delete/:id', authMiddleware, isAdmin, deleteAProduct);

module.exports = router;
