import { useEffect, useState } from 'react';

const OpenCVLoader = ({ onLoad }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('OpenCVLoader mounted');
    
    if (window.cv) {
      console.log('OpenCV already loaded');
      setLoading(false);
      onLoad && onLoad(window.cv);
      return;
    }

    const script = document.createElement('script');
    script.src = '/assets/js/opencv.js';
    script.async = true;
    script.type = 'text/javascript';

    console.log('Created OpenCV script element');

    const checkOpenCV = () => {
      console.log('Checking OpenCV availability...');
      if (window.cv && window.cv.Mat) {
        console.log('OpenCV is now available');
        setLoading(false);
        onLoad && onLoad(window.cv);
      } else {
        console.log('OpenCV not yet available, retrying...');
        setTimeout(checkOpenCV, 100);
      }
    };

    script.onload = () => {
      console.log('OpenCV script loaded');
      checkOpenCV();
    };

    script.onerror = (e) => {
      console.error('Failed to load OpenCV:', e);
      setError('Failed to load OpenCV');
      setLoading(false);
    };

    document.body.appendChild(script);
    console.log('Added OpenCV script to document');

    return () => {
      console.log('OpenCVLoader cleanup');
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onLoad]);

  if (error) {
    return (
      <div style={{
        padding: '20px',
        color: 'red',
        textAlign: 'center'
      }}>
        Error loading OpenCV: {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        color: '#666',
        textAlign: 'center'
      }}>
        Loading OpenCV...
      </div>
    );
  }

  return null;
};

export default OpenCVLoader;
