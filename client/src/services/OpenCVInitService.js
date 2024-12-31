import * as cv from '@techstark/opencv-js';

class OpenCVInitService {
  static isInitialized = false;
  static initPromise = null;

  static async init() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve) => {
      const waitForOpenCV = () => {
        if (cv.Mat) {
          console.log('OpenCV ready');
          this.isInitialized = true;
          resolve();
        } else {
          console.log('Waiting for OpenCV...');
          setTimeout(waitForOpenCV, 30);
        }
      };

      waitForOpenCV();
    });

    return this.initPromise;
  }

  static getInstance() {
    if (!this.isInitialized) {
      throw new Error('OpenCV not initialized. Call init() first.');
    }
    return cv;
  }
}

export default OpenCVInitService;
