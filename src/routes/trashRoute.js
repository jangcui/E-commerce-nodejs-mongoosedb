const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { getProductsTrash, getBlogsTrash, getUsersTrash, clearUserTrashBin } = require('../controller/trashCtrl');
router.get('/products', authMiddleware, isAdmin, getProductsTrash);
router.get('/blogs', authMiddleware, isAdmin, getBlogsTrash);
router.get('/users', authMiddleware, isAdmin, getUsersTrash);

router.delete('/users', authMiddleware, isAdmin, clearUserTrashBin);

module.exports = router;
