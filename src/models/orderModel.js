const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
var oderSchema = new mongoose.Schema(
   {
      user: {
         type: mongoose.Schema.Types.ObjectId,
         required: true,
         ref: 'User',
      },
      shippingInfo: {
         first_name: {
            type: String,
            required: true,
         },
         last_name: {
            type: String,
            required: true,
         },
         address: {
            type: String,
            required: true,
         },
         city: {
            type: String, 
            required: true,
         },
         country: {
            type: String,
            required: true,
         },
         state: {
            type: String,
            required: true,
         },
         other: {
            type: String,
         },
         pin_code: {
            type: Number,
            required: true,
         },
      },
      paymentInfo: {
         razor_pay_order_id: {
            type: String,
            required: true,
         },
         razor_pay_payment_id: {
            type: String,
            required: true,
         },
      },
      total_price: {
         type: Number,
         required: true,
      },

      orderItems: [
         {
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
         // {
         //    productId: {
         //       type: mongoose.Schema.Types.ObjectId,
         //       ref: 'Product',
         //    },
         //    colorId: {
         //       type: mongoose.Schema.Types.ObjectId,
         //       ref: 'Color',
         //    },
         //    quantity: {
         //       type: Number,
         //       required: true,
         //    },
         //    // price: {
         //    //    type: Number,
         //    //    required: true,
         //    // },
         // },
      ],
      paid_at: {
         type: Date,
         default: Date.now(),
      },
      total_price_after_discount: {
         type: Number,
         required: true,
      },
      month: {
         type: String,
         default: new Date().getMonth(),
      },

      order_status: {
         type: String,
         enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
         default: 'pending',
      },
   },

   {
      timestamps: true,
   },
)

//Export the model
module.exports = mongoose.model('Order', oderSchema)
