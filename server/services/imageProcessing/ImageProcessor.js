const sharp = require('sharp');
const { RemoveBgResult, removeBackgroundFromImageBase64 } = require('remove.bg');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;

class ImageProcessor {
  constructor() {
    this.removeBgApiKey = process.env.REMOVE_BG_API_KEY;
    this.outputDir = path.join(process.cwd(), 'uploads', 'processed');
    this.ensureOutputDir();
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Error creating output directory:', error);
    }
  }

  async processImage(inputBuffer, options = {}) {
    try {
      const {
        removeBackground = true,
        enhance = true,
        resize = true,
        watermark = false,
        platform = null
      } = options;

      let processedBuffer = inputBuffer;

      // Remove background if requested
      if (removeBackground) {
        processedBuffer = await this.removeBackground(processedBuffer);
      }

      // Enhance image quality
      if (enhance) {
        processedBuffer = await this.enhanceImage(processedBuffer);
      }

      // Resize for specific platform if specified
      if (resize && platform) {
        processedBuffer = await this.resizeForPlatform(processedBuffer, platform);
      }

      // Add watermark if requested
      if (watermark) {
        processedBuffer = await this.addWatermark(processedBuffer);
      }

      return processedBuffer;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  async removeBackground(inputBuffer) {
    try {
      // Convert buffer to base64
      const base64Image = inputBuffer.toString('base64');

      // Call remove.bg API
      const result = await removeBackgroundFromImageBase64({
        base64img: base64Image,
        apiKey: this.removeBgApiKey,
        size: 'regular',
        type: 'auto',
        format: 'png',
        bg_color: null
      });

      // Convert result back to buffer
      return Buffer.from(result.base64img, 'base64');
    } catch (error) {
      console.error('Error removing background:', error);
      throw error;
    }
  }

  async enhanceImage(inputBuffer) {
    try {
      return await sharp(inputBuffer)
        // Adjust brightness and contrast
        .modulate({
          brightness: 1.1,
          saturation: 1.2
        })
        // Sharpen the image
        .sharpen({
          sigma: 1.5,
          m1: 0.5,
          m2: 0.5
        })
        // Reduce noise
        .median(1)
        // Ensure good quality
        .jpeg({
          quality: 90,
          chromaSubsampling: '4:4:4'
        })
        .toBuffer();
    } catch (error) {
      console.error('Error enhancing image:', error);
      throw error;
    }
  }

  async resizeForPlatform(inputBuffer, platform) {
    // Platform-specific image requirements
    const platformSpecs = {
      poshmark: { width: 1200, height: 1200 },
      ebay: { width: 1600, height: 1600 },
      mercari: { width: 1080, height: 1080 },
      therealreal: { width: 1500, height: 1500 }
    };

    const specs = platformSpecs[platform] || { width: 1200, height: 1200 };

    try {
      return await sharp(inputBuffer)
        .resize(specs.width, specs.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toBuffer();
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error;
    }
  }

  async addWatermark(inputBuffer, watermarkText = '') {
    try {
      // Create a transparent SVG watermark
      const svgWatermark = `
        <svg width="500" height="100">
          <style>
            .text { fill: rgba(255,255,255,0.5); font-size: 24px; font-family: Arial; }
          </style>
          <text x="50%" y="50%" text-anchor="middle" class="text">${watermarkText}</text>
        </svg>
      `;

      // Get original image dimensions
      const metadata = await sharp(inputBuffer).metadata();

      // Composite the watermark onto the image
      return await sharp(inputBuffer)
        .composite([{
          input: Buffer.from(svgWatermark),
          gravity: 'southeast',
          blend: 'over'
        }])
        .toBuffer();
    } catch (error) {
      console.error('Error adding watermark:', error);
      throw error;
    }
  }

  async generateThumbnail(inputBuffer, width = 300, height = 300) {
    try {
      return await sharp(inputBuffer)
        .resize(width, height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  async saveProcessedImage(buffer, filename) {
    const outputPath = path.join(this.outputDir, filename);
    try {
      await fs.writeFile(outputPath, buffer);
      return outputPath;
    } catch (error) {
      console.error('Error saving processed image:', error);
      throw error;
    }
  }
}

module.exports = new ImageProcessor();
