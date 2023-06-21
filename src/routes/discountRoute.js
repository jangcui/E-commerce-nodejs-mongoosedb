const express = require('express');
const router = express.Router();
const {
    createDiscount,
    updateDiscount,
    getTheDiscount,
    getAllDiscounts,
    deleteTheDiscount,
} = require('../controller/discountCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, isAdmin, createDiscount);

router.put('/:id', authMiddleware, isAdmin, updateDiscount);

router.get('/', authMiddleware, isAdmin, getAllDiscounts);
router.get('/:id', authMiddleware, isAdmin, getTheDiscount);

router.delete('/:id', authMiddleware, isAdmin, deleteTheDiscount);

module.exports = router;
