# Quick Start: Deploying to Vercel

## 🚀 Fastest Way to Deploy

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy** (from this directory):
   ```bash
   vercel
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

That's it! Your app will be live at the URL provided.

## 📝 What Was Changed for Vercel

- ✅ Created `/api/index.py` - Serverless function for image classification
- ✅ Created `vercel.json` - Configuration for build and routing
- ✅ Updated frontend API calls to use `/api/` prefix
- ✅ Configured environment-aware API URLs
- ✅ Added `.vercelignore` to exclude unnecessary files

## 🔗 Important Links

- **Full Deployment Guide**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentation**: https://vercel.com/docs

## ⚠️ Known Limitations on Vercel

- **No file storage**: Download feature removed (classifications still work)
- **Cold starts**: First request after inactivity may take 5-10 seconds
- **Function timeout**: 30 seconds configured (enough for model loading)

## 🧪 Test Locally Before Deploying

1. **Start backend** (keep the original backend for local dev):
   ```bash
   cd backend
   python app.py
   ```

2. **Start frontend**:
   ```bash
   cd frontend
   npm start
   ```

## 📞 Need Help?

Refer to the detailed [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) guide or check Vercel documentation.
