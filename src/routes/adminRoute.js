const express = require('express');
const {
    login,
    getAUser,
    getAllUser,
    deleteAUser,
    logOut,
    refreshToken,
    updatePassword,
    toggleBlockUser,
    toggleUserToTrashBin,
    getMonthWiseOrderInCome,
    getYearlyTotalOrders,
    getAllOrders,
    deleteOrder,
    getAOrder,
    updateOrderStatus,
} = require('../controller/adminCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/login', login);

router.get('/', authMiddleware, isAdmin, getAllUser);
router.get('/order/:id', authMiddleware, isAdmin, getAOrder);
router.get('/orders', authMiddleware, isAdmin, getAllOrders);
router.get('/month-wise-order-income', authMiddleware, isAdmin, getMonthWiseOrderInCome);
router.get('/year-total-orders', authMiddleware, isAdmin, getYearlyTotalOrders);
router.get('/refresh', refreshToken);
router.get('/:id', authMiddleware, isAdmin, getAUser);

router.delete('/order/:id', authMiddleware, isAdmin, deleteOrder);
router.delete('/logout', logOut);
router.delete('/:id', deleteAUser);

router.put('/password', authMiddleware, updatePassword);
router.put('/trash/:id', authMiddleware, isAdmin, toggleUserToTrashBin);
router.put('/order/:id', authMiddleware, isAdmin, updateOrderStatus);
router.put('/block/:id', authMiddleware, isAdmin, toggleBlockUser);

module.exports = router;
