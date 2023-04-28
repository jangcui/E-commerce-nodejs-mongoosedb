const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                count: Number,
                color: [],
                price: Number,
            },
        ],
        cartTotal: Number,
        totalAfterDiscount: Number,
        orderBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
    },
    {
        timestamps: true,
    },
);

//Export the model
module.exports = mongoose.model('Cart', cartSchema);
