# Sample Data Reference

## ✅ Database Successfully Seeded!

The application now has sample data for testing and demonstration purposes.

---

## 👥 Sample Users (5 Users Created)

You can login with any of these credentials:

### 1. Rajesh Kumar - Farmer from Maharashtra
- **Email:** rajesh.kumar@example.com
- **Phone:** 9876543210
- **Password:** password123
- **State:** Maharashtra
- **District:** Pune
- **Category:** General
- **Income:** ₹45,000
- **Occupation:** Farmer
- **Family Members:** 5
- **Application Status:** ✅ PM-KISAN Application Approved

### 2. Priya Sharma - Self Employed from Mumbai
- **Email:** priya.sharma@example.com
- **Phone:** 9123456789
- **Password:** password123
- **State:** Maharashtra
- **District:** Mumbai
- **Category:** OBC
- **Income:** ₹25,000
- **Occupation:** Self Employed
- **Family Members:** 4
- **Application Status:** 🔄 Ayushman Bharat Under Review

### 3. Amit Patel - Daily Wage Laborer from Gujarat
- **Email:** amit.patel@example.com
- **Phone:** 9988776655
- **Password:** password123
- **State:** Gujarat
- **District:** Ahmedabad
- **Category:** SC
- **Income:** ₹35,000
- **Occupation:** Daily Wage Laborer
- **Family Members:** 6
- **Application Status:** 📝 PMAY Application Submitted

### 4. Sunita Devi - Farmer from Rajasthan
- **Email:** sunita.devi@example.com
- **Phone:** 8765432109
- **Password:** password123
- **State:** Rajasthan
- **District:** Jaipur
- **Category:** ST
- **Income:** ₹18,000
- **Occupation:** Farmer
- **Family Members:** 7
- **Application Status:** ✅ Ujjwala Yojana Approved

### 5. Mohammed Ali - Business Owner from UP
- **Email:** mohammed.ali@example.com
- **Phone:** 7654321098
- **Password:** password123
- **State:** Uttar Pradesh
- **District:** Lucknow
- **Category:** General
- **Income:** ₹55,000
- **Occupation:** Small Business Owner
- **Family Members:** 5
- **Application Status:** 📄 NSP Documents Required

---

## 🎯 Available Welfare Schemes (5 Schemes)

### 1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)
- **Category:** Agriculture
- **Benefits:** ₹6000 per year in three installments
- **Target:** All farmers
- **Sample Application:** Rajesh Kumar (Approved)

### 2. Ayushman Bharat PM-JAY
- **Category:** Healthcare
- **Benefits:** ₹5 lakh health cover per family per year
- **Target:** Poor and low-income families
- **Sample Application:** Priya Sharma (Under Review)

### 3. Pradhan Mantri Awas Yojana (PMAY)
- **Category:** Housing
- **Benefits:** Subsidy for house construction/purchase
- **Target:** Economically weaker sections
- **Sample Application:** Amit Patel (Submitted)

### 4. Pradhan Mantri Ujjwala Yojana
- **Category:** Energy
- **Benefits:** Free LPG connection and first refill
- **Target:** BPL families
- **Sample Application:** Sunita Devi (Approved)

### 5. National Scholarship Portal (NSP)
- **Category:** Education
- **Benefits:** Financial assistance for education
- **Target:** Students from various categories
- **Sample Application:** Mohammed Ali (Documents Required)

---

## 📝 Sample Applications (5 Applications)

### Application Statuses:
- ✅ **Approved (2):** PM-KISAN, Ujjwala Yojana
- 🔄 **Under Review (1):** Ayushman Bharat
- 📝 **Submitted (1):** PMAY
- 📄 **Documents Required (1):** NSP

### Sample Documents:
Each application includes sample documents like:
- Aadhaar Card
- Income Certificate
- Land Records
- BPL Card
- Caste Certificate

---

## 💬 Sample Conversations (2 Conversations)

### 1. Rajesh Kumar's Conversation
- **Language:** Hindi (hi-IN)
- **Topic:** PM-KISAN scheme inquiry
- **Messages:** 4 messages exchanged
- **Date:** 30 days ago

### 2. Priya Sharma's Conversation
- **Language:** Marathi (mr-IN)
- **Topic:** Ayushman Bharat health insurance
- **Messages:** 2 messages exchanged
- **Date:** 10 days ago

---

## 🚀 How to Use Sample Data

### 1. Login as Any Sample User
```
Email: rajesh.kumar@example.com
Password: password123
```

### 2. View Applications
- Check the "My Applications" section
- See different application statuses
- View application details and documents

### 3. Start Conversations
- Use voice or text input
- Ask about welfare schemes
- Get personalized recommendations

### 4. Test Different User Profiles
- Try different users to see varied eligibility
- Different income levels and categories
- Different states and occupations

---

## 🔧 Technical Details

### Data Structure:
- **Users Collection:** 5 documents
- **Applications Collection:** 5 documents
- **Conversations Collection:** 2 documents

### Relationships:
- Each user has their own applications
- Applications linked to specific schemes
- Conversations preserve user context

### Timestamps:
- Applications created at different dates
- Realistic review timelines
- Historical conversation data

---

## 📊 Testing Scenarios

### Scenario 1: Approved Application
**Login as:** Rajesh Kumar  
**Check:** PM-KISAN approved status  
**Expected:** View approved application with remarks

### Scenario 2: Pending Review
**Login as:** Priya Sharma  
**Check:** Ayushman Bharat status  
**Expected:** See "under review" status

### Scenario 3: Documents Required
**Login as:** Mohammed Ali  
**Check:** NSP application  
**Expected:** Prompt to upload missing documents

### Scenario 4: New Application
**Login as:** Any user  
**Action:** Apply for a new scheme  
**Expected:** Create new application

### Scenario 5: Conversation History
**Login as:** Rajesh Kumar or Priya Sharma  
**Check:** View past conversations  
**Expected:** See previous chat history

---

## 🔄 Re-seeding Database

To reset and re-seed the database:

```powershell
cd d:\Asssisment\welfare-agent\backend
node seedData.js
```

**Note:** This will delete all existing data and create fresh sample data.

---

## 🎨 Features to Test

✅ User Authentication (Login/Register)  
✅ Application Management (View/Create/Track)  
✅ Conversation History  
✅ Scheme Recommendations  
✅ Document Upload Status  
✅ Multi-language Support  
✅ Voice Input/Output  
✅ Real-time Updates  

---

## 📱 Quick Access

**Application URL:** http://localhost:3001/  
**Backend API:** http://localhost:5000/api/  

**Test Credentials (Any):**
- Email: rajesh.kumar@example.com
- Password: password123

---

**Happy Testing! 🎉**
