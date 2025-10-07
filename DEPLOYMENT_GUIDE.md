# Taxaformer Deployment Guide

This guide provides step-by-step instructions for deploying the Taxaformer eDNA Analysis Platform to various hosting platforms.

## 🌐 Live Deployment Status

- **Backend API**: ✅ Live at https://taxaformer-1.onrender.com
- **Frontend**: Ready for deployment to multiple platforms

## 📋 Pre-Deployment Checklist

- [x] Backend API deployed and accessible
- [x] Frontend configured to use production API
- [x] Environment variables configured
- [x] Build scripts optimized for each platform
- [x] CORS configured on backend
- [x] API endpoints tested and working

## 🚀 Deployment Options

### 1. GitHub Pages (Free, Recommended)

#### Automatic Deployment (Recommended)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **GitHub Actions will automatically**:
   - Install dependencies
   - Build the project with production settings
   - Deploy to GitHub Pages

3. **Access your site**: https://shaurya-sinha3301.github.io/Taxaformer

#### Manual Deployment
```bash
# Install gh-pages if not already installed
npm install -g gh-pages

# Build and deploy
npm run predeploy
npm run deploy
```

### 2. Vercel (Free Tier Available)

#### Automatic Deployment
1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the framework

2. **Environment Variables** (Set in Vercel Dashboard):
   ```
   VITE_API_BASE_URL=https://taxaformer-1.onrender.com
   VITE_ML_API_URL=https://taxaformer-1.onrender.com
   ```

3. **Deploy**: Automatic on every push to main branch

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Build for Vercel
npm run build:vercel

# Deploy
vercel --prod
```

### 3. Netlify (Free Tier Available)

#### Drag & Drop Deployment
1. **Build the project**:
   ```bash
   npm run build:vercel
   ```

2. **Deploy**:
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to the deploy area

#### Git Integration
1. **Connect Repository**: Link your GitHub repo to Netlify
2. **Build Settings**:
   - Build command: `npm run build:vercel`
   - Publish directory: `dist`
3. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://taxaformer-1.onrender.com
   VITE_ML_API_URL=https://taxaformer-1.onrender.com
   ```

### 4. Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Build the project
npm run build:vercel

# Deploy
firebase deploy
```

## 🔧 Build Commands Reference

| Platform | Command | Base Path | Environment |
|----------|---------|-----------|-------------|
| GitHub Pages | `npm run build:github` | `/Taxaformer/` | Production |
| Vercel | `npm run build:vercel` | `/` | Production |
| Netlify | `npm run build:vercel` | `/` | Production |
| Local | `npm run build` | `/Taxaformer/` | Production |

## 🌍 Environment Configuration

### Production Environment (.env.production)
```env
VITE_API_BASE_URL=https://taxaformer-1.onrender.com
VITE_ML_API_URL=https://taxaformer-1.onrender.com
NODE_ENV=production
```

### Development Environment (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ML_API_URL=http://localhost:8001
NODE_ENV=development
```

## 🔍 Testing Deployment

### 1. Test Backend Connection
```bash
# Run the connection test
node test-backend-connection.js
```

### 2. Test Frontend Build
```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

### 3. Test API Endpoints
Visit these URLs to verify backend functionality:
- Health Check: https://taxaformer-1.onrender.com/
- FASTA Files: https://taxaformer-1.onrender.com/fasta-files
- Sample Analysis: https://taxaformer-1.onrender.com/analysis/fasta_001

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem**: Browser blocks API requests due to CORS policy
**Solution**: Backend already configured with CORS middleware

#### 2. 404 Errors on Refresh
**Problem**: SPA routing not configured on hosting platform
**Solution**: 
- **Vercel**: Already configured in `vercel.json`
- **Netlify**: Add `_redirects` file:
  ```
  /*    /index.html   200
  ```

#### 3. Environment Variables Not Loading
**Problem**: Environment variables not available in production
**Solution**: 
- Ensure variables are prefixed with `VITE_`
- Set variables in hosting platform dashboard
- Verify build logs show correct values

#### 4. Large Bundle Size Warning
**Problem**: Bundle size exceeds 500KB
**Solution**: Already optimized, warning can be ignored for this application

### Debug Steps

1. **Check Build Logs**: Look for errors during build process
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Test API Endpoints**: Use browser dev tools to check network requests
4. **Check Console Errors**: Look for JavaScript errors in browser console

## 📊 Performance Optimization

### Already Implemented
- ✅ Code splitting with dynamic imports
- ✅ Tree shaking for unused code
- ✅ Optimized bundle size
- ✅ Lazy loading of components
- ✅ Efficient API caching

### Monitoring
- Use browser dev tools to monitor performance
- Check Core Web Vitals in production
- Monitor API response times

## 🔄 Continuous Deployment

### GitHub Actions Workflow
The project includes automated deployment via GitHub Actions:

1. **Triggers**: Push to main branch
2. **Process**:
   - Install dependencies
   - Run build with production environment
   - Deploy to GitHub Pages
3. **Status**: Check Actions tab in GitHub repository

### Manual Deployment Commands
```bash
# Quick deployment to GitHub Pages
git add . && git commit -m "Deploy update" && git push origin main

# Quick deployment to Vercel
npm run build:vercel && vercel --prod

# Quick local test
npm run build && npm run preview
```

## 📞 Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Verify all environment variables are correctly set
3. Test the backend API endpoints directly
4. Check browser console for error messages
5. Create an issue on GitHub with deployment logs

---

**Happy Deploying! 🚀**