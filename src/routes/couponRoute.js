'use strict'

const express = require('express')
const router = express.Router()
const { createCoupon, updateCoupon, getTheCoupon, getAllCoupons, deleteTheCoupon } = require('../controller/couponCtrl')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')

router.post('/', authMiddleware, isAdmin, createCoupon)

router.put('/:id', authMiddleware, isAdmin, updateCoupon)

router.get('/', authMiddleware, isAdmin, getAllCoupons)
router.get('/:id', authMiddleware, isAdmin, getTheCoupon)

router.delete('/:id', authMiddleware, isAdmin, deleteTheCoupon)

module.exports = router
