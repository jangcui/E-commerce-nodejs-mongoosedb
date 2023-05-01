const cloudinary = require('cloudinary');
const sharp = require('sharp');
const fs = require('fs');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

// const cloudinaryUploadImg = async (fileToUpLoads) => {
//     const results = await Promise.all(
//         fileToUpLoads.map(async (file) => {
//             const resizedImage = await sharp(file.path)
//                 .resize({
//                     width: 1000,
//                     height: 1000,
//                     fit: sharp.fit.inside,
//                     withoutEnlargement: true,
//                 })
//                 .jpeg({
//                     quality: 100,
//                     progressive: true,
//                 })
//                 .toFormat('jpeg')
//                 .toBuffer();

//             const uploadedImage = await new Promise((resolve) => {
//                 cloudinary.uploader
//                     .upload_stream((result) => {
//                         resolve({
//                             url: result.secure_url,
//                             asset_id: result.asset_id,
//                             public_id: result.public_id,
//                         });
//                     })
//                     .end(resizedImage);
//             });

//             fs.unlinkSync(file.path);

//             return {
//                 url: uploadedImage.url,
//                 asset_id: uploadedImage.asset_id,
//                 public_id: uploadedImage.public_id,
//             };
//         }),
//     );

//     return results;
// };

const cloudinaryUploadImg = (fileToUpLoads) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(fileToUpLoads, (result, error) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    url: result.secure_url,
                    asset_id: result.asset_id,
                    public_id: result.public_id,
                });
            }
        });
    });
};

const cloudinaryDeleteImg = async (fileToDelete) => {
    return new Promise((resolve) => {
        cloudinary.uploader.destroy(fileToDelete, (result) => {
            resolve(
                {
                    url: result.secure_url,
                    asset_id: result.asset_id,
                    public_id: result.public_id,
                },
                {
                    resource_type: 'auto',
                },
            );
        });
    });
};
module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };
