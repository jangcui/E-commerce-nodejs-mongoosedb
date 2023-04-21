const express = require('express');
const router = express.Router();
const {
    createEnquiry,
    updateEnquiry,
    getTheEnquiry,
    getAllEnquiry,
    deleteTheEnquiry,
} = require('../controller/enqCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', createEnquiry);

router.put('/:id', authMiddleware, updateEnquiry);

router.get('/', getAllEnquiry);
router.get('/:id', getTheEnquiry);

router.delete('/:id', authMiddleware, isAdmin, deleteTheEnquiry);

module.exports = router;
