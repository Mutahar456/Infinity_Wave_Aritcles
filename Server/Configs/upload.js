const cloudinary = require('./cloudinary');

const uploadFileToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, { resource_type: 'auto' });
        return result.secure_url;
    } catch (error) {
        throw new Error('Error uploading file to Cloudinary');
    }
};

module.exports = { uploadFileToCloudinary };
