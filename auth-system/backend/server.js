const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (in-memory for development)
async function connectDB() {
  try {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB in-memory connected');
  } catch (err) {
    console.log('MongoDB connection error:', err.message);
    console.log('Make sure MongoDB is running locally or update MONGO_URI in .env');
  }
}

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tank', require('./routes/tank'));
app.use('/api/tanks', require('./routes/tanks'));
app.use('/api/shrimp', require('./routes/shrimp'));

// Protected route example
app.get('/api/protected', require('./middleware/auth'), (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
