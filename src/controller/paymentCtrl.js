const Razorpay = require('razorpay')
const { ForbiddenError } = require('../core/errorResponse')

const instance = new Razorpay({
   key_id: process.env.KEY_ID_RAZORPAY,
   key_secret: process.env.KEY_SECRET_RAZORPAY,
})

const checkout = async (req, res, next) => {
   const { amount } = req.body
   try {
      const options = {
         amount: amount * 100,
         currency: 'INR',
      }

      const order = await instance.orders.create(options)

      if (!order) {
         throw new ForbiddenError('Some error occurred!')
      }

      res.json({
         success: true,
         order,
      })
   } catch (err) {
      next(err)
   }
}
const paymentVerifyCation = async (req, res, next) => {
   try {
      const { razor_pay_order_id, razor_pay_payment_id } = req.body
      res.json({
         razor_pay_order_id,
         razor_pay_payment_id,
      })
   } catch (err) {
      next(err)
   }
}
module.exports = { paymentVerifyCation, checkout }
