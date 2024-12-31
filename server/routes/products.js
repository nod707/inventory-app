const router = require('express').Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const imageProcessor = require('../services/imageProcessor');
const fs = require('fs').promises;

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: async function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/temp');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
      cb(error);
    }
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Create product
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  const processedImages = [];
  
  try {
    // Validate required fields
    const {
      title,
      description,
      category,
      condition,
      price,
    } = req.body;

    if (!title || !description || !category || !condition || !price) {
      throw new Error('Missing required fields');
    }

    // Process images sequentially
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const processedImage = await imageProcessor.processImage(file);
          processedImages.push(processedImage);
        } catch (error) {
          console.error('Error processing image:', error);
          // Continue with other images
        }
      }
    }

    // Create product with processed images
    const product = new Product({
      user: req.user.id,
      title,
      description,
      category,
      condition,
      brand: req.body.brand,
      color: req.body.color,
      size: req.body.size,
      price: parseFloat(price),
      measurements: req.body.measurements ? JSON.parse(req.body.measurements) : undefined,
      images: processedImages.map(img => ({
        original: img.originalPath,
        thumbnail: img.thumbnailPath,
        dimensions: img.dimensions
      }))
    });

    await product.save();
    res.status(201).json(product);

  } catch (error) {
    // Clean up any processed images if product creation fails
    for (const img of processedImages) {
      try {
        if (img.originalPath) await fs.unlink(img.originalPath).catch(() => {});
        if (img.thumbnailPath) await fs.unlink(img.thumbnailPath).catch(() => {});
      } catch (err) {
        console.error('Error cleaning up images:', err);
      }
    }

    // Clean up any remaining temporary files
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path).catch(() => {});
        } catch (err) {
          console.error('Error cleaning up temporary file:', err);
        }
      }
    }

    res.status(400).json({ 
      error: error.message || 'Error creating product'
    });
  }
});

// Import product from marketplace
router.post('/import', async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      images,
      condition,
      seller,
      source
    } = req.body;

    // Clean up price string and convert to number
    const cleanPrice = parseFloat(price.replace(/[^0-9.]/g, ''));

    // Create new product
    const product = new Product({
      name: title,
      price: cleanPrice,
      description,
      images,
      condition,
      originalListing: {
        seller,
        url: source.url,
        marketplace: source.marketplace,
        importedAt: new Date()
      },
      status: 'imported'
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product imported successfully',
      product
    });
  } catch (error) {
    console.error('Error importing product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import product',
      error: error.message
    });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
});

// Get user's products
router.get('/user', auth, async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('user', 'name email');
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated images
    if (product.images) {
      for (const image of product.images) {
        try {
          if (image.original) await fs.unlink(image.original).catch(() => {});
          if (image.thumbnail) await fs.unlink(image.thumbnail).catch(() => {});
        } catch (err) {
          console.error('Error deleting product images:', err);
        }
      }
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

module.exports = router;
