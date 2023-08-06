const express = require('express');
const {
    createUser,
    login,
    refreshToken,
    updateAUser,
    logOut,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    createOrder,
    getMyOrder,
    removeProductFromCart,
    updateProductQuantityFromCart,
    emptyCart,
} = require('../controller/userCtrl');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { checkout, paymentVerifyCation } = require('../controller/paymentCtrl');
const router = express.Router();

router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken);
router.post('/login', login);
router.post('/cart', authMiddleware, userCart);
router.post('/cart/order', authMiddleware, createOrder);
router.post('/order/checkout', authMiddleware, checkout);
router.post('/order/payment-verify', authMiddleware, paymentVerifyCation);

router.get('/refresh', refreshToken);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/cart', authMiddleware, getUserCart);
router.get('/order', authMiddleware, getMyOrder);

router.delete('/delete-product-cart/:cartItemId', authMiddleware, removeProductFromCart);
router.delete('/cart', authMiddleware, emptyCart);
router.delete('/logout', logOut);

router.put('/', authMiddleware, updateAUser);
router.put('/reset-password/:token', resetPassword);
router.put('/password', authMiddleware, updatePassword);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/update-product-cart/:cartItemId/:newQuantity', authMiddleware, updateProductQuantityFromCart);

module.exports = router;
