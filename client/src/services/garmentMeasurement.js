// Garment measurement service using OpenCV.js
export class GarmentMeasurement {
  constructor() {
    this.ready = false;
    this.cv = null;
    this.debug = true;
  }

  async initialize() {
    console.log('Initializing GarmentMeasurement service...');
    // Wait for OpenCV.js to be ready
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

  async measureGarment(imageFile) {
    console.log('Starting garment measurement...');
    if (!this.ready) {
      console.log('Service not ready, initializing...');
      await this.initialize();
    }

    if (!this.cv) {
      throw new Error('OpenCV.js not loaded');
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);
      console.log('Created image URL:', url);

      img.onload = () => {
        try {
          console.log('Image loaded, dimensions:', img.width, 'x', img.height);
          // Create canvas and draw image
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          console.log('Image drawn to canvas');

          // Convert to OpenCV format
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const mat = this.cv.matFromImageData(imgData);
          console.log('Converted to OpenCV Mat');

          // Convert to grayscale
          const gray = new this.cv.Mat();
          this.cv.cvtColor(mat, gray, this.cv.COLOR_RGBA2GRAY);
          console.log('Converted to grayscale');

          // Apply Gaussian blur
          const blurred = new this.cv.Mat();
          const ksize = new this.cv.Size(5, 5);
          this.cv.GaussianBlur(gray, blurred, ksize, 0);
          console.log('Applied Gaussian blur');

          // Apply Canny edge detection
          const edges = new this.cv.Mat();
          this.cv.Canny(blurred, edges, 50, 150);
          console.log('Applied Canny edge detection');

          if (this.debug) {
            // Draw edges on debug canvas
            const debugCanvas = document.createElement('canvas');
            debugCanvas.width = img.width;
            debugCanvas.height = img.height;
            const debugCtx = debugCanvas.getContext('2d');
            
            // Convert edges to RGBA
            const edgesRGBA = new this.cv.Mat();
            this.cv.cvtColor(edges, edgesRGBA, this.cv.COLOR_GRAY2RGBA);
            
            // Create ImageData and draw
            const edgesImgData = new ImageData(
              new Uint8ClampedArray(edgesRGBA.data),
              edgesRGBA.cols,
              edgesRGBA.rows
            );
            debugCtx.putImageData(edgesImgData, 0, 0);
            console.log('Drew edges to debug canvas');
          }

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
          console.log('Found contours:', contours.size());

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
          console.log('Largest contour area:', maxArea);

          if (maxContourIndex === -1) {
            throw new Error('No garment detected in image');
          }

          // Get bounding rectangle
          const contour = contours.get(maxContourIndex);
          const rect = this.cv.boundingRect(contour);
          console.log('Bounding rect:', rect);

          // Calculate dimensions in pixels
          const pixelWidth = rect.width;
          const pixelHeight = rect.height;
          console.log('Pixel dimensions:', pixelWidth, 'x', pixelHeight);

          // Convert to inches (assuming 96 DPI)
          const PIXELS_PER_INCH = 96;
          const width = Math.round((pixelWidth / PIXELS_PER_INCH) * 10) / 10;
          const height = Math.round((pixelHeight / PIXELS_PER_INCH) * 10) / 10;
          const depth = Math.round((Math.min(width, height) * 0.4) * 10) / 10;
          console.log('Final dimensions (inches):', [width, height, depth]);

          // Draw contours on debug canvas if debugging
          if (this.debug) {
            const debugCanvas = document.createElement('canvas');
            debugCanvas.width = img.width;
            debugCanvas.height = img.height;
            const debugCtx = debugCanvas.getContext('2d');
            
            // Draw original image
            debugCtx.drawImage(img, 0, 0);
            
            // Draw contour
            debugCtx.strokeStyle = 'red';
            debugCtx.lineWidth = 2;
            const points = contour.data32S;
            debugCtx.beginPath();
            for (let i = 0; i < points.length; i += 2) {
              const x = points[i];
              const y = points[i + 1];
              if (i === 0) {
                debugCtx.moveTo(x, y);
              } else {
                debugCtx.lineTo(x, y);
              }
            }
            debugCtx.closePath();
            debugCtx.stroke();
            
            // Draw bounding box
            debugCtx.strokeStyle = 'blue';
            debugCtx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            
            // Save debug image
            const debugImage = debugCanvas.toDataURL();
            console.log('Created debug image');
            
            // Return both dimensions and debug image
            resolve({
              dimensions: [width, height, depth],
              debugImage
            });
          } else {
            resolve({
              dimensions: [width, height, depth]
            });
          }

          // Cleanup
          mat.delete();
          gray.delete();
          blurred.delete();
          edges.delete();
          contours.delete();
          hierarchy.delete();
          URL.revokeObjectURL(url);

        } catch (error) {
          console.error('Error in image processing:', error);
          reject(error);
        }
      };

      img.onerror = (error) => {
        console.error('Error loading image:', error);
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }
}
