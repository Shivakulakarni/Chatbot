# 🚀 Deployment Guide - Welfare Agent

## Quick Deploy Options

### Option 1: Render.com (Recommended - FREE)

#### Backend Deployment
1. **Create Render Account**: Go to [render.com](https://render.com) and sign up
2. **Connect GitHub**: Push your code to GitHub first
3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: welfare-agent-backend
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node server.js`
     - **Instance Type**: Free

4. **Environment Variables** (Add in Render dashboard):
   ```
   MONGODB_URI=mongodb+srv://your-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key-change-this
   OPENAI_API_KEY=your-openai-api-key-or-mock-key
   USE_MOCK_LLM=true
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   PORT=5000
   ```

#### Frontend Deployment
1. **Use Vercel** (Best for static sites):
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Settings:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Other
     - **Build Command**: (leave empty)
     - **Output Directory**: `.`
   
2. **Update API URL**: Before deploying, update `frontend/assets/js/app.js`:
   ```javascript
   const API_BASE_URL = 'https://your-backend.onrender.com/api';
   const SOCKET_URL = 'https://your-backend.onrender.com';
   ```

---

### Option 2: Railway.app (Easy Deploy)

1. **Backend**:
   - Sign up at [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway will auto-detect Node.js
   - Add environment variables in settings

2. **Frontend**:
   - Deploy to Netlify or Vercel
   - Update API URLs

---

### Option 3: Heroku (Classic Option)

#### Backend
```bash
# Install Heroku CLI
heroku login
cd backend
heroku create welfare-agent-backend

# Add environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-key
heroku config:set USE_MOCK_LLM=true

# Deploy
git push heroku main
```

#### Frontend
Deploy to Netlify or GitHub Pages

---

## MongoDB Setup (Required for all options)

### MongoDB Atlas (FREE)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create FREE account
3. Create new cluster (FREE tier - M0)
4. Create database user
5. Add IP: `0.0.0.0/0` (allow from anywhere)
6. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/welfare-agent?retryWrites=true&w=majority
   ```

---

## Quick Start - GitHub Setup

### 1. Create GitHub Repository
```bash
cd d:\Asssisment\welfare-agent
git init
git add .
git commit -m "Initial commit - Welfare Agent"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/welfare-agent.git
git push -u origin main
```

### 2. Create `.gitignore`
Already created - see `.gitignore` file

### 3. Update Configuration for Production
See `backend/server.js` - already configured for production

---

## Environment Variables Summary

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/welfare-agent

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRE=30d

# OpenAI (or use mock mode)
OPENAI_API_KEY=sk-your-openai-key-here
USE_MOCK_LLM=true

# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-domain.com
```

---

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend is deployed
- [ ] MongoDB Atlas is connected
- [ ] Environment variables are set
- [ ] CORS is properly configured
- [ ] Sample data is seeded (optional)
- [ ] API endpoints are working
- [ ] Socket.IO is connecting
- [ ] Test user registration
- [ ] Test user login
- [ ] Test voice/text chat
- [ ] Test scheme recommendations

---

## Testing Your Live Site

1. **Backend Health Check**:
   ```
   https://your-backend.onrender.com/health
   ```

2. **Test Registration**:
   - Open your frontend URL
   - Register a new user
   - Check if login works

3. **Test API**:
   ```bash
   curl https://your-backend.onrender.com/api/schemes
   ```

---

## Sharing Your Project

### Live URLs to Share:
- **Frontend**: `https://welfare-agent.vercel.app`
- **Backend API**: `https://welfare-agent-backend.onrender.com`
- **GitHub Repo**: `https://github.com/YOUR_USERNAME/welfare-agent`

### Demo Credentials (if you seed data):
```
Email: rajesh.kumar@example.com
Password: password123
```

---

## Cost Breakdown (FREE Tier)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Render.com** | 750 hours/month | Backend hosting |
| **Vercel** | Unlimited | Frontend hosting |
| **MongoDB Atlas** | 512 MB storage | Database |
| **GitHub** | Unlimited public repos | Code hosting |
| **Total** | **$0/month** | 🎉 Completely FREE! |

---

## Performance Tips

1. **Enable Compression** (already done in server.js)
2. **Use CDN** for static assets (Vercel provides this)
3. **Implement Caching** (already configured)
4. **Optimize Images** (if you add any)
5. **Use Environment Variables** (never commit secrets)

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check logs: `heroku logs --tail` or Render dashboard

### Frontend can't connect to backend
- Check CORS settings in `server.js`
- Verify API_BASE_URL in `app.js`
- Check browser console for errors

### Socket.IO not connecting
- Ensure SOCKET_URL matches backend URL
- Check if backend supports WebSocket
- Verify CORS for Socket.IO

---

## Next Steps

1. **Custom Domain**: Buy a domain and connect to Vercel
2. **SSL Certificate**: Free with Vercel/Render
3. **Analytics**: Add Google Analytics
4. **Monitoring**: Use Render/Vercel built-in monitoring
5. **Backup**: Regular MongoDB backups

---

## Support

- **Documentation**: Check README.md
- **Sample Data**: Run `node seedData.js` on deployed backend
- **Issues**: Create GitHub issue

---

**Your app will be live at:**
- Frontend: https://your-project-name.vercel.app
- Backend: https://your-project-name.onrender.com

**Total Setup Time: ~30 minutes** ⏱️
