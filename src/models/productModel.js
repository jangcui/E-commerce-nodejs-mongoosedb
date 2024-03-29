'use strict'

const mongoose = require('mongoose')

var productSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         required: true,
         trim: true,
      },
      slug: {
         type: String,
         required: true,
         unique: true,
         lowercase: true,
      },
      description: {
         type: String,
         required: true,
      },
      price: {
         type: Number,
         required: true,
      },
      category: {
         type: String,
         ref: 'Category',
      },
      isDelete: {
         type: Boolean,
         default: false,
      },
      discountCode: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Discount',
         expiry: Date,
      },
      price_after_discount: {
         type: Number,
         default: 0,
      },
      brand: {
         type: String,
      },
      quantity: {
         type: Number,
         required: true,
         select: true,
      },
      sold: {
         type: Number,
         default: 0,
      },
      images: { type: Array, default: [] },
      thumb: String,
      color: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Color',
         },
      ],
      tags: String,
      ratings: [
         {
            star: Number,
            comment: String,
            postedBy: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'User',
            },
         },
      ],
      totalRating: {
         type: Number,
         default: 0,
      },
      deleteDate: Date,
   },
   {
      strictPopulate: false,
   },
   {
      timestamps: true,
   },
)

productSchema.pre('save', function (next) {
   if (this.images && this.images.length > 0) {
      this.thumb = this.images[0]
   }

   next()
})
//Export the model
module.exports = mongoose.model('Product', productSchema)
