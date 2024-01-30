'use strict'

const express = require('express')
const router = express.Router()
const { createBrand, updateBrand, getTheBrand, getAllBrands, deleteTheBrand } = require('../controller/brandCtrl')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')

router.post('/', authMiddleware, isAdmin, createBrand)

router.put('/:id', authMiddleware, isAdmin, updateBrand)

router.get('/', getAllBrands)
router.get('/:id', authMiddleware, isAdmin, getTheBrand)

router.delete('/:id', authMiddleware, isAdmin, deleteTheBrand)

module.exports = router
