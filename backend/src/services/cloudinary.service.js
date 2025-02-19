const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
    /**
     * Upload a file to Cloudinary
     * @param {string} filePath - Path to the file to upload
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Cloudinary upload response
     */
    async uploadFile(filePath, options = {}) {
        try {
            if (!filePath) {
                throw new Error('No file path provided');
            }

            // Upload options
            const uploadOptions = {
                folder: options.folder || 'earndrip',
                resource_type: options.resource_type || 'auto',
                public_id: options.public_id,
                transformation: [
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                    ...(options.transformation || [])
                ]
            };

            console.log('Uploading to Cloudinary with options:', {
                ...uploadOptions,
                filePath,
                resource_type: uploadOptions.resource_type,
                folder: uploadOptions.folder
            });

            // Upload file to Cloudinary
            const result = await cloudinary.uploader.upload(filePath, uploadOptions);

            console.log('Cloudinary upload successful:', {
                publicId: result.public_id,
                url: result.secure_url,
                format: result.format,
                size: result.bytes
            });

            return {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                size: result.bytes
            };
        } catch (error) {
            console.error('Cloudinary service error:', error);
            throw new Error(error.message || 'Failed to upload file to Cloudinary');
        }
    }

    /**
     * Delete a file from Cloudinary
     * @param {string} publicId - The public ID of the file to delete
     * @returns {Promise<Object>} Cloudinary deletion response
     */
    async deleteFile(publicId) {
        try {
            if (!publicId) {
                throw new Error('No public ID provided');
            }

            console.log('Deleting file from Cloudinary:', publicId);
            const result = await cloudinary.uploader.destroy(publicId);
            
            console.log('Cloudinary delete result:', result);
            return result;
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            throw new Error(error.message || 'Failed to delete file from Cloudinary');
        }
    }
}

module.exports = new CloudinaryService();
