# Vercel Deployment Guide for CIFAR-10 Image Classifier

This guide will help you deploy your CIFAR-10 Image Classifier application to Vercel.

## 📋 Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works fine)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
3. Git repository initialized (optional but recommended)

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure Project Settings:**
   - **Framework Preset**: Select "Other" or leave as detected
   - **Root Directory**: Leave as `./` (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`

6. **Environment Variables** (if needed):
   - You can add environment variables in the Vercel dashboard
   - For this project, no additional environment variables are required by default

7. **Click "Deploy"**

8. **Wait for deployment to complete** (first deployment may take 2-5 minutes)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `cifar10-classifier` (or your preferred name)
   - In which directory is your code located? `./`

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## ⚙️ Configuration Files Explained

### `vercel.json`
This file configures how Vercel builds and serves your application:
- **buildCommand**: Builds the React frontend
- **outputDirectory**: Specifies where the built frontend files are located
- **rewrites**: Routes API calls to `/api/*` to the serverless Python function
- **functions**: Configures the serverless function timeout (30 seconds for model loading)

### `api/index.py`
The serverless API function that handles image classification:
- Loads the PyTorch model on-demand (cached per instance)
- Handles `/api/predict` for image classification
- Handles `/api/health` for health checks
- Optimized for serverless environment (no file storage)

### `.vercelignore`
Specifies files and directories to exclude from deployment to reduce bundle size.

## 🔧 Important Notes

### Limitations on Vercel

1. **No File Storage**: Vercel's serverless functions don't have persistent file storage. The download feature from the original backend won't work. The API now only returns classification results.

2. **Cold Starts**: First request after inactivity may take 5-10 seconds as the model loads.

3. **Function Timeout**: Free tier has 10-second timeout, hobby tier has 60 seconds. Model loading + inference should complete within limits for most cases.

4. **Memory Limits**: Serverless functions have memory limits (1GB on free tier, 3GB on pro). The ResNet20 model should fit comfortably.

### To Remove Download Feature from Frontend

Since file storage isn't available on Vercel, you may want to remove or disable the download feature in your React app. The classification results will still be displayed in the UI.

## 🧪 Testing Your Deployment

1. **Visit your deployed URL** (e.g., `https://your-app.vercel.app`)

2. **Test the health check**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. **Upload test images** through the UI

4. **Check the classification results**

## 🐛 Troubleshooting

### Deployment Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are listed in `api/requirements.txt`
- Verify `frontend/package.json` has all required dependencies

### API Returns 500 Error
- Check function logs in Vercel dashboard
- Model loading might be timing out (increase timeout in vercel.json)
- Check memory usage

### Frontend Not Loading
- Verify build output directory is correct (`frontend/build`)
- Check that React build completed successfully
- Inspect browser console for errors

### API Calls Failing
- Verify API routes use `/api/` prefix
- Check CORS settings (should be handled automatically)
- Inspect network tab in browser dev tools

## 🔄 Updating Your Deployment

### Automatic Deployments (with Git integration)
- Simply push to your main branch
- Vercel will automatically rebuild and deploy

### Manual Deployments (via CLI)
```bash
vercel --prod
```

## 📊 Monitoring

- **View logs**: Vercel Dashboard → Your Project → Deployments → View Function Logs
- **Analytics**: Available in Vercel dashboard
- **Real-time logs**: Use `vercel logs` command

## 💰 Cost Considerations

**Free Tier Includes**:
- 100 GB bandwidth
- Unlimited deployments
- Serverless function invocations (with limits)

**If you exceed free tier**:
- Hobby plan: $20/month
- Consider caching strategies or CDN for images

## 🎉 Success!

Your CIFAR-10 Image Classifier should now be live on Vercel! Share your deployment URL and start classifying images.

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Python on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/python)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

## 🆘 Need Help?

- Check [Vercel Community](https://github.com/vercel/vercel/discussions)
- Review [Vercel Examples](https://github.com/vercel/examples)
- Post issues in your project repository
