require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');

// Inline models to avoid circular deps in seed
const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

const ProgramSchema = new mongoose.Schema({
  title: String, type: String, date: String, time: String,
  location: String, description: String, upcoming: Boolean,
  createdAt: { type: Date, default: Date.now },
});
const Program = mongoose.models.Program || mongoose.model('Program', ProgramSchema);

const DevotionalSchema = new mongoose.Schema({
  title: String, scripture: String, content: String,
  author: String, category: String, date: String,
  createdAt: { type: Date, default: Date.now },
});
const Devotional = mongoose.models.Devotional || mongoose.model('Devotional', DevotionalSchema);

const TestimonySchema = new mongoose.Schema({
  name: String, location: String, text: String,
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Testimony = mongoose.models.Testimony || mongoose.model('Testimony', TestimonySchema);

const seedDB = async () => {
  await connectDB();

  console.log('🌱 Starting database seed...\n');

  // Clear existing data
  await Promise.all([
    Admin.deleteMany({}),
    Program.deleteMany({}),
    Devotional.deleteMany({}),
    Testimony.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create admin
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await Admin.create({
    name: 'Admin',
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
  });
  console.log(`👤 Admin created: ${process.env.ADMIN_EMAIL}`);

  // Seed programs
  await Program.insertMany([
    {
      title: 'Sunday Worship Service',
      type: 'Worship',
      date: '2025-12-07',
      time: '9:00 AM',
      location: 'Online & Physical',
      description: 'Join us for a powerful time of worship, prayer, and the Word.',
      upcoming: true,
    },
    {
      title: 'Kingdom Fireside Night',
      type: 'Prayer',
      date: '2025-12-13',
      time: '8:00 PM',
      location: 'Online (Zoom)',
      description: 'An intimate night of prayer, intercession and prophetic declarations.',
      upcoming: true,
    },
    {
      title: 'The Call Conference 2025',
      type: 'Conference',
      date: '2025-12-20',
      time: '10:00 AM',
      location: 'Lagos, Nigeria',
      description: 'Our annual gathering of believers across nations — expect an encounter.',
      upcoming: true,
    },
  ]);
  console.log('📅 Programs seeded');

  // Seed devotionals
  await Devotional.insertMany([
    {
      title: 'Walk in Your Calling',
      scripture: 'Romans 8:28',
      content: "God's call on your life is irrevocable. Today, take one bold step towards what He has placed in your heart. The season of hesitation is over — this is your moment.",
      author: 'Pastor Emmanuel A.',
      category: 'Faith',
      date: '2025-12-04',
    },
    {
      title: 'The Power of Intercession',
      scripture: 'James 5:16',
      content: 'Prayer is not a last resort — it is our first response. When we intercede for others, we partner with heaven to bring transformation to the earth.',
      author: 'Pastor Emmanuel A.',
      category: 'Prayer',
      date: '2025-12-01',
    },
  ]);
  console.log('📖 Devotionals seeded');

  // Seed testimonies (pre-approved)
  await Testimony.insertMany([
    {
      name: 'Amara O.',
      location: 'Abuja, Nigeria',
      text: 'Through The Call Global, I found my purpose and calling. The Word ministry transformed my life completely.',
      approved: true,
    },
    {
      name: 'David K.',
      location: 'Accra, Ghana',
      text: 'I was healed of a chronic condition during one of the online prayer sessions. God is faithful!',
      approved: true,
    },
    {
      name: 'Faith E.',
      location: 'London, UK',
      text: 'This ministry gave me a community when I felt alone in my faith journey. I am forever grateful.',
      approved: true,
    },
  ]);
  console.log('⭐ Testimonies seeded');

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────');
  console.log(`Admin Email:    ${process.env.ADMIN_EMAIL}`);
  console.log(`Admin Password: ${process.env.ADMIN_PASSWORD}`);
  console.log('─────────────────────────────\n');

  await mongoose.connection.close();
  process.exit(0);
};

seedDB().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
