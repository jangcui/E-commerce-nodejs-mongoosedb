const Enquiry = require('../models/enqModel');
const asyncHandler = require('express-async-handler');
const validateMongooseDbId = require('../untils/validateMongooseDbId');

///cerate enquiry
const createEnquiry = asyncHandler(async (req, res) => {
    try {
        const newEnquiry = await Enquiry.create(req.body);
        res.json(newEnquiry);
    } catch (err) {
        throw new Error(err);
    }
});

///update enquiry
const updateEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const updateEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updateEnquiry);
    } catch (err) {
        throw new Error(err);
    }
});
///get the enquiry
const getTheEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const getTheEnquiry = await Enquiry.findById(id);
        res.json(getTheEnquiry);
    } catch (err) {
        throw new Error(err);
    }
});

///get all enquiry
const getAllEnquiry = asyncHandler(async (req, res) => {
    try {
        const getAllEnquiry = await Enquiry.find();
        res.json(getAllEnquiry);
    } catch (err) {
        throw new Error(err);
    }
});

///delete enquiry
const deleteTheEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const deleteTheEnquiry = await Enquiry.findByIdAndDelete(id);
        res.json(deleteTheEnquiry);
    } catch (err) {
        throw new Error(err);
    }
});
module.exports = { createEnquiry, updateEnquiry, getTheEnquiry, getAllEnquiry, deleteTheEnquiry };