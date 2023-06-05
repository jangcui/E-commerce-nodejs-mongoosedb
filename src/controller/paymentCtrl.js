const Razorpay = require('razorpay');

const instance = new Razorpay({
    key_id: process.env.KEY_ID_RAZORPAY,
    key_secret: process.env.KEY_SECRET_RAZORPAY,
});
const checkout = async (req, res) => {
    const { amount } = req.body;
    try {
        const options = {
            amount: amount * 100,
            currency: 'INR',
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send('Some error occured');

        res.json({
            success: true,
            order,
        });
    } catch (err) {
        throw new Error(err);
    }
};
const paymentVerifyCation = async (req, res) => {
    try {
        const { razor_pay_order_id, razor_pay_payment_id } = req.body;
        res.json({
            razor_pay_order_id,
            razor_pay_payment_id,
        });
    } catch (err) {
        throw new Error(err);
    }
};
module.exports = { paymentVerifyCation, checkout };
