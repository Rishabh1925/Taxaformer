# Deployment Guide

## 🚀 Quick Deployment Commands

### Initial Git Setup
```bash
# Initialize git repository (if not already done)
git init

# Add the remote repository
git remote add origin https://github.com/Shaurya-Sinha3301/Taxaformer.git

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial commit - complete eDNA analysis platform

- Add React + TypeScript frontend with modern UI
- Add FastAPI backend with RESTful API
- Add ML pipeline for species identification
- Add interactive mapping with Leaflet
- Add comprehensive data visualization
- Add file upload with metadata management
- Add responsive design with glass morphism
- Add complete documentation and deployment configs"

# Push to main branch
git push -u origin main
```

### Frontend Deployment (Vercel)
```bash
# Build the project
npm run build

# Deploy to Vercel (install vercel CLI first)
npm i -g vercel
vercel --prod
```

### Backend Deployment (Railway/Heroku)
```bash
# For Railway
railway login
railway new
railway add
railway deploy

# For Heroku
heroku create taxaformer-api
git subtree push --prefix backend heroku main
```

### Docker Deployment
```bash
# Build backend Docker image
cd backend
docker build -t taxaformer-api .
docker run -p 8000:8000 taxaformer-api

# Or use docker-compose (create docker-compose.yml first)
docker-compose up -d
```

## 🔧 Environment Setup

### Production Environment Variables
```env
# Frontend (.env.production)
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ML_API_URL=https://your-ml-api-domain.com

# Backend
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-production-secret-key
DEBUG=false
CORS_ORIGINS=https://your-frontend-domain.com
```

## 📊 Performance Optimization

### Frontend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images and assets
- Enable service worker caching

### Backend Optimization
- Use production ASGI server (Gunicorn + Uvicorn)
- Enable database connection pooling
- Implement Redis caching
- Use background tasks for heavy operations
- Monitor with APM tools

## 🔒 Security Checklist

- [ ] Update all default secrets and keys
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Add input validation and sanitization
- [ ] Enable security headers
- [ ] Regular dependency updates
- [ ] Database security hardening

## 📈 Monitoring

### Recommended Tools
- **Frontend**: Vercel Analytics, Google Analytics
- **Backend**: Sentry, DataDog, New Relic
- **Infrastructure**: Uptime monitoring, Log aggregation
- **Performance**: Lighthouse CI, Web Vitals

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

## 🆘 Troubleshooting

### Common Issues
- **Build failures**: Check Node.js version compatibility
- **API connection**: Verify CORS and environment variables
- **Map not loading**: Check Leaflet CSS imports
- **Performance**: Enable production optimizations

### Support
- Check GitHub Issues
- Review deployment logs
- Monitor error tracking tools
- Contact development team