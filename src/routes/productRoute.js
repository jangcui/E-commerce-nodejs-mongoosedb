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
    // createRandomProduct,
} = require('../controller/productCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, isAdmin, createProduct);
// router.post('/random-product', authMiddleware, isAdmin, createRandomProduct);

router.get('/', getAllProducts);
router.get('/:id', getAProduct);

router.put('/wishlist', authMiddleware, addToWishList);
router.put('/trash/:id', authMiddleware, isAdmin, toggleProductToTrashBin);
router.put('/rating', authMiddleware, rating);
router.put('/:id', authMiddleware, isAdmin, updateProduct);

router.delete('/:id', authMiddleware, isAdmin, deleteAProduct);

module.exports = router;
