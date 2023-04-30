const asyncHandler = require('express-async-handler');

const { cloudinaryUploadImg, cloudinaryDeleteImg } = require('../untils/cloudinary');
const fs = require('fs');

////upload image

const uploadImages = asyncHandler(async (req, res) => {
    try {
        const files = req.files;
        const uploadedImages = await cloudinaryUploadImg(files);

        const images = uploadedImages.map((file) => {
            return {
                url: file.url,
                asset_id: file.asset_id,
                public_id: file.public_id,
            };
        });

        res.json(images);
    } catch (err) {
        throw new Error(err);
    }
});

const deleteImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = cloudinaryDeleteImg(id, 'images');
        res.json({ message: 'deleted' });
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = {
    uploadImages,
    deleteImage,
};
