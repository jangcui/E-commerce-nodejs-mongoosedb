'use strict'

const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema(
   {
      cart_userId: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      cart_state: {
         type: String,
         required: true,
         enum: ['active', 'completed', 'pending', 'failed'],
         default: 'active',
      },
      cart_products: [
         {
            _id: false,
            productId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Product',
            },
            quantity: Number,
            colorId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Color',
            },
         },
      ],
      // cart_quantity: { type: Number, default: 0 },
      cart_total_price: {
         type: Number,
      },
   },
   {
      timestamps: true,
   },
)

//Export the model
module.exports = mongoose.model('Cart', cartSchema)
