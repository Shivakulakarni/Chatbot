import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Application from './models/Application.js';
import Conversation from './models/Conversation.js';

dotenv.config();

// Sample welfare schemes data
const welfareSchemes = [
  {
    id: 'PM_KISAN',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    category: 'Agriculture',
    description: 'Financial support to farmers',
    benefits: '₹6000 per year in three installments'
  },
  {
    id: 'AYUSHMAN_BHARAT',
    name: 'Ayushman Bharat PM-JAY',
    category: 'Healthcare',
    description: 'Health insurance for poor families',
    benefits: '₹5 lakh health cover per family per year'
  },
  {
    id: 'PMAY',
    name: 'Pradhan Mantri Awas Yojana',
    category: 'Housing',
    description: 'Affordable housing for all',
    benefits: 'Subsidy for house construction/purchase'
  },
  {
    id: 'UJJWALA',
    name: 'Pradhan Mantri Ujjwala Yojana',
    category: 'Energy',
    description: 'Free LPG connections to BPL families',
    benefits: 'Free LPG connection and first refill'
  },
  {
    id: 'NSP',
    name: 'National Scholarship Portal',
    category: 'Education',
    description: 'Scholarships for students',
    benefits: 'Financial assistance for education'
  }
];

// Sample users
const sampleUsers = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '9876543210',
    password: 'password123',
    preferredLanguage: 'hi-IN',
    profile: {
      age: 35,
      income: 45000,
      category: 'General',
      state: 'Maharashtra',
      district: 'Pune',
      occupation: 'Farmer',
      disability: false,
      familyMembers: 5
    }
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '9123456789',
    password: 'password123',
    preferredLanguage: 'mr-IN',
    profile: {
      age: 28,
      income: 25000,
      category: 'OBC',
      state: 'Maharashtra',
      district: 'Mumbai',
      occupation: 'Self Employed',
      disability: false,
      familyMembers: 4
    }
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@example.com',
    phone: '9988776655',
    password: 'password123',
    preferredLanguage: 'hi-IN',
    profile: {
      age: 42,
      income: 35000,
      category: 'SC',
      state: 'Gujarat',
      district: 'Ahmedabad',
      occupation: 'Daily Wage Laborer',
      disability: false,
      familyMembers: 6
    }
  },
  {
    name: 'Sunita Devi',
    email: 'sunita.devi@example.com',
    phone: '8765432109',
    password: 'password123',
    preferredLanguage: 'hi-IN',
    profile: {
      age: 38,
      income: 18000,
      category: 'ST',
      state: 'Rajasthan',
      district: 'Jaipur',
      occupation: 'Farmer',
      disability: false,
      familyMembers: 7
    }
  },
  {
    name: 'Mohammed Ali',
    email: 'mohammed.ali@example.com',
    phone: '7654321098',
    password: 'password123',
    preferredLanguage: 'hi-IN',
    profile: {
      age: 45,
      income: 55000,
      category: 'General',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      occupation: 'Small Business Owner',
      disability: false,
      familyMembers: 5
    }
  }
];

