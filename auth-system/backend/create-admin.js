const User = require('./models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

async function createAdmin() {
  try {
    // Connect to MongoDB (using in-memory server for development)
    const mongoServer = await require('mongodb-memory-server').MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('kinfo2013', salt);

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@shrimpfarm.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: kinfo2013');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
