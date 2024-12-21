const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageProcessor {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.ensureUploadsDir();
  }

  async ensureUploadsDir() {
    try {
      await fs.access(this.uploadsDir);
      console.log('Uploads directory exists:', this.uploadsDir);
    } catch {
      console.log('Creating uploads directory:', this.uploadsDir);
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  async processImage(file) {
    console.log('Starting to process image:', file.originalname);
    const tempFiles = [];

    try {
      // Basic validation
      if (!file || !file.path) {
        throw new Error('Invalid file object');
      }

      // Generate filenames
      const timestamp = Date.now();
      const safeFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}-${safeFilename}`;
      const processedPath = path.join(this.uploadsDir, filename);
      const thumbnailPath = path.join(this.uploadsDir, `thumb-${filename}`);
      
      tempFiles.push(processedPath, thumbnailPath);

      // Create a new sharp instance for each operation
      const metadata = await sharp(file.path).metadata();
      console.log('Image metadata:', metadata);

      // Process thumbnail
      await sharp(file.path)
        .resize(200, 200, { 
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      console.log('Thumbnail created:', thumbnailPath);

      // Process original image
      await sharp(file.path)
        .jpeg({ quality: 85 })
        .toFile(processedPath);
      console.log('Original image processed:', processedPath);

      // Calculate dimensions
      const dimensions = {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.width / metadata.height
      };

      // Calculate physical dimensions if possible
      let physicalDimensions = null;
      if (metadata.density) {
        physicalDimensions = {
          widthInches: metadata.width / metadata.density,
          heightInches: metadata.height / metadata.density
        };
      }

      // Clean up the temporary file
      try {
        await fs.unlink(file.path);
        console.log('Temporary file deleted:', file.path);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }

      const result = {
        originalPath: processedPath,
        thumbnailPath,
        filename,
        dimensions,
        physicalDimensions,
        format: metadata.format,
        size: metadata.size
      };

      console.log('Image processing complete:', result);
      return result;

    } catch (error) {
      console.error('Image processing error:', error);

      // Clean up any temporary files on error
      for (const tempFile of tempFiles) {
        try {
          await fs.unlink(tempFile).catch(() => {});
        } catch (err) {
          console.error('Error cleaning up temp file:', err);
        }
      }

      // Try to clean up the original uploaded file
      if (file && file.path) {
        try {
          await fs.unlink(file.path).catch(() => {});
        } catch (err) {
          console.error('Error cleaning up uploaded file:', err);
        }
      }

      throw new Error(`Failed to process image: ${error.message}`);
    }
  }
}

module.exports = new ImageProcessor();
