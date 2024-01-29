const Enquiry = require('../models/enqModel');
const asyncHandler = require('express-async-handler');
const validateMongooseDbId = require('../utils/validateMongooseDbId');
const slugify = require('slugify');

///cerate enquiry
const createEnquiry = asyncHandler(async (req, res) => {
    try {
        if (req.body.name) {
            req.body.name = slugify(req.body.name);
        }
        const existingEnquiry = await Enquiry.findOne({ name: req.body.name });
        if (existingEnquiry) {
            return res.status(400).json({ error: 'Name already exists.' });
        }
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
        const enquiry = await Enquiry.findByIdAndDelete(id);
        res.json({ message: 'Deleted.' });
    } catch (err) {
        throw new Error(err);
    }
});
module.exports = { createEnquiry, updateEnquiry, getTheEnquiry, getAllEnquiry, deleteTheEnquiry };
