# 🚀 Get Your Live Project Links - 3 Options

Your project is ready to go live! Choose your preferred method:

---

## ⚡ OPTION 1: Instant Share (2 minutes) - Ngrok

**Perfect for**: Quick demos, testing, temporary sharing

### Steps:
1. **Download Ngrok**: https://ngrok.com/download
2. **Extract** ngrok.exe to any folder
3. **Open 2 PowerShell windows**

**Window 1 - Backend:**
```powershell
cd "d:\Asssisment\welfare-agent"
node backend/server.js
```

**Window 2 - Ngrok:**
```powershell
cd path\to\ngrok
.\ngrok http 5000
```

4. **Copy** the forwarding URL (e.g., `https://abc123.ngrok.io`)
5. **Update** `frontend/assets/js/app.js`:
   - Change `API_BASE_URL` to your ngrok URL
   - Change `SOCKET_URL` to your ngrok URL

6. **Open** `frontend/index.html` in browser

**Your live link**: `file:///d:/Asssisment/welfare-agent/frontend/index.html`

⚠️ **Note**: Free ngrok URLs expire after session ends. For permanent links, use Option 2 or 3.

---

## 🌟 OPTION 2: FREE Permanent Hosting (15 minutes) - Render + Vercel

**Perfect for**: Permanent links, professional deployment, portfolio

### Your Live Links Will Be:
- **Backend**: `https://welfare-agent-YOUR-NAME.onrender.com`
- **Frontend**: `https://welfare-agent-YOUR-NAME.vercel.app`
- **Total Cost**: $0/month (100% FREE)

### Quick Steps:

#### Step 1: Setup MongoDB Atlas (5 min)
1. Go to https://mongodb.com/cloud/atlas
2. Sign up FREE
3. Create M0 FREE cluster (512MB)
4. Create database user (remember username/password)
5. Network Access → Add IP → Allow from Anywhere (0.0.0.0/0)
6. Connect → Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/welfare-agent?retryWrites=true&w=majority
   ```

#### Step 2: Push to GitHub (2 min)
1. Create account at https://github.com
2. Create new repository "welfare-agent"
3. In PowerShell:
```powershell
cd "d:\Asssisment\welfare-agent"
git remote add origin https://github.com/YOUR-USERNAME/welfare-agent.git
git branch -M main
git push -u origin main
```

#### Step 3: Deploy Backend to Render (3 min)
1. Go to https://render.com
2. Sign up with GitHub
3. New → Web Service
4. Connect your `welfare-agent` repository
5. Settings:
   - **Name**: `welfare-agent-YOUR-NAME`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: FREE
6. Add Environment Variables:
   ```
   MONGODB_URI = your-mongodb-atlas-connection-string
   JWT_SECRET = any-random-string-here-make-it-long
   OPENAI_API_KEY = mock-key
   USE_MOCK_LLM = true
   NODE_ENV = production
   FRONTEND_URL = https://welfare-agent-YOUR-NAME.vercel.app
   ALLOWED_ORIGINS = https://welfare-agent-YOUR-NAME.vercel.app
   ```
7. Create Web Service
8. Wait 3-5 minutes for deployment
9. **Copy your backend URL**: `https://welfare-agent-YOUR-NAME.onrender.com`

#### Step 4: Update Frontend Config (1 min)
1. Open `frontend/assets/js/app.js`
2. Update line 3-4:
```javascript
const API_BASE_URL = 'https://welfare-agent-YOUR-NAME.onrender.com/api';
const SOCKET_URL = 'https://welfare-agent-YOUR-NAME.onrender.com';
```
3. Save and commit:
```powershell
git add frontend/assets/js/app.js
git commit -m "Update API URLs for production"
git push
```

#### Step 5: Deploy Frontend to Vercel (2 min)
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import Project → Select `welfare-agent`
4. Settings:
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Output Directory**: Leave empty
5. Deploy
6. Wait 30 seconds
7. **Your live link**: `https://welfare-agent-YOUR-NAME.vercel.app` ✨

#### Step 6: Update CORS (1 min)
1. Go back to Render dashboard
2. Environment → Add your Vercel URL to `ALLOWED_ORIGINS`
3. Save → Render will auto-redeploy (30 seconds)

### ✅ DONE! Share your links:
- **Frontend (public)**: `https://welfare-agent-YOUR-NAME.vercel.app`
- **Backend API**: `https://welfare-agent-YOUR-NAME.onrender.com/api`

---

## 💰 OPTION 3: Heroku (Simple but Paid)

**Perfect for**: Quick paid hosting, if you want single platform

### Steps:
1. Sign up at https://heroku.com ($5-7/month)
2. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
3. In PowerShell:
```powershell
cd "d:\Asssisment\welfare-agent"
heroku login
heroku create welfare-agent-YOUR-NAME
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-secret-key
heroku config:set USE_MOCK_LLM=true
heroku config:set OPENAI_API_KEY=mock-key
git push heroku main
```
4. **Your live link**: `https://welfare-agent-YOUR-NAME.herokuapp.com`

---

## 🎯 Recommended: OPTION 2 (FREE + Permanent)

**Why?**
- ✅ 100% FREE forever
- ✅ Professional URLs
- ✅ Automatic SSL (https)
- ✅ Perfect for portfolio
- ✅ Custom domain support (optional)
- ✅ Auto-deploy on git push

## 📞 Need Help?

**Common Issues:**

1. **"Cannot connect to backend"**
   - Check ALLOWED_ORIGINS includes your frontend URL
   - Verify API_BASE_URL in app.js is correct

2. **"Database connection failed"**
   - Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
   - Verify connection string format

3. **"Application not loading"**
   - Clear browser cache
   - Check browser console for errors

## 🎉 After Deployment

### Test Your Live App:
1. Open your Vercel URL
2. Register with sample user:
   - Email: `rajesh.kumar@example.com`
   - Password: `password123`
3. Start chatting with the AI agent!

### Share Your Project:
- Add to resume/portfolio
- Share with recruiters
- Demo to clients
- Post on LinkedIn

---

## 📝 Your Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] GitHub repository created and pushed
- [ ] Backend deployed on Render
- [ ] Frontend config updated
- [ ] Frontend deployed on Vercel
- [ ] CORS updated
- [ ] Test live link works
- [ ] Share your project link!

---

**Estimated Time:**
- Option 1 (Ngrok): 2 minutes
- Option 2 (Render + Vercel): 15 minutes
- Option 3 (Heroku): 10 minutes

**Recommendation**: Start with Option 1 for instant demo, then do Option 2 for permanent link! 🚀
