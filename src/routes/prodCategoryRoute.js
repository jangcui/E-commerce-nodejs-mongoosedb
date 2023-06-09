const express = require('express');
const router = express.Router();
const {
    createCategory,
    updateCategory,
    getTheCategory,
    getAllCategory,
    deleteTheCategory,
} = require('../controller/prodCategoryCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, isAdmin, createCategory);

router.put('/:id', authMiddleware, isAdmin, updateCategory);

router.get('/', getAllCategory);
router.get('/:id', authMiddleware, isAdmin, getTheCategory);

router.delete('/:id', authMiddleware, isAdmin, deleteTheCategory);

module.exports = router;
