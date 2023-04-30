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
    // createRandomProduct,
} = require('../controller/productCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, isAdmin, createProduct);
// router.post('/random-product', authMiddleware, isAdmin, createRandomProduct);

router.get('/', getAllProducts);
router.get('/:id', getAProduct);

router.put('/wishlist', authMiddleware, addToWishList);
router.put('/rating', authMiddleware, rating);
router.put('/update-product/:id', authMiddleware, isAdmin, updateProduct);

router.delete('/delete/:id', authMiddleware, isAdmin, deleteAProduct);

module.exports = router;
