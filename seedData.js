// seedData.js - Populate initial categories, doctors, and admin user
const User = require('./models/User');
const Category = require('./models/Category');
const Doctor = require('./models/Doctor');

const seedData = async () => {
  try {
    // Only seed if no categories exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) return;

    console.log('🌱 Seeding initial data...');

    // ── Categories ────────────────────────────────────────────────────────────
    const categories = await Category.insertMany([
      {
        name: 'Fever & General',
        description: 'Consult for fever, flu, cold, body ache, fatigue, and general wellness checkups.',
        icon: '🤒',
        image: 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=400&q=80'
      },
      {
        name: 'Skin & Dermatology',
        description: 'Expert care for acne, rashes, eczema, psoriasis, and all skin conditions.',
        icon: '🧴',
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&q=80'
      },
      {
        name: 'Heart & Cardiology',
        description: 'Specialized heart care for chest pain, hypertension, and cardiac conditions.',
        icon: '❤️',
        image: 'https://amcarehospital.com/wp-content/uploads/2023/11/1-CARDIOLOGY-1.jpg'
      },
      {
        name: 'Dental & Oral',
        description: 'Complete dental care including cleanings, cavities, braces, and oral surgery.',
        icon: '🦷',
        image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&q=80'
      },
      {
        name: 'Eye & Vision',
        description: 'Eye exams, vision correction, cataract treatment, and eye disease management.',
        icon: '👁️',
        image: 'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=400&q=80'
      },
      {
        name: 'Orthopedics & Bones',
        description: 'Treatment for joint pain, fractures, arthritis, and musculoskeletal disorders.',
        icon: '🦴',
        image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80'
      },
      {
        name: 'Pediatrics & Child',
        description: 'Comprehensive healthcare for newborns, infants, children and teenagers.',
        icon: '👶',
        image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400&q=80'
      },
      {
        name: 'Mental Health',
        description: 'Support for anxiety, depression, stress, and all mental wellness needs.',
        icon: '🧠',
        image: 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?w=400&q=80'
      }
    ]);

    // ── Admin User ────────────────────────────────────────────────────────────
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@healthcare.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();

    // ── Doctor Users & Profiles ───────────────────────────────────────────────
    const doctorData = [
      { name: 'Dr. Priya Sharma', email: 'priya@healthcare.com', specialization: 'General Physician', category: 0, experience: 8, fee: 400, qualifications: 'MBBS, MD (Internal Medicine)', bio: 'Experienced general physician with 8+ years treating fever, infections, and general health conditions.', avatar: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Dr. Rajesh Kumar', email: 'rajesh@healthcare.com', specialization: 'Dermatologist', category: 1, experience: 12, fee: 600, qualifications: 'MBBS, MD (Dermatology)', bio: 'Expert in treating all skin conditions with the latest dermatological techniques.', avatar: 'https://i.pravatar.cc/150?img=68' },
      { name: 'Dr. Ananya Patel', email: 'ananya@healthcare.com', specialization: 'Cardiologist', category: 2, experience: 15, fee: 1200, qualifications: 'MBBS, DM (Cardiology)', bio: 'Senior cardiologist specializing in heart disease prevention and treatment.', avatar: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Dr. Suresh Nair', email: 'suresh@healthcare.com', specialization: 'Dentist', category: 3, experience: 6, fee: 350, qualifications: 'BDS, MDS (Orthodontics)', bio: 'Providing painless dental treatments with modern equipment and techniques.', avatar: 'https://i.pravatar.cc/150?img=53' },
      { name: 'Dr. Kavitha Reddy', email: 'kavitha@healthcare.com', specialization: 'Ophthalmologist', category: 4, experience: 10, fee: 700, qualifications: 'MBBS, MS (Ophthalmology)', bio: 'Eye specialist with expertise in cataract surgery and vision correction.', avatar: 'https://i.pravatar.cc/150?img=48' },
      { name: 'Dr. Arjun Mehta', email: 'arjun@healthcare.com', specialization: 'Orthopedic Surgeon', category: 5, experience: 14, fee: 900, qualifications: 'MBBS, MS (Orthopaedics)', bio: 'Specialist in bone, joint, and sports injuries with advanced surgical skills.', avatar: 'https://i.pravatar.cc/150?img=60' },
      { name: 'Dr. Deepa Iyer', email: 'deepa@healthcare.com', specialization: 'Pediatrician', category: 6, experience: 9, fee: 500, qualifications: 'MBBS, MD (Paediatrics)', bio: 'Dedicated child health specialist focusing on growth, nutrition, and development.', avatar: 'https://i.pravatar.cc/150?img=44' },
      { name: 'Dr. Vikram Singh', email: 'vikram@healthcare.com', specialization: 'Psychiatrist', category: 7, experience: 11, fee: 800, qualifications: 'MBBS, MD (Psychiatry)', bio: 'Compassionate mental health professional offering therapy and medical support.', avatar: 'https://i.pravatar.cc/150?img=57' },
      { name: 'Dr. Meena Thomas', email: 'meena@healthcare.com', specialization: 'General Physician', category: 0, experience: 5, fee: 350, qualifications: 'MBBS, PGDM (Family Medicine)', bio: 'Family medicine specialist focused on preventive care and chronic disease management.', avatar: 'https://i.pravatar.cc/150?img=49' },
      { name: 'Dr. Ravi Chandran', email: 'ravi@healthcare.com', specialization: 'Dermatologist', category: 1, experience: 7, fee: 550, qualifications: 'MBBS, DVD (Dermatology)', bio: 'Specializes in cosmetic dermatology and hair loss treatment.', avatar: 'https://i.pravatar.cc/150?img=65' }
    ];

    for (const d of doctorData) {
      const user = new User({
        name: d.name,
        email: d.email,
        password: 'doctor123',
        role: 'doctor',
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`
      });
      await user.save();

      await Doctor.create({
        userId: user._id,
        specialization: d.specialization,
        categoryId: categories[d.category]._id,
        experience: d.experience,
        fee: d.fee,
        qualifications: d.qualifications,
        bio: d.bio,
        avatar: d.avatar,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableTime: { start: '09:00', end: '17:00' }
      });
    }

    console.log('✅ Seed data inserted successfully');
    console.log('👤 Admin login: admin@healthcare.com / admin123');
    console.log('👨‍⚕️ Doctor login example: priya@healthcare.com / doctor123');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = seedData;
