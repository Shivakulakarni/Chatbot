# 🚀 Quick Start Guide - Welfare Agent Full-Stack App

## ✅ Server is Running!

Your backend is now live at: **http://localhost:5000**

---

## 📱 Next Steps

### 1. **Test the API** (Backend is working!)

Open a new PowerShell terminal and test:

```powershell
# Health check
Invoke-RestMethod -Uri http://localhost:5000/health

# Get all schemes
Invoke-RestMethod -Uri http://localhost:5000/api/schemes
```

### 2. **Start the Frontend**

Open a **NEW** PowerShell terminal:

```powershell
cd D:\Asssisment\welfare-agent\frontend
python -m http.server 3000
```

Then open in browser: **http://localhost:3000**

### 3. **Register a New User**

On the frontend:
- Enter your name, email (any format), phone (10 digits starting with 6-9)
- Choose Marathi or your preferred language
- Click **Register**

### 4. **Start Chatting!**

Try these in Marathi:
- "मला आवास योजनेबद्दल माहिती हवी आहे"
- "मी कोणत्या योजनांसाठी पात्र आहे?"
- "माझे वय 30 आहे आणि उत्पन्न 5 लाख आहे"

Or in English:
- "Tell me about housing schemes"
- "Which schemes am I eligible for?"
- "My age is 30 and income is 5 lakhs"

---

## 🎤 Voice Features

1. Click the **🎤 Start Speaking** button
2. Grant microphone permission
3. Speak your query in your preferred language
4. Click **⏸️ Stop** when done
5. AI will process and respond

---

## 🔑 API Key Setup

**IMPORTANT:** You need an OpenAI API key for the AI agent to work!

### Get OpenAI API Key:

1. Go to: https://platform.openai.com/api-keys
2. Create account / Sign in
3. Click **"+ Create new secret key"**
4. Copy the key (starts with `sk-...`)

### Update .env file:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Then restart the server:
```powershell
# Press Ctrl+C in the server terminal
# Then run again:
npm run server:dev
```

---

## 🗄️ Database

MongoDB is already running and connected! ✅

Your data is stored in: `mongodb://localhost:27017/welfare-agent`

---

## 📡 Available Endpoints

### Public APIs (No authentication needed):
- `GET /health` - Server health check
- `GET /api/schemes` - List all welfare schemes
- `GET /api/schemes/:id` - Get specific scheme
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected APIs (Need JWT token):
- `POST /api/agent/process` - Process user input through AI agent
- `GET /api/agent/conversation/:sessionId` - Get chat history
- `POST /api/applications` - Create new application
- `GET /api/applications` - List your applications
- `GET /api/users/profile` - Get your profile
- `PUT /api/users/profile` - Update your profile

---

## 🧪 Test Without Frontend

```powershell
# Register a user
$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "9876543210"
    password = "password123"
    preferredLanguage = "mr-IN"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:5000/api/auth/register -Method POST -Body $body -ContentType "application/json"

# Save the token
$token = $response.token

# Process a message
$body = @{
    userInput = "मला आवास योजनेबद्दल माहिती हवी आहे"
    sessionId = "test-session-123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/agent/process -Method POST -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
```

---

## 📊 Current Status

✅ Backend server running on port 5000
✅ MongoDB connected
✅ 8 welfare schemes loaded
✅ API endpoints ready
✅ Authentication system active
✅ Real-time Socket.IO ready
⚠️ **Need OpenAI API key** for AI agent
⏳ Frontend needs to be started

---

## 🛠️ Troubleshooting

**Port already in use?**
```powershell
# Change port in .env
PORT=5001
```

**MongoDB connection error?**
```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Or use MongoDB Atlas (cloud):
# Update .env with your Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/welfare-agent
```

**Cannot access frontend?**
- Make sure Python is installed: `python --version`
- Or use Node's http-server: `npx http-server frontend -p 3000`
- Or open `frontend/index.html` directly in browser (limited functionality)

---

## 🎯 Features Working

✅ User registration & login
✅ JWT authentication
✅ MongoDB persistence
✅ RESTful API
✅ Real-time WebSocket
✅ Conversation history
✅ Application tracking
✅ Multi-language support (6 languages)
✅ Scheme eligibility checking
✅ Profile management

---

## 📚 Documentation

- **Architecture**: See `FULLSTACK_README.md`
- **Original Project**: See `README.md`
- **API Reference**: See `FULLSTACK_README.md` API section

---

## 💡 Tips

1. **Development Mode**: Server auto-restarts on file changes (nodemon)
2. **Testing**: Use Postman or Insomnia for API testing
3. **Logs**: Check terminal for all requests and errors
4. **Database**: Use MongoDB Compass to view data (mongodb://localhost:27017)

---

**Ready to help millions access welfare schemes! 🎉**

Need help? Check the logs in the terminal where the server is running.
