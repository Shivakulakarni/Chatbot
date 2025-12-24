# Welfare Agent - Professional Full-Stack Application

## 🏗️ Architecture Overview

### Backend (Node.js + Express + MongoDB)
Professional REST API server with:
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Real-time Communication**: Socket.IO for voice interaction
- **Security**: Helmet, CORS, rate limiting
- **Database**: MongoDB with Mongoose ODM
- **Logging**: Morgan + custom request logger
- **Error Handling**: Centralized error handler with dev/prod modes

### Frontend (Vanilla JS + HTML/CSS)
Modern responsive web interface with:
- **Voice Input**: Web Audio API for recording
- **Real-time Updates**: Socket.IO client
- **Multi-language Support**: 6 Indian languages
- **Responsive Design**: Mobile-first approach
- **Authentication UI**: Login/Register forms

### API Structure
```
backend/
├── server.js              # Express server setup
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── agent.js          # Agent processing routes
│   ├── schemes.js        # Scheme listing routes
│   ├── applications.js   # Application CRUD routes
│   └── users.js          # User profile routes
├── controllers/
│   ├── authController.js
│   ├── agentController.js
│   ├── applicationController.js
│   └── userController.js
├── models/
│   ├── User.js           # User schema with auth
│   ├── Conversation.js   # Chat history schema
│   └── Application.js    # Application tracking schema
└── middleware/
    ├── auth.js           # JWT verification
    ├── errorHandler.js   # Error handling
    ├── validation.js     # Input validation
    └── logger.js         # Request logging
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- OpenAI API Key

### Installation

1. **Install backend dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Edit `.env` file:
```env
OPENAI_API_KEY=sk-your-openai-key-here
MONGODB_URI=mongodb://localhost:27017/welfare-agent
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

3. **Start MongoDB:**
```bash
# Windows
net start MongoDB

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. **Run the application:**

**Option 1: Backend Only**
```bash
npm run server:dev
```

**Option 2: Full Stack (requires separate terminal for frontend)**
```bash
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend (simple HTTP server)
cd frontend
python -m http.server 3000
# OR
npx serve -p 3000
```

**Option 3: Development Mode (both together)**
```bash
npm run dev:full
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)

### Agent
- `POST /api/agent/process` - Process user input (Protected)
- `GET /api/agent/conversation/:sessionId` - Get chat history (Protected)
- `POST /api/agent/eligibility` - Check eligibility (Protected)

### Schemes
- `GET /api/schemes` - List all schemes
- `GET /api/schemes/:id` - Get scheme details

### Applications
- `POST /api/applications` - Create application (Protected)
- `GET /api/applications` - List user applications (Protected)
- `GET /api/applications/:id` - Get application details (Protected)
- `PUT /api/applications/:id` - Update application (Protected)
- `POST /api/applications/:id/documents` - Upload document (Protected)

### Users
- `GET /api/users/profile` - Get profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `GET /api/users/applications` - Get applications (Protected)

## 🔒 Security Features

1. **JWT Authentication**: Token-based auth with 30-day expiry
2. **Password Hashing**: bcrypt with salt rounds
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Helmet**: Security headers
5. **CORS**: Configured for frontend origin
6. **Input Validation**: Request body validation
7. **MongoDB Injection Protection**: Mongoose sanitization

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  preferredLanguage: String,
  profile: {
    age: Number,
    income: Number,
    category: String,
    state: String,
    // ... other fields
  },
  applications: [ObjectId],
  timestamps: true
}
```

### Conversation Model
```javascript
{
  sessionId: String (indexed),
  userId: ObjectId (indexed),
  messages: [{
    role: 'user' | 'assistant' | 'system',
    content: String,
    timestamp: Date
  }],
  userProfile: Object,
  eligibleSchemes: Array,
  status: 'active' | 'completed' | 'abandoned',
  timestamps: true
}
```

### Application Model
```javascript
{
  userId: ObjectId,
  schemeId: String,
  schemeName: String,
  applicationId: String (auto-generated),
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected',
  applicantInfo: Object,
  documents: Array,
  timeline: Array,
  timestamps: true
}
```

## 🎤 Voice Features

### Real-time Voice Processing
Uses Socket.IO for bidirectional communication:
1. Frontend records audio via Web Audio API
2. Converts to base64 and emits to server
3. Server processes through agent
4. Server responds with text + audio
5. Frontend plays audio response

### Event Flow
```
Client -> 'voice-input' -> Server
Server -> 'processing' -> Client (status update)
Server -> 'voice-response' -> Client (final response)
```

## 🌍 Multi-Language Support

Supported languages:
- मराठी (Marathi) - mr-IN
- हिंदी (Hindi) - hi-IN
- தமிழ் (Tamil) - ta-IN
- తెలుగు (Telugu) - te-IN
- বাংলা (Bengali) - bn-IN
- ଓଡ଼ିଆ (Odia) - or-IN

## 🧪 Testing

Run evaluation tests:
```bash
npm run test:evaluation
```

## 📦 Production Deployment

### Build Steps
1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT secret
3. Configure production MongoDB URI
4. Enable HTTPS
5. Set up reverse proxy (Nginx)
6. Configure firewall rules

### Docker Deployment (Coming Soon)
```bash
docker-compose up -d
```

## 🎯 Features Implemented

✅ **Backend API**
- RESTful API with Express
- JWT authentication
- MongoDB integration
- Socket.IO real-time
- Error handling
- Logging
- Rate limiting

✅ **Frontend UI**
- Voice recording
- Real-time chat
- Authentication
- Profile management
- Scheme display
- Application tracking
- Multi-language

✅ **Agent Integration**
- Planner-Executor-Evaluator loop
- Conversation memory
- Eligibility checker
- Application API
- Marathi language support

## 📝 Environment Variables

```env
# API Configuration
OPENAI_API_KEY=sk-your-key-here
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/welfare-agent

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d

# Frontend
FRONTEND_URL=http://localhost:3000

# Application
DEFAULT_LANGUAGE=mr-IN
MAX_CONVERSATION_TURNS=20
SESSION_TIMEOUT=3600000
```

## 🤝 Contributing

This is a professional full-stack implementation following industry best practices:
- MVC architecture
- RESTful API design
- Security-first approach
- Scalable database design
- Real-time capabilities
- Production-ready code

## 📄 License

MIT

---

**Built with 20 years of professional development experience** 🚀
