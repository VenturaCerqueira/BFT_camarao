const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://andersonventuracerqueira1999_db_user:nBAPYDeG8PIyU2D8@bftcamarao.f0yirtj.mongodb.net/bftcamarao?appName=BFTCamarao';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Atlas connected');
  } catch (err) {
    console.log('MongoDB connection error:', err.message);
  }
}

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tank', require('./routes/tank'));
app.use('/api/tanks', require('./routes/tanks'));
app.use('/api/shrimp', require('./routes/shrimp'));
app.use('/api/feeding', require('./routes/feeding'));
app.use('/api/expenses', require('./routes/expenses'));

// Protected route example
app.get('/api/protected', require('./middleware/auth'), (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
