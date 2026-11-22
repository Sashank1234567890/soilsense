require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const demoUsers = [
  {
    name: 'Ramesh Kumar',
    email: 'farmer@soilsense.in',
    password: 'farmerpassword123',
    role: 'farmer',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'Jagraon',
    plotName: 'Plot 01',
    phone: '+91 98765 43210'
  },
  {
    name: 'Dr. Preeti Sharma',
    email: 'agronomist@soilsense.in',
    password: 'agropassword123',
    role: 'agronomist',
    state: 'Punjab',
    district: 'Ludhiana',
    village: 'PAU Campus',
    plotName: 'Research Station Block C',
    phone: '+91 98123 45678'
  },
  {
    name: 'Rahul Verma (NIT Delhi)',
    email: 'student@nitdelhi.ac.in',
    password: 'studentpassword123',
    role: 'student',
    state: 'Delhi',
    district: 'North Delhi',
    village: 'Bakoli',
    plotName: 'Campus Agri-Lab Zone',
    phone: '+91 99999 11111'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soilsense?directConnection=true');
    console.log('[Seed] Connected to MongoDB');

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        existing.name = u.name;
        existing.role = u.role;
        existing.state = u.state;
        existing.district = u.district;
        existing.village = u.village;
        existing.plotName = u.plotName;
        existing.phone = u.phone;
        existing.password = u.password;
        await existing.save();
        console.log(`[Seed] Updated user: ${u.email}`);
      } else {
        await User.create(u);
        console.log(`[Seed] Created user: ${u.email}`);
      }
    }

    console.log('[Seed] Successfully seeded demo users!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seed();
