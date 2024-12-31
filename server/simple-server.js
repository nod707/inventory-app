const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Inventory API Server Running' });
});

// Read users from JSON file
async function getUsers() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8');
    return JSON.parse(data).users;
  } catch (error) {
    console.error('Error reading users:', error);
    // If file doesn't exist, create it with empty users array
    if (error.code === 'ENOENT') {
      await fs.writeFile(
        path.join(__dirname, 'data', 'users.json'),
        JSON.stringify({ users: [] }, null, 2)
      );
      return [];
    }
    throw error;
  }
}

// Write users to JSON file
async function saveUsers(users) {
  try {
    await fs.writeFile(
      path.join(__dirname, 'data', 'users.json'),
      JSON.stringify({ users }, null, 2)
    );
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
}

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = await getUsers();
    console.log('Current users:', users);
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const users = await getUsers();
    console.log('Current users:', users);
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = {
      id: String(users.length + 1),
      email,
      password,
      name
    };

    users.push(newUser);
    await saveUsers(users);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Registration successful for:', email);
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Get user profile endpoint
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await getUsers();
    const user = users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /');
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/register');
  console.log('  GET  /api/auth/me');
});
