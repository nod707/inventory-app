const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "http://localhost:*"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'", 
        "http://localhost:*",
        "https://docs.opencv.org", 
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "blob:", "data:", "https:", "http://localhost:*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'", 
        "http://localhost:*", 
        "https://api.posherdashboard.com",
        "ws://localhost:*"
      ],
      workerSrc: ["'self'", "blob:"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:4173', // Vite's new port
      'http://localhost:5173', // Vite's default port
      'http://localhost:3000', // React's default port
      'http://localhost:3002', // Our test page
      process.env.CORS_ORIGIN
    ].filter(Boolean); // Remove any undefined/null values
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.error('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Add logging middleware
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Connect to MongoDB with enhanced options
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s
  family: 4 // Use IPv4, skip trying IPv6
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  console.log('Connection Host:', mongoose.connection.host);
  console.log('Database Name:', mongoose.connection.name);
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Handle application termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Import routes
const authRoutes = require('./routes/auth');
const marketplaceRoutes = require('./routes/marketplace');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      message: `${field} already exists` 
    });
  }
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'CORS Error: Origin not allowed',
      allowedOrigins: [
        'http://localhost:4173',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3002',
        process.env.CORS_ORIGIN
      ].filter(Boolean)
    });
  }
  
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed origins:', [
    'http://localhost:4173',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3002',
    process.env.CORS_ORIGIN
  ].filter(Boolean));
});
