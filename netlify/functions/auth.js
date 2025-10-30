const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../../auth-system/backend/models/User');

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Connect to MongoDB Atlas
  if (!mongoose.connection.readyState) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: 'Database connection failed' }),
      };
    }
  }

  const { path } = event;
  const method = event.httpMethod;
  const body = JSON.parse(event.body || '{}');

  try {
    // Configure nodemailer
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Auth middleware function
    const authMiddleware = async (token) => {
      if (!token) {
        throw new Error('No token provided');
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
      } catch (error) {
        throw new Error('Invalid token');
      }
    };

    // Route handling
    if (path === '/.netlify/functions/auth/register' && method === 'POST') {
      const { username, email, password, confirmPassword } = body;

      if (!username || !email || !password || !confirmPassword) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'All fields are required' }) };
      }

      if (password !== confirmPassword) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Passwords do not match' }) };
      }

      if (password.length < 6) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Password must be at least 6 characters long' }) };
      }

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'User already exists' }) };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({ username, email, password: hashedPassword });
      await user.save();

      return { statusCode: 201, headers, body: JSON.stringify({ message: 'User registered successfully' }) };

    } else if (path === '/.netlify/functions/auth/login' && method === 'POST') {
      const { username, password } = body;

      if (!username || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Username and password are required' }) };
      }

      const user = await User.findOne({ username });
      if (!user) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid credentials' }) };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid credentials' }) };
      }

      const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ token, user: { id: user._id, username: user.username, email: user.email } })
      };

    } else if (path === '/.netlify/functions/auth/me' && method === 'GET') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      const decoded = await authMiddleware(token);
      const user = await User.findById(decoded.userId).select('-password');
      return { statusCode: 200, headers, body: JSON.stringify(user) };

    } else if (path === '/.netlify/functions/auth/users' && method === 'GET') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      const decoded = await authMiddleware(token);
      const currentUser = await User.findById(decoded.userId);
      if (currentUser.role !== 'admin') {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Access denied. Admin role required.' }) };
      }
      const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpires');
      return { statusCode: 200, headers, body: JSON.stringify(users) };

    } else if (path === '/.netlify/functions/auth/users' && method === 'POST') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      const decoded = await authMiddleware(token);
      const currentUser = await User.findById(decoded.userId);
      if (currentUser.role !== 'admin') {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Access denied. Admin role required.' }) };
      }

      const { username, email, password, role } = body;
      if (!username || !email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Username, email, and password are required' }) };
      }

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'User already exists' }) };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = new User({ username, email, password: hashedPassword, role: role || 'user' });
      await user.save();

      const userResponse = await User.findById(user._id).select('-password -resetPasswordToken -resetPasswordExpires');
      return { statusCode: 201, headers, body: JSON.stringify(userResponse) };

    } else if (path.startsWith('/.netlify/functions/auth/users/') && method === 'PUT') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      const decoded = await authMiddleware(token);
      const currentUser = await User.findById(decoded.userId);
      if (currentUser.role !== 'admin') {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Access denied. Admin role required.' }) };
      }

      const userId = path.split('/').pop();
      const { username, email, role } = body;
      const user = await User.findById(userId);
      if (!user) {
        return { statusCode: 404, headers, body: JSON.stringify({ message: 'User not found' }) };
      }

      user.username = username || user.username;
      user.email = email || user.email;
      user.role = role || user.role;
      await user.save();

      const updatedUser = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
      return { statusCode: 200, headers, body: JSON.stringify(updatedUser) };

    } else if (path.startsWith('/.netlify/functions/auth/users/') && method === 'DELETE') {
      const token = event.headers.authorization?.replace('Bearer ', '');
      const decoded = await authMiddleware(token);
      const currentUser = await User.findById(decoded.userId);
      if (currentUser.role !== 'admin') {
        return { statusCode: 403, headers, body: JSON.stringify({ message: 'Access denied. Admin role required.' }) };
      }

      const userId = path.split('/').pop();
      if (userId === decoded.userId) {
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Cannot delete your own account' }) };
      }

      await User.findByIdAndDelete(userId);
      return { statusCode: 200, headers, body: JSON.stringify({ message: 'User deleted successfully' }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ message: 'Route not found' }) };

  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error' }) };
  }
};
