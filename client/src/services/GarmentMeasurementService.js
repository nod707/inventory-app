import * as tf from '@tensorflow/tfjs';
import OpenCVInitService from './OpenCVInitService';

export class GarmentMeasurementService {
  static async measureGarment(imageFile, garmentType, view = 'front') {
    try {
      // Initialize OpenCV
      await OpenCVInitService.init();
      const cv = OpenCVInitService.getInstance();
      
      console.log('OpenCV initialized successfully');

      // Convert File to Image
      const image = await this.fileToImage(imageFile);
      console.log('Image converted', image.width, image.height);
      
      // Convert Image to OpenCV Mat
      const mat = await this.imageToMat(image, cv);
      console.log('Mat created', mat.rows, mat.cols);
      
      // Process image for garment detection
      const processedMat = this.processGarmentImage(mat, cv);
      console.log('Image processed');
      
      // For testing, return basic measurements based on image size
      const basicMeasurements = this.getBasicMeasurements(mat);
      console.log('Basic measurements calculated', basicMeasurements);
      
      // Cleanup
      mat.delete();
      processedMat.delete();
      
      return basicMeasurements;
    } catch (error) {
      console.error('Error measuring garment:', error);
      throw new Error(`Failed to measure garment: ${error.message}`);
    }
  }

  static fileToImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  static imageToMat(image, cv) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return cv.matFromImageData(imgData);
    } catch (error) {
      throw new Error('Failed to convert image to OpenCV matrix');
    }
  }

  static processGarmentImage(mat, cv) {
    try {
      // Convert to grayscale
      const gray = new cv.Mat();
      cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
      
      // Apply adaptive thresholding for better edge detection
      const binary = new cv.Mat();
      cv.adaptiveThreshold(
        gray,
        binary,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11,
        2
      );
      
      // Apply morphological operations to remove noise
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      const cleaned = new cv.Mat();
      cv.morphologyEx(binary, cleaned, cv.MORPH_CLOSE, kernel);
      
      // Cleanup
      gray.delete();
      binary.delete();
      kernel.delete();
      
      return cleaned;
    } catch (error) {
      throw new Error('Failed to process image');
    }
  }

  static getBasicMeasurements(mat) {
    // For testing, return measurements based on image dimensions
    const pixelsPerInch = 96; // Standard screen DPI
    const width = mat.cols / pixelsPerInch;
    const height = mat.rows / pixelsPerInch;
    
    return {
      shoulders: (width * 0.8).toFixed(2),
      chest: (width * 0.7).toFixed(2),
      waist: (width * 0.6).toFixed(2),
      hip: (width * 0.7).toFixed(2),
      length: (height * 0.9).toFixed(2),
      sleeve: (width * 0.4).toFixed(2),
      unit: 'inches'
    };
  }

  static async detectGarmentPoints(mat, garmentType, view) {
    // Load pre-trained model for garment keypoint detection
    // This is a placeholder - you'll need to train a real model
    const model = await this.loadGarmentModel(garmentType);
    
    // Convert mat to tensor
    const tensor = this.matToTensor(mat);
    
    // Get keypoint predictions
    const predictions = await model.predict(tensor);
    
    // Convert predictions to points
    const points = this.predictionsToPoints(predictions, garmentType, view);
    
    return points;
  }

  static async loadGarmentModel(garmentType) {
    // Placeholder for model loading
    // You'll need to train and save real models for each garment type
    return {
      predict: async (tensor) => {
        // Simulate keypoint detection
        return {
          shoulders: { x: 100, y: 50 },
          chest: { x: 100, y: 100 },
          waist: { x: 100, y: 150 },
          hip: { x: 100, y: 200 },
          length: { x: 100, y: 250 }
        };
      }
    };
  }

  static matToTensor(mat) {
    // Convert OpenCV mat to TensorFlow tensor
    const tensor = tf.browser.fromPixels(mat);
    return tensor;
  }

  static predictionsToPoints(predictions, garmentType, view) {
    // Convert model predictions to measurement points
    return predictions;
  }

  static calculateMeasurements(points, garmentType) {
    const measurements = {};
    const pixelsPerInch = 96; // This should be calibrated based on a reference object
    
    switch (garmentType) {
      case 'SHIRT':
        measurements.shoulders = this.calculateDistance(points.shoulders.left, points.shoulders.right) / pixelsPerInch;
        measurements.chest = this.calculateDistance(points.chest.left, points.chest.right) / pixelsPerInch;
        measurements.waist = this.calculateDistance(points.waist.left, points.waist.right) / pixelsPerInch;
        measurements.length = this.calculateDistance(points.shoulders.top, points.length.bottom) / pixelsPerInch;
        measurements.sleeve = this.calculateSleeveLength(points.sleeve) / pixelsPerInch;
        break;
        
      case 'PANTS':
        measurements.waist = this.calculateDistance(points.waist.left, points.waist.right) / pixelsPerInch;
        measurements.hip = this.calculateDistance(points.hip.left, points.hip.right) / pixelsPerInch;
        measurements.inseam = this.calculateDistance(points.inseam.top, points.inseam.bottom) / pixelsPerInch;
        measurements.outseam = this.calculateDistance(points.outseam.top, points.outseam.bottom) / pixelsPerInch;
        measurements.legOpening = this.calculateDistance(points.legOpening.left, points.legOpening.right) / pixelsPerInch;
        break;
        
      case 'DRESS':
        measurements.shoulders = this.calculateDistance(points.shoulders.left, points.shoulders.right) / pixelsPerInch;
        measurements.bust = this.calculateDistance(points.bust.left, points.bust.right) / pixelsPerInch;
        measurements.waist = this.calculateDistance(points.waist.left, points.waist.right) / pixelsPerInch;
        measurements.hip = this.calculateDistance(points.hip.left, points.hip.right) / pixelsPerInch;
        measurements.length = this.calculateDistance(points.shoulders.top, points.length.bottom) / pixelsPerInch;
        break;
    }
    
    return measurements;
  }

  static calculateDistance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  }

  static calculateSleeveLength(sleevePoints) {
    // Calculate sleeve length following the arm curve
    let length = 0;
    for (let i = 1; i < sleevePoints.length; i++) {
      length += this.calculateDistance(sleevePoints[i - 1], sleevePoints[i]);
    }
    return length;
  }

  // Helper method to validate measurement results
  static validateMeasurements(measurements, garmentType) {
    const expectedPoints = GARMENT_TYPES[garmentType].points;
    const missingPoints = expectedPoints.filter(point => !measurements[point]);
    
    if (missingPoints.length > 0) {
      throw new Error(`Missing measurements for: ${missingPoints.join(', ')}`);
    }
    
    // Add reasonable range checks
    for (const [measure, value] of Object.entries(measurements)) {
      if (value <= 0 || value > 100) { // 100 inches as a reasonable max
        throw new Error(`Invalid measurement for ${measure}: ${value}`);
      }
    }
    
    return true;
  }
}

// Garment types and their measurement points
const GARMENT_TYPES = {
  SHIRT: {
    points: ['shoulders', 'chest', 'waist', 'length', 'sleeve'],
    requiredViews: ['front', 'back']
  },
  PANTS: {
    points: ['waist', 'hip', 'inseam', 'outseam', 'leg_opening'],
    requiredViews: ['front', 'side']
  },
  DRESS: {
    points: ['shoulders', 'bust', 'waist', 'hip', 'length'],
    requiredViews: ['front', 'back']
  }
};
