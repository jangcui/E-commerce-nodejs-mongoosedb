const Color = require('../models/colorModel');
const asyncHandler = require('express-async-handler');
const validateMongooseDbId = require('../untils/validateMongooseDbId');

///cerate Color
const createColor = asyncHandler(async (req, res) => {
    try {
        const newColor = await Color.create(req.body);
        res.json(newColor);
    } catch (err) {
        throw new Error(err);
    }
});

///update Color
const updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const updateColor = await Color.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateColor);
    } catch (err) {
        throw new Error(err);
    }
});
///get the Color
const getTheColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const getTheColor = await Color.findById(id);
        res.json(getTheColor);
    } catch (err) {
        throw new Error(err);
    }
});

///get all Colors
const getAllColors = asyncHandler(async (req, res) => {
    try {
        const getAllColors = await Color.find();
        res.json(getAllColors);
    } catch (err) {
        throw new Error(err);
    }
});

///delete Color
const deleteTheColor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const deleteTheColor = await Color.findByIdAndDelete(id);
        res.json(deleteTheColor);
    } catch (err) {
        throw new Error(err);
    }
});
module.exports = { createColor, updateColor, getTheColor, getAllColors, deleteTheColor };
