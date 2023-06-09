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
    toggleProductToTrashBin,
    applyDiscount,
    removeDiscount,
    clearObject,
} = require('../controller/productCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, isAdmin, createProduct);

router.get('/', getAllProducts);
router.get('/:slug', getAProduct);

router.put('/wishlist', authMiddleware, addToWishList);
router.put('/clear', authMiddleware, isAdmin, clearObject);
router.put('/discount', authMiddleware, isAdmin, applyDiscount);
router.put('/discount/:productId', authMiddleware, isAdmin, removeDiscount);
router.put('/trash/:id', authMiddleware, isAdmin, toggleProductToTrashBin);
router.put('/rating', authMiddleware, rating);
router.put('/:id', authMiddleware, isAdmin, updateProduct);

router.delete('/:id', authMiddleware, isAdmin, deleteAProduct);

module.exports = router;
