# 🌐 Quick Deploy - Step by Step

## FASTEST WAY (Recommended)

### Step 1: Setup MongoDB Atlas (5 minutes)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up FREE
3. Create new cluster (M0 FREE tier)
4. Create database user with username/password
5. Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)
6. Copy connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/welfare-agent
   ```

### Step 2: Push to GitHub (2 minutes)
```bash
# In your project folder
cd d:\Asssisment\welfare-agent
git init
git add .
git commit -m "Initial commit"

# Create new repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/welfare-agent.git
git push -u origin main
```

### Step 3: Deploy Backend to Render (3 minutes)
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your `welfare-agent` repository
5. Configure:
   - **Name**: `welfare-agent-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`

6. Add Environment Variables:
   ```
   MONGODB_URI = your-mongodb-atlas-connection-string
   JWT_SECRET = your-random-secret-minimum-32-chars
   OPENAI_API_KEY = mock-key-for-demo
   USE_MOCK_LLM = true
   NODE_ENV = production
   ```

7. Click "Create Web Service"
8. Wait 2-3 minutes for deployment
9. Copy your URL: `https://welfare-agent-backend.onrender.com`

### Step 4: Update Frontend Config (1 minute)
Edit `frontend/assets/js/app.js` line 2-3:
```javascript
const API_BASE_URL = 'https://welfare-agent-backend.onrender.com/api';
const SOCKET_URL = 'https://welfare-agent-backend.onrender.com';
```

Commit and push:
```bash
git add .
git commit -m "Update API URLs for production"
git push
```

### Step 5: Deploy Frontend to Vercel (2 minutes)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your `welfare-agent` repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
6. Click "Deploy"
7. Your site will be live at: `https://your-project.vercel.app`

### Step 6: Update CORS (1 minute)
1. Go back to your code
2. Edit `backend/server.js` line 35:
   ```javascript
   origin: ['https://your-project.vercel.app', 'http://localhost:3001']
   ```
3. Commit and push - Render will auto-redeploy

### Step 7: Test Your Live Site! 🎉
Visit: `https://your-project.vercel.app`

---

## Share These Links:

✅ **Live App**: https://your-project.vercel.app
✅ **Backend API**: https://welfare-agent-backend.onrender.com
✅ **GitHub Repo**: https://github.com/YOUR_USERNAME/welfare-agent

---

## Demo Login (after seeding data):
```
Email: rajesh.kumar@example.com
Password: password123
```

---

## Total Time: ~15 minutes ⏱️
## Total Cost: $0/month 💰

---

## Need Help?

### Backend Health Check
Visit: `https://welfare-agent-backend.onrender.com/health`
Should return: `{"status":"healthy"}`

### Check Logs
- **Render**: Dashboard → Your service → Logs tab
- **Vercel**: Dashboard → Your project → Deployments → View Function Logs

### Common Issues

**"Cannot connect to server"**
- Check if backend URL is correct in frontend
- Verify CORS settings include your Vercel URL
- Check Render logs for errors

**"MongoDB connection error"**
- Verify connection string is correct
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Ensure database user has correct permissions

**"502 Bad Gateway"**
- Backend is starting up (wait 30 seconds on Render free tier)
- Check if all environment variables are set

---

## Alternative: Use Ngrok (Temporary - For Testing)

If you want to share IMMEDIATELY without deployment:

```bash
# Install ngrok from https://ngrok.com
# Start your backend locally
cd backend
node server.js

# In another terminal
ngrok http 5000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update frontend/assets/js/app.js with this URL
# Start frontend locally
cd frontend
npx http-server . -p 3001

# In another terminal
ngrok http 3001

# Share the frontend ngrok URL!
```

**Note**: Ngrok links expire when you close the terminal.

---

**🚀 Your app is now LIVE and shareable!**
