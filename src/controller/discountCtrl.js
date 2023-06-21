const Discount = require('../models/discountModel');
const asyncHandler = require('express-async-handler');
const validateMongooseDbId = require('../untils/validateMongooseDbId');

///cerate Discount
const createDiscount = asyncHandler(async (req, res) => {
    try {
        const newDiscount = await Discount.create(req.body);
        res.json(newDiscount);
    } catch (err) {
        throw new Error(err);
    }
});

///update Discount
const updateDiscount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const updateDiscount = await Discount.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateDiscount);
    } catch (err) {
        throw new Error(err);
    }
});

///get the Discount
const getTheDiscount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const discount = await Discount.findById(id);
        res.json(discount);
    } catch (err) {
        throw new Error(err);
    }
});

///get all Discounts
const getAllDiscounts = asyncHandler(async (req, res) => {
    try {
        const discounts = await Discount.find();
        res.json(discounts);
    } catch (err) {
        throw new Error(err);
    }
});

///delete Discount
const deleteTheDiscount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const discount = await Discount.findByIdAndDelete(id);
        res.json({ message: 'Deleted.' });
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = { createDiscount, updateDiscount, getTheDiscount, getAllDiscounts, deleteTheDiscount };
