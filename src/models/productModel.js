const mongoose = require('mongoose');

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
        images: [],
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
        timestamps: true,
    },
);

//Export the model
module.exports = mongoose.model('Product', productSchema);
