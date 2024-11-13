const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Create storage engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'LocalMart',
        allowedFormats: ['jpeg', 'jpg', 'png', 'gif'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

module.exports = {
    cloudinary,
    storage
}; 