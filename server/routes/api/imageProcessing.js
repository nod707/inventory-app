const express = require('express');
const router = express.Router();
const multer = require('multer');
const ImageProcessor = require('../../services/imageProcessing/ImageProcessor');
const auth = require('../../middleware/auth');
const path = require('path');
const crypto = require('crypto');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
  },
});

// Process single image
router.post('/process', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const options = {
      removeBackground: req.body.removeBackground === 'true',
      enhance: req.body.enhance === 'true',
      resize: req.body.resize === 'true',
      watermark: req.body.watermark === 'true',
      platform: req.body.platform
    };

    // Generate unique filename
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;

    // Process the image
    const processedBuffer = await ImageProcessor.processImage(
      req.file.buffer,
      options
    );

    // Save the processed image
    const savedPath = await ImageProcessor.saveProcessedImage(
      processedBuffer,
      fileName
    );

    // Generate thumbnail
    const thumbnailBuffer = await ImageProcessor.generateThumbnail(processedBuffer);
    const thumbnailName = `thumb_${fileName}`;
    const thumbnailPath = await ImageProcessor.saveProcessedImage(
      thumbnailBuffer,
      thumbnailName
    );

    res.json({
      success: true,
      originalName: req.file.originalname,
      processedImage: `/uploads/processed/${fileName}`,
      thumbnail: `/uploads/processed/${thumbnailName}`,
      size: processedBuffer.length,
      options
    });
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({
      error: 'Failed to process image',
      details: error.message
    });
  }
});

// Batch process multiple images
router.post('/batch', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const options = {
      removeBackground: req.body.removeBackground === 'true',
      enhance: req.body.enhance === 'true',
      resize: req.body.resize === 'true',
      watermark: req.body.watermark === 'true',
      platform: req.body.platform
    };

    const results = await Promise.all(
      req.files.map(async (file) => {
        try {
          const fileExt = path.extname(file.originalname);
          const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;

          const processedBuffer = await ImageProcessor.processImage(
            file.buffer,
            options
          );

          const savedPath = await ImageProcessor.saveProcessedImage(
            processedBuffer,
            fileName
          );

          const thumbnailBuffer = await ImageProcessor.generateThumbnail(processedBuffer);
          const thumbnailName = `thumb_${fileName}`;
          const thumbnailPath = await ImageProcessor.saveProcessedImage(
            thumbnailBuffer,
            thumbnailName
          );

          return {
            success: true,
            originalName: file.originalname,
            processedImage: `/uploads/processed/${fileName}`,
            thumbnail: `/uploads/processed/${thumbnailName}`,
            size: processedBuffer.length
          };
        } catch (error) {
          return {
            success: false,
            originalName: file.originalname,
            error: error.message
          };
        }
      })
    );

    res.json({
      success: true,
      results,
      totalProcessed: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    res.status(500).json({
      error: 'Failed to process images',
      details: error.message
    });
  }
});

module.exports = router;
