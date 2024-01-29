const express = require('express')
const {
   createUser,
   login,
   refreshToken,
   updateAUser,
   logOut,
   updatePassword,
   forgotPasswordToken,
   resetPassword,
   getWishlist,
   saveAddress,
   emptyCart,
   checkIsLogin,
} = require('../controller/userCtrl')
const { authMiddleware } = require('../middlewares/authMiddleware')
const { checkout, paymentVerifyCation } = require('../controller/paymentCtrl')
const router = express.Router()

router.post('/register', createUser)
router.post('/forgot-password-token', forgotPasswordToken)
router.post('/login', login)
router.post('/checkout', authMiddleware, checkout)
router.post('/payment-verify', authMiddleware, paymentVerifyCation)

router.get('/refresh', refreshToken)
router.get('/login', checkIsLogin)
router.get('/wishlist', authMiddleware, getWishlist)

router.delete('/cart', authMiddleware, emptyCart)
router.delete('/logout', logOut)

router.put('/', authMiddleware, updateAUser)
router.put('/reset-password/:token', resetPassword)
router.put('/password', authMiddleware, updatePassword)
router.put('/save-address', authMiddleware, saveAddress)

module.exports = router
