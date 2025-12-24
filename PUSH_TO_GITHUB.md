# 🚀 Push to GitHub - Quick Guide

## Your GitHub Setup

**Username**: `shiva_kulakarni`

---

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `welfare-agent`
3. Description: `AI-powered Welfare Scheme Agent with Multi-language Support`
4. Choose: **Public** (so you can share the link)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

---

## Step 2: Push Your Code

Copy and run these commands in PowerShell (in order):

```powershell
# Navigate to project
cd "d:\Asssisment\welfare-agent"

# Add GitHub remote
git remote add origin https://github.com/shiva_kulakarni/welfare-agent.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

When prompted, enter your GitHub credentials:
- **Username**: `shiva_kulakarni`
- **Password**: Use a **Personal Access Token** (not your GitHub password)

---

## Step 3: Create Personal Access Token (if needed)

If you don't have a token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `Welfare Agent Deploy`
4. Select scopes: ✅ **repo** (all checkboxes)
5. Click **"Generate token"**
6. **COPY THE TOKEN** (you won't see it again!)
7. Use this token as your password when pushing

---

## Your GitHub Links After Push

- **Repository**: `https://github.com/shiva_kulakarni/welfare-agent`
- **Code**: `https://github.com/shiva_kulakarni/welfare-agent/tree/main`
- **README**: `https://github.com/shiva_kulakarni/welfare-agent#readme`

---

## Next: Deploy Live

After pushing to GitHub, follow **GET_LIVE_LINK.md** to deploy:

- **Backend**: Render.com (FREE)
- **Frontend**: Vercel (FREE)
- **Live Link**: `https://welfare-agent-shiva.vercel.app`

---

## Quick Commands Summary

```powershell
cd "d:\Asssisment\welfare-agent"
git remote add origin https://github.com/shiva_kulakarni/welfare-agent.git
git branch -M main
git push -u origin main
```

That's it! 🎉
