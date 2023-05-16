const Coupon = require('../models/couponModel');
const asyncHandler = require('express-async-handler');
const validateMongooseDbId = require('../untils/validateMongooseDbId');

///cerate coupon
const createCoupon = asyncHandler(async (req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body);
        res.json(newCoupon);
    } catch (err) {
        throw new Error(err);
    }
});

///update coupon
const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const updateCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateCoupon);
    } catch (err) {
        throw new Error(err);
    }
});

///get the coupon
const getTheCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const getTheCoupon = await Coupon.findById(id);
        res.json(getTheCoupon);
    } catch (err) {
        throw new Error(err);
    }
});

///get all coupons
const getAllCoupons = asyncHandler(async (req, res) => {
    try {
        const getAllCoupons = await Coupon.find();
        res.json(getAllCoupons);
    } catch (err) {
        throw new Error(err);
    }
});

///delete coupon
const deleteTheCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const coupon = await Coupon.findByIdAndDelete(id);
        res.json({ message: 'Deleted.' });
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = { createCoupon, updateCoupon, getTheCoupon, getAllCoupons, deleteTheCoupon };
