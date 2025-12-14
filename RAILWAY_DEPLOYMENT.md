# Deploy to Railway.app - Complete Guide

Railway.app is perfect for ML applications with large dependencies like PyTorch.

## 🚀 Step-by-Step Deployment

### 1. Deploy Backend on Railway

1. **Go to [Railway.app](https://railway.app)** and sign up/login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `biydaalt2`

3. **Railway will auto-detect the app**
   - It will find the `Procfile` and `backend/requirements.txt`
   - Click "Deploy" 

4. **Wait for deployment** (3-5 minutes for first time due to PyTorch download)

5. **Get your Railway URL**
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-app.up.railway.app`)

### 2. Deploy Frontend on Vercel

1. **Your frontend is already on Vercel** from the previous push

2. **Add Environment Variable in Vercel**:
   - Go to your project in Vercel Dashboard
   - Settings → Environment Variables
   - Add:
     - **Name**: `REACT_APP_API_URL`
     - **Value**: `https://your-app.up.railway.app` (your Railway URL)
   - Save

3. **Redeploy**:
   - Go to Deployments
   - Click "..." on latest deployment
   - Select "Redeploy"

### 3. Update Backend CORS (if needed)

If you get CORS errors, update your backend CORS settings:

```python
# In backend/app.py
from flask_cors import CORS

# Replace:
CORS(app)

# With:
CORS(app, origins=["https://your-vercel-app.vercel.app"])
```

## ✅ That's It!

Your app architecture:
```
Vercel (Frontend) → Railway (Backend with PyTorch)
```

## 💰 Cost

- **Vercel**: Free tier (plenty for frontend)
- **Railway**: 
  - $5 credit free per month
  - Pay only for usage after that (~$5-10/month typically)
  - Much cheaper than running your own server

## 🧪 Testing

After deployment:

1. **Test Backend**:
   ```bash
   curl https://your-app.up.railway.app/health
   ```

2. **Test Frontend**: 
   - Visit your Vercel URL
   - Upload images
   - Should work perfectly!

## 🐛 Troubleshooting

### Backend not starting on Railway:
- Check logs in Railway dashboard
- Verify `Procfile` exists in root
- Verify `backend/requirements.txt` exists

### Frontend can't connect to backend:
- Verify environment variable is set in Vercel
- Check CORS settings in backend
- Ensure Railway domain is generated and public

### Images not classifying:
- Check Railway logs for errors
- Verify model is loading (check "Loading model..." in logs)
- Test backend health endpoint directly

## 🔄 Updates

To update your app:
1. Push to GitHub
2. Railway auto-deploys backend
3. Vercel auto-deploys frontend
4. Both update automatically!

## 📚 More Help

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway) - Very helpful community
