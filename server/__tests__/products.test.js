const request = require('supertest');
const app = require('../index');
const dbHandler = require('./helpers/db');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');

describe('Product Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await dbHandler.connect();
    // Create a test user and get token
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  });

  afterEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => await dbHandler.closeDatabase());

  describe('POST /api/products', () => {
    const validProduct = {
      name: 'Test Product',
      purchaseLocation: 'Test Store',
      purchasePrice: 10.99,
      sellingLocation: 'Online Store',
      sellingPrice: 20.99,
      dimensions: JSON.stringify([10, 20, 30]),
      purchaseDate: new Date().toISOString(),
      hashtags: JSON.stringify(['test', 'product'])
    };

    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .field(validProduct);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', validProduct.name);
      expect(res.body).toHaveProperty('userId', userId.toString());
    });

    it('should not create product without auth', async () => {
      const res = await request(app)
        .post('/api/products')
        .field(validProduct);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      await Product.create({
        ...validProduct,
        userId,
        dimensions: [10, 20, 30],
        hashtags: ['test', 'product']
      });
    });

    it('should get all products for user', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0]).toHaveProperty('name', validProduct.name);
    });
  });

  describe('PATCH /api/products/:id/sold', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        ...validProduct,
        userId,
        dimensions: [10, 20, 30],
        hashtags: ['test', 'product']
      });
      productId = product._id;
    });

    it('should mark product as sold', async () => {
      const res = await request(app)
        .patch(`/api/products/${productId}/sold`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sellingPrice: 25.99 });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('soldDate');
      expect(res.body).toHaveProperty('sellingPrice', 25.99);
    });
  });
});
