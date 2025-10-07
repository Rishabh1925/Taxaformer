# Vercel Deployment Guide - Latest Format

This guide uses Vercel's latest configuration format for optimal deployment.

## 🚀 Quick Deployment Commands

### Method 1: Git Integration (Recommended)
```bash
# 1. Commit your changes
git add .
git commit -m "Deploy to Vercel with latest config"
git push origin main

# 2. Go to vercel.com
# 3. Click "New Project"
# 4. Import from GitHub
# 5. Select your repository
# 6. Vercel will auto-detect everything!
```

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## 📋 Configuration Overview

### Updated `vercel.json` (Latest Format)
```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://taxaformer-1.onrender.com",
    "VITE_ML_API_URL": "https://taxaformer-1.onrender.com"
  }
}
```

### Key Features of Latest Format:
- ✅ **No "version" field** - Vercel auto-detects
- ✅ **"rewrites" instead of "routes"** - Modern routing
- ✅ **Framework detection** - Optimized for Vite
- ✅ **Security headers** - Enhanced security
- ✅ **Asset caching** - Performance optimization
- ✅ **Environment variables** - Built-in support

## 🔧 Build Configuration

### Node.js Version
- **Specified in**: `.nvmrc` and `package.json`
- **Version**: Node.js 18+
- **Auto-detected by Vercel**

### Build Commands
```bash
# Development
npm run dev

# Production build (what Vercel uses)
npm run build:vercel

# Test build locally
npm run build:vercel && npm run preview
```

## 🌍 Environment Variables

### Automatic (from vercel.json)
```
VITE_API_BASE_URL=https://taxaformer-1.onrender.com
VITE_ML_API_URL=https://taxaformer-1.onrender.com
```

### Manual Setup (Vercel Dashboard)
If you need to override or add more variables:
1. Go to your project dashboard on vercel.com
2. Navigate to Settings → Environment Variables
3. Add variables for all environments (Production, Preview, Development)

## 🚦 Deployment Status

### What Happens on Deploy:
1. **Auto-detection**: Vercel detects Vite framework
2. **Install**: Runs `npm install`
3. **Build**: Executes `npm run build:vercel`
4. **Deploy**: Serves from `dist` directory
5. **Routing**: SPA routing handled by rewrites
6. **Caching**: Assets cached for 1 year

### Expected Build Output:
```
✓ 2700 modules transformed.
dist/index.html                     0.44 kB │ gzip:   0.29 kB
dist/assets/index-C24zlclN.css     83.90 kB │ gzip:  17.94 kB
dist/assets/index-BqyCIuvs.js   1,029.47 kB │ gzip: 297.84 kB
✓ built in ~7s
```

## 🔍 Testing Your Deployment

### 1. Local Testing
```bash
# Build and preview locally
npm run build:vercel
npm run preview

# Test API connection
node test-backend-connection.js
```

### 2. Production Testing
After deployment, verify:
- ✅ Homepage loads correctly
- ✅ Navigation works (SPA routing)
- ✅ API calls to backend work
- ✅ Maps render properly
- ✅ File upload functionality

### 3. Performance Testing
- Check Core Web Vitals in Vercel dashboard
- Verify asset caching headers
- Test mobile responsiveness

## 🐛 Troubleshooting

### Common Issues & Solutions:

#### Build Fails
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build:vercel
```

#### SPA Routing Issues
- ✅ Already fixed with rewrites configuration
- All routes redirect to `/index.html`

#### API Connection Issues
```bash
# Test backend directly
curl https://taxaformer-1.onrender.com/fasta-files

# Check environment variables in Vercel dashboard
```

#### Large Bundle Warning
- This is expected for the current build
- Bundle size: ~1MB (acceptable for this application)
- Gzipped: ~298KB (good compression)

## 📊 Performance Optimizations

### Already Implemented:
- ✅ Asset caching (1 year for static assets)
- ✅ Gzip compression
- ✅ Security headers
- ✅ Framework-specific optimizations
- ✅ Tree shaking and minification

### Vercel Features Used:
- ✅ Edge Network (global CDN)
- ✅ Automatic HTTPS
- ✅ Git integration
- ✅ Preview deployments
- ✅ Analytics (available in dashboard)

## 🎯 Final Deployment Checklist

- [x] Updated to latest Vercel config format
- [x] Node.js version specified
- [x] Build commands optimized
- [x] Environment variables configured
- [x] SPA routing configured with rewrites
- [x] Security headers added
- [x] Asset caching optimized
- [x] Backend API connected and tested
- [x] Build tested locally

## 🚀 Deploy Now!

Your project is ready for Vercel deployment with the latest configuration format. Simply run:

```bash
git add .
git commit -m "Ready for Vercel deployment - latest config"
git push origin main
```

Then import your repository on vercel.com and you're live! 🎉