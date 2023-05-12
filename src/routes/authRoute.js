const express = require('express');
const {
    createUser,
    loginUserCtrl,
    handleRefreshToken,
    getAllUser,
    getAUser,
    deleteAUser,
    updatedAUser,
    blockUser,
    logOut,
    unBlockUser,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrder,
    updateOrderStatus,
    createRandomUser,
    getAllOrders,
    getOrderUserId,
} = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken);
router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdmin);
router.post('/cart', authMiddleware, userCart);
router.post('/cart/coupon-apply', authMiddleware, applyCoupon);
router.post('/cart/cash-order', authMiddleware, createOrder);
router.post('/random-user', authMiddleware, isAdmin, createRandomUser);

router.get('/', getAllUser);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logOut);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/cart', authMiddleware, getUserCart);
router.get('/order-user/:id', authMiddleware, isAdmin, getOrderUserId);
router.get('/all-orders', authMiddleware, isAdmin, getAllOrders);
router.get('/orders', authMiddleware, getOrder);
router.get('/:id', authMiddleware, isAdmin, getAUser);

router.delete('/empty-cart', authMiddleware, emptyCart);
router.delete('/:id', deleteAUser);

router.put('/reset-password/:token', resetPassword);
router.put('/password', authMiddleware, updatePassword);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/edit-user', authMiddleware, updatedAUser);
router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unBlockUser);

module.exports = router;
