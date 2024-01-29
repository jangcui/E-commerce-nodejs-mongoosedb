const express = require('express')
const { addToCart, getAllCart, deleteProductInCart, updateQuantityCart } = require('../controller/cartCtrl')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { checkout, paymentVerifyCation } = require('../controller/paymentCtrl')
const router = express.Router()

router.post('/', addToCart)
router.post('/order/checkout', authMiddleware, checkout)
router.post('/order/payment-verify', authMiddleware, paymentVerifyCation)
router.post('/del', deleteProductInCart)

router.put('/', updateQuantityCart)

router.get('/', getAllCart)

module.exports = router
