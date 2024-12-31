// Garment measurement service using OpenCV.js

// Define measurement types for different garments
const GARMENT_TYPES = {
  PANTS: {
    type: 'pants',
    measurements: ['waist', 'inseam', 'hip', 'thigh', 'length'],
    ratios: {
      waist: 1.0,    // Base measurement
      inseam: 0.85,  // Typically 85% of length
      hip: 1.2,      // Usually wider than waist
      thigh: 0.4,    // About 40% of waist
      length: 1.4    // Full length of pants
    }
  },
  SHIRT: {
    type: 'shirt',
    measurements: ['chest', 'neck', 'shoulder', 'sleeve', 'length'],
    ratios: {
      chest: 1.0,     // Base measurement
      neck: 0.4,      // Typically 40% of chest
      shoulder: 0.45, // About 45% of chest
      sleeve: 0.75,   // About 75% of length
      length: 1.2     // Full length of shirt
    }
  },
  DRESS: {
    type: 'dress',
    measurements: ['bust', 'waist', 'hip', 'length'],
    ratios: {
      bust: 1.0,   // Base measurement
      waist: 0.8,  // Usually 80% of bust
      hip: 1.1,    // Slightly larger than bust
      length: 2.0  // Full length of dress
    }
  },
  SKIRT: {
    type: 'skirt',
    measurements: ['waist', 'hip', 'length'],
    ratios: {
      waist: 1.0,  // Base measurement
      hip: 1.2,    // Usually wider than waist
      length: 1.5  // Length of skirt
    }
  }
};

export class GarmentMeasurement {
  constructor() {
    this.ready = false;
    this.cv = null;
    this.debug = true;
    this.PIXELS_PER_INCH = 96;
  }

  async initialize() {
    console.log('Initializing GarmentMeasurement service...');
    if (!window.cv) {
      console.log('Waiting for OpenCV.js to load...');
      await new Promise((resolve) => {
        const checkCV = setInterval(() => {
          if (window.cv) {
            clearInterval(checkCV);
            this.cv = window.cv;
            console.log('OpenCV.js loaded successfully');
            resolve();
          }
        }, 100);
      });
    } else {
      this.cv = window.cv;
      console.log('OpenCV.js already loaded');
    }
    this.ready = true;
  }

  async measureGarment(imageFile, garmentType = 'PANTS') {
    console.log('Starting garment measurement for type:', garmentType);
    if (!this.ready) {
      console.log('Service not ready, initializing...');
      await this.initialize();
    }

    if (!this.cv) {
      throw new Error('OpenCV.js not loaded');
    }

    if (!GARMENT_TYPES[garmentType]) {
      throw new Error(`Unsupported garment type: ${garmentType}`);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);
      console.log('Created image URL:', url);

      img.onload = () => {
        try {
          console.log('Image loaded, dimensions:', img.width, 'x', img.height);
          const measurements = this.processImage(img, garmentType);
          resolve(measurements);
        } catch (error) {
          console.error('Error processing image:', error);
          reject(error);
        } finally {
          URL.revokeObjectURL(url);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  processImage(img, garmentType) {
    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Convert to OpenCV format
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const mat = this.cv.matFromImageData(imgData);

    // Process image to find garment
    const { contour, rect } = this.detectGarment(mat);

    // Calculate base measurements
    const pixelWidth = rect.width;
    const pixelHeight = rect.height;
    
    // Convert to inches
    const width = Math.round((pixelWidth / this.PIXELS_PER_INCH) * 10) / 10;
    const height = Math.round((pixelHeight / this.PIXELS_PER_INCH) * 10) / 10;

    // Calculate garment-specific measurements
    const measurements = this.calculateMeasurements(
      width,
      height,
      GARMENT_TYPES[garmentType]
    );

    // Create debug image if enabled
    let debugImage = null;
    if (this.debug) {
      debugImage = this.createDebugImage(img, contour, rect, measurements);
    }

    // Cleanup OpenCV objects
    mat.delete();

    return {
      type: GARMENT_TYPES[garmentType].type,
      measurements,
      debugImage
    };
  }

  detectGarment(mat) {
    // Convert to grayscale
    const gray = new this.cv.Mat();
    this.cv.cvtColor(mat, gray, this.cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur
    const blurred = new this.cv.Mat();
    const ksize = new this.cv.Size(5, 5);
    this.cv.GaussianBlur(gray, blurred, ksize, 0);

    // Apply Canny edge detection
    const edges = new this.cv.Mat();
    this.cv.Canny(blurred, edges, 50, 150);

    // Find contours
    const contours = new this.cv.MatVector();
    const hierarchy = new this.cv.Mat();
    this.cv.findContours(
      edges,
      contours,
      hierarchy,
      this.cv.RETR_EXTERNAL,
      this.cv.CHAIN_APPROX_SIMPLE
    );

    // Find the largest contour (assumed to be the garment)
    let maxArea = 0;
    let maxContourIndex = -1;
    for (let i = 0; i < contours.size(); i++) {
      const area = this.cv.contourArea(contours.get(i));
      if (area > maxArea) {
        maxArea = area;
        maxContourIndex = i;
      }
    }

    if (maxContourIndex === -1) {
      throw new Error('No garment detected in image');
    }

    // Get the largest contour and its bounding rectangle
    const contour = contours.get(maxContourIndex);
    const rect = this.cv.boundingRect(contour);

    // Cleanup
    gray.delete();
    blurred.delete();
    edges.delete();
    hierarchy.delete();

    return { contour, rect };
  }

  calculateMeasurements(width, height, garmentConfig) {
    const measurements = {};
    const baseMeasurement = Math.max(width, height);

    // Calculate each measurement based on the garment type's ratios
    for (const [measurement, ratio] of Object.entries(garmentConfig.ratios)) {
      measurements[measurement] = Math.round((baseMeasurement * ratio) * 10) / 10;
    }

    return measurements;
  }

  createDebugImage(img, contour, rect, measurements) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // Draw contour
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    const points = contour.data32S;
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // Draw bounding box
    ctx.strokeStyle = 'blue';
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    // Draw measurements
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = '16px Arial';
    let y = 30;
    for (const [measure, value] of Object.entries(measurements)) {
      const text = `${measure}: ${value}"`;
      ctx.strokeText(text, 10, y);
      ctx.fillText(text, 10, y);
      y += 25;
    }

    return canvas.toDataURL();
  }
}
