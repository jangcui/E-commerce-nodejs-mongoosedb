const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { getProductsTrash, getBlogsTrash, getUsersTrash } = require('../controller/trashCtrl');

// router.put('/:id', authMiddleware, isAdmin, updateColor);

router.get('/products', authMiddleware, isAdmin, getProductsTrash);
router.get('/blogs', authMiddleware, isAdmin, getBlogsTrash);
router.get('/users', authMiddleware, isAdmin, getUsersTrash);

module.exports = router;
