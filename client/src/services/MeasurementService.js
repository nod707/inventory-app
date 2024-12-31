import * as tf from '@tensorflow/tfjs';
import cv from '@techstark/opencv-js';

export class MeasurementService {
  static async measureFromImage(imageFile) {
    try {
      // Convert File to Image
      const image = await this.fileToImage(imageFile);
      
      // Convert Image to OpenCV Mat
      const mat = await this.imageToMat(image);
      
      // Process image to detect edges
      const processedMat = this.processImage(mat);
      
      // Detect object boundaries
      const measurements = this.detectMeasurements(processedMat);
      
      // Cleanup
      mat.delete();
      processedMat.delete();
      
      return measurements;
    } catch (error) {
      console.error('Error measuring image:', error);
      throw error;
    }
  }

  static fileToImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  static imageToMat(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    // Convert canvas to Mat
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return cv.matFromImageData(imgData);
  }

  static processImage(mat) {
    // Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
    
    // Apply Gaussian blur
    const blurred = new cv.Mat();
    const ksize = new cv.Size(5, 5);
    cv.GaussianBlur(gray, blurred, ksize, 0);
    
    // Detect edges using Canny
    const edges = new cv.Mat();
    cv.Canny(blurred, edges, 50, 150);
    
    // Cleanup intermediate matrices
    gray.delete();
    blurred.delete();
    
    return edges;
  }

  static detectMeasurements(edges) {
    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      edges,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Find the largest contour (assumed to be the object)
    let maxArea = 0;
    let maxContourIndex = -1;
    for (let i = 0; i < contours.size(); i++) {
      const area = cv.contourArea(contours.get(i));
      if (area > maxArea) {
        maxArea = area;
        maxContourIndex = i;
      }
    }

    if (maxContourIndex === -1) {
      hierarchy.delete();
      contours.delete();
      return null;
    }

    // Get bounding rectangle
    const rect = cv.boundingRect(contours.get(maxContourIndex));
    
    // Calculate pixel to inch ratio (assuming standard DPI)
    const DPI = 96; // Standard screen DPI
    const pixelsPerInch = DPI;
    
    // Convert measurements to inches
    const measurements = {
      width: (rect.width / pixelsPerInch).toFixed(2),
      height: (rect.height / pixelsPerInch).toFixed(2),
      unit: 'inches'
    };

    // Cleanup
    hierarchy.delete();
    contours.delete();

    return measurements;
  }
}