// Function to generate application ID
const generateApplicationId = (schemeId) => {
  return `APP-${schemeId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Application.deleteMany({});
    await Conversation.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = await User.create(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create applications for users
    console.log('📝 Creating sample applications...');
    const applications = [];
    
    // Rajesh Kumar - PM-KISAN application (approved)
    applications.push({
      userId: createdUsers[0]._id,
      schemeId: 'PM_KISAN',
      schemeName: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      applicationId: generateApplicationId('PM_KISAN'),
      status: 'approved',
      applicantInfo: {
        name: createdUsers[0].name,
        age: createdUsers[0].profile.age,
        income: createdUsers[0].profile.income,
        category: createdUsers[0].profile.category,
        state: createdUsers[0].profile.state,
        district: createdUsers[0].profile.district,
        occupation: createdUsers[0].profile.occupation,
        phone: createdUsers[0].phone,
        email: createdUsers[0].email
      },
      documents: [
        {
          type: 'Aadhaar Card',
          name: 'aadhaar_rajesh.pdf',
          url: '/uploads/docs/aadhaar_rajesh.pdf',
          uploadedAt: new Date(),
          status: 'verified'
        },
        {
          type: 'Land Records',
          name: 'land_records.pdf',
          url: '/uploads/docs/land_records.pdf',
          uploadedAt: new Date(),
          status: 'verified'
        }
      ],
      remarks: 'Application approved. First installment released.',
      submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      reviewedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    });

    // Priya Sharma - Ayushman Bharat (under review)
    applications.push({
      userId: createdUsers[1]._id,
      schemeId: 'AYUSHMAN_BHARAT',
      schemeName: 'Ayushman Bharat PM-JAY',
      applicationId: generateApplicationId('AYUSHMAN_BHARAT'),
      status: 'under_review',
      applicantInfo: {
        name: createdUsers[1].name,
        age: createdUsers[1].profile.age,
        income: createdUsers[1].profile.income,
        category: createdUsers[1].profile.category,
        state: createdUsers[1].profile.state,
        district: createdUsers[1].profile.district,
        occupation: createdUsers[1].profile.occupation,
        phone: createdUsers[1].phone,
        email: createdUsers[1].email
      },
      documents: [
        {
          type: 'Aadhaar Card',
          name: 'aadhaar_priya.pdf',
          url: '/uploads/docs/aadhaar_priya.pdf',
          uploadedAt: new Date(),
          status: 'verified'
        },
        {
          type: 'Income Certificate',
          name: 'income_cert.pdf',
          url: '/uploads/docs/income_cert.pdf',
          uploadedAt: new Date(),
          status: 'pending'
        }
      ],
      remarks: 'Documents under verification',
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    });

    // Amit Patel - PMAY (submitted)
    applications.push({
      userId: createdUsers[2]._id,
      schemeId: 'PMAY',
      schemeName: 'Pradhan Mantri Awas Yojana',
      applicationId: generateApplicationId('PMAY'),
      status: 'submitted',
      applicantInfo: {
        name: createdUsers[2].name,
        age: createdUsers[2].profile.age,
        income: createdUsers[2].profile.income,
        category: createdUsers[2].profile.category,
        state: createdUsers[2].profile.state,
        district: createdUsers[2].profile.district,
        occupation: createdUsers[2].profile.occupation,
        phone: createdUsers[2].phone,
        email: createdUsers[2].email
      },
      documents: [
        {
          type: 'Aadhaar Card',
          name: 'aadhaar_amit.pdf',
          url: '/uploads/docs/aadhaar_amit.pdf',
          uploadedAt: new Date(),
          status: 'verified'
        }
      ],
      remarks: 'Application received. Review pending.',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    });

    // Sunita Devi - Ujjwala (approved)
    applications.push({
      userId: createdUsers[3]._id,
      schemeId: 'UJJWALA',
      schemeName: 'Pradhan Mantri Ujjwala Yojana',
      applicationId: generateApplicationId('UJJWALA'),
      status: 'approved',
      applicantInfo: {
        name: createdUsers[3].name,
        age: createdUsers[3].profile.age,
        income: createdUsers[3].profile.income,
        category: createdUsers[3].profile.category,
        state: createdUsers[3].profile.state,
        district: createdUsers[3].profile.district,
        occupation: createdUsers[3].profile.occupation,
        phone: createdUsers[3].phone,
        email: createdUsers[3].email
      },
      documents: [
        {
          type: 'Aadhaar Card',
          name: 'aadhaar_sunita.pdf',
          url: '/uploads/docs/aadhaar_sunita.pdf',
          uploadedAt: new Date(),
          status: 'verified'
        },
        {
          type: 'BPL Card',
          name: 'bpl_card.pdf',
          url: '/uploads/docs/bpl_card.pdf',
          uploadedAt: new Date(),
          status: 'verified'
        }
      ],
      remarks: 'LPG connection approved. Distributor assigned.',
      submittedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      reviewedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    });

    // Mohammed Ali - NSP (documents required)
    applications.push({
      userId: createdUsers[4]._id,
      schemeId: 'NSP',
      schemeName: 'National Scholarship Portal',
      applicationId: generateApplicationId('NSP'),
      status: 'documents_required',
      applicantInfo: {
        name: createdUsers[4].name,
        age: createdUsers[4].profile.age,
        income: createdUsers[4].profile.income,
        category: createdUsers[4].profile.category,
        state: createdUsers[4].profile.state,
        district: createdUsers[4].profile.district,
        occupation: createdUsers[4].profile.occupation,
        phone: createdUsers[4].phone,
        email: createdUsers[4].email
      },
      documents: [
        {
          type: 'Aadhaar Card',
          name: 'aadhaar_mohammed.pdf',
          url: '/uploads/docs/aadhaar_mohammed.pdf',
          uploadedAt: new Date(),
          status: 'verified'
        }
      ],
      remarks: 'Please upload income certificate and caste certificate',
      submittedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    });

    const createdApplications = await Application.create(applications);
    console.log(`✅ Created ${createdApplications.length} applications`);

    // Create sample conversations
    console.log('💬 Creating sample conversations...');
    const conversations = [];

    // Conversation for Rajesh
    conversations.push({
      sessionId: `session-${createdUsers[0]._id}-${Date.now()}-1`,
      userId: createdUsers[0]._id,
      messages: [
        {
          role: 'user',
          content: 'मुझे किसान योजना के बारे में जानकारी चाहिए',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          role: 'assistant',
          content: 'PM-KISAN योजना के तहत सभी किसानों को प्रति वर्ष ₹6000 की वित्तीय सहायता दी जाती है। यह राशि तीन समान किस्तों में प्रदान की जाती है। आप इस योजना के लिए पात्र हैं।',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          role: 'user',
          content: 'मैं आवेदन कैसे करूं?',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
          role: 'assistant',
          content: 'आवेदन के लिए आपको अपना आधार कार्ड, भूमि रिकॉर्ड और बैंक खाता विवरण की आवश्यकता होगी। मैं आपके लिए आवेदन शुरू कर सकता हूं।',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      ],
      userProfile: {
        name: createdUsers[0].name,
        age: createdUsers[0].profile.age,
        income: createdUsers[0].profile.income,
        category: createdUsers[0].profile.category,
        state: createdUsers[0].profile.state,
        district: createdUsers[0].profile.district,
        occupation: createdUsers[0].profile.occupation,
        disability: createdUsers[0].profile.disability,
        familyMembers: createdUsers[0].profile.familyMembers
      }
    });

    // Conversation for Priya
    conversations.push({
      sessionId: `session-${createdUsers[1]._id}-${Date.now()}-2`,
      userId: createdUsers[1]._id,
      messages: [
        {
          role: 'user',
          content: 'मला आरोग्य विमा योजनेबद्दल माहिती पाहिजे',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          role: 'assistant',
          content: 'आयुष्मान भारत योजनेत प्रत्येक कुटुंबाला दरवर्षी ₹5 लाख पर्यंत आरोग्य विमा मिळतो. हे गरीब आणि कमी उत्पन्न असलेल्या कुटुंबांसाठी आहे.',
          timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ],
      userProfile: {
        name: createdUsers[1].name,
        age: createdUsers[1].profile.age,
        income: createdUsers[1].profile.income,
        category: createdUsers[1].profile.category,
        state: createdUsers[1].profile.state,
        district: createdUsers[1].profile.district,
        occupation: createdUsers[1].profile.occupation,
        disability: createdUsers[1].profile.disability,
        familyMembers: createdUsers[1].profile.familyMembers
      }
    });

    const createdConversations = await Conversation.create(conversations);
    console.log(`✅ Created ${createdConversations.length} conversations`);

    // Print summary
    console.log('\n📊 Database Seeding Summary:');
    console.log('================================');
    console.log(`👥 Users Created: ${createdUsers.length}`);
    console.log(`📝 Applications Created: ${createdApplications.length}`);
    console.log(`💬 Conversations Created: ${createdConversations.length}`);
    console.log('\n📋 Sample User Credentials:');
    console.log('================================');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Password: password123`);
      console.log(`   State: ${user.profile.state}`);
      console.log(`   Category: ${user.profile.category}`);
      console.log('   ---');
    });

    console.log('\n🎯 Welfare Schemes Available:');
    console.log('================================');
    welfareSchemes.forEach((scheme, index) => {
      console.log(`${index + 1}. ${scheme.name}`);
      console.log(`   Category: ${scheme.category}`);
      console.log(`   Benefits: ${scheme.benefits}`);
      console.log('   ---');
    });

    console.log('\n✅ Database seeding completed successfully!');
    console.log('🚀 You can now login with any of the sample user credentials');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
