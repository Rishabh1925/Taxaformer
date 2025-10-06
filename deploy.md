# 🚀 Quick Deploy Guide

## Method 1: GitHub Pages (Free Forever)

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `Taxaformer`
3. Make it **Public**
4. Click "Create repository"

### Step 2: Deploy Commands
```bash
# Add all files
git add .

# Commit changes
git commit -m "feat: ready for deployment - complete eDNA analysis platform"

# Set main branch
git branch -M main

# Add remote (if not already added)
git remote add origin https://github.com/Shaurya-Sinha3301/Taxaformer.git

# Push to GitHub
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: "GitHub Actions"
4. Wait 2-3 minutes
5. Your site will be live at: **https://shaurya-sinha3301.github.io/Taxaformer**

---

## Method 2: Vercel (Recommended)

### Option A: Connect GitHub Repository
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your Taxaformer repository
5. Click "Deploy"
6. Live in 30 seconds!

### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Method 3: Netlify (Drag & Drop)

### Option A: Drag & Drop
```bash
# Build the project
npm run build

# Go to https://netlify.com
# Drag the 'dist' folder to Netlify
# Instant deployment!
```

### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

---

## 🎯 Recommended Order:

1. **GitHub Pages** - Free forever, good for portfolios
2. **Vercel** - Best performance, automatic deployments
3. **Netlify** - Great for quick deployments

## 🔗 Your Live URLs:
- **GitHub Pages**: https://shaurya-sinha3301.github.io/Taxaformer
- **Vercel**: https://taxaformer-[random].vercel.app
- **Netlify**: https://[random]-taxaformer.netlify.app

Choose any method - they're all free and work great! 🚀