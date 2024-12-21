// Garment measurement service using OpenCV.js
export class GarmentMeasurement {
  constructor() {
    this.ready = false;
    this.cv = window.cv;
  }

  async initialize() {
    // Wait for OpenCV.js to be ready
    if (!window.cv) {
      await new Promise((resolve) => {
        const checkCV = setInterval(() => {
          if (window.cv) {
            clearInterval(checkCV);
            this.cv = window.cv;
            resolve();
          }
        }, 100);
      });
    }
    this.ready = true;
  }

  async measureGarment(imageFile) {
    if (!this.ready) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);

      img.onload = () => {
        try {
          // Create canvas and draw image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          // Convert to OpenCV format
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const mat = this.cv.matFromImageData(imgData);

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

          // Get bounding rectangle
          const contour = contours.get(maxContourIndex);
          const rect = this.cv.boundingRect(contour);

          // Calculate dimensions in pixels
          const pixelWidth = rect.width;
          const pixelHeight = rect.height;

          // Convert to inches (assuming 96 DPI)
          const PIXELS_PER_INCH = 96;
          const width = Math.round((pixelWidth / PIXELS_PER_INCH) * 10) / 10;
          const height = Math.round((pixelHeight / PIXELS_PER_INCH) * 10) / 10;
          const depth = Math.round((Math.min(width, height) * 0.4) * 10) / 10;

          // Cleanup
          mat.delete();
          gray.delete();
          blurred.delete();
          edges.delete();
          contours.delete();
          hierarchy.delete();
          URL.revokeObjectURL(url);

          resolve([width, height, depth]);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  // Helper function to draw contours for debugging
  drawContours(canvas, contours, maxContourIndex) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    for (let i = 0; i < contours.size(); i++) {
      const contour = contours.get(i);
      ctx.beginPath();
      for (let j = 0; j < contour.data32S.length; j += 2) {
        const x = contour.data32S[j];
        const y = contour.data32S[j + 1];
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
}
