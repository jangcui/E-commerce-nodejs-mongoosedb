const express = require('express');
const {
    createUser,
    loginUser,
    handleRefreshToken,
    getAllUser,
    getAUser,
    deleteAUser,
    updateAUser,
    toggleBlockUser,
    logOut,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    loginAdmin,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    createOrder,
    getMyOrder,
    toggleUserToTrashBin,
    removeProductFromCart,
    updateProductQuantityFromCart,
    getMonthWiseOrderInCome,
    getYearlyTotalOrders,
    getAllOrders,
    deleteOrder,
    getAOrder,
    updateOrderStatus,
    emptyCart,
} = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { checkout, paymentVerifyCation } = require('../controller/paymentCtrl');
const router = express.Router();
router.post('/register', createUser);
router.post('/forgot-password-token', forgotPasswordToken);
router.post('/login', loginUser);
router.post('/admin-login', loginAdmin);
router.post('/cart', authMiddleware, userCart);
router.post('/cart/order', authMiddleware, createOrder);
router.post('/order/checkout', authMiddleware, checkout);
router.post('/order/payment-verify', authMiddleware, paymentVerifyCation);

router.get('/', getAllUser);
router.get('/refresh', handleRefreshToken);
router.get('/logout', logOut);
router.get('/order/:id', authMiddleware, isAdmin, getAOrder);
router.get('/wishlist', authMiddleware, getWishlist);
router.get('/cart', authMiddleware, getUserCart);
router.get('/order', authMiddleware, getMyOrder);
router.get('/all-orders', authMiddleware, isAdmin, getAllOrders);
router.get('/month-wise-order-income', authMiddleware, isAdmin, getMonthWiseOrderInCome);
router.get('/year-total-orders', authMiddleware, isAdmin, getYearlyTotalOrders);
router.get('/:id', authMiddleware, isAdmin, getAUser);

router.delete('/delete-product-cart/:cartItemId', authMiddleware, removeProductFromCart);
router.delete('/order/:id', authMiddleware, isAdmin, deleteOrder);
router.delete('/cart', authMiddleware, emptyCart);
router.delete('/:id', deleteAUser);

router.put('/', authMiddleware, updateAUser);
router.put('/reset-password/:token', resetPassword);
router.put('/password', authMiddleware, updatePassword);
router.put('/trash/:id', authMiddleware, isAdmin, toggleUserToTrashBin);
router.put('/order/:id', authMiddleware, isAdmin, updateOrderStatus);
router.put('/save-address', authMiddleware, saveAddress);
router.put('/toggle-block/:id', authMiddleware, isAdmin, toggleBlockUser);
router.put('/update-product-cart/:cartItemId/:newQuantity', authMiddleware, updateProductQuantityFromCart);

module.exports = router;
