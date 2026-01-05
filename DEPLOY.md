# Deployment Guide - Vercel

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free tier is sufficient)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will automatically detect Vite framework

3. **Configure Build Settings** (usually auto-detected)
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **For production deployment**
   ```bash
   vercel --prod
   ```

## Configuration Files

The project includes the following configuration files for Vercel:

- **`vercel.json`**: Contains build settings and SPA routing configuration
- **`.vercelignore`**: Specifies files/folders to exclude from deployment

## Build Verification

Before deploying, verify the build works locally:

```bash
npm install
npm run build
npm run preview
```

## Environment Variables

This demo doesn't require any environment variables. All data is stored in-memory.

## Post-Deployment

After deployment:
1. Your app will be accessible at the provided Vercel URL
2. All routes will work correctly thanks to the SPA rewrite rules in `vercel.json`
3. You can set up custom domains in Vercel dashboard if needed

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)
- Check build logs in Vercel dashboard

### Routes Not Working
- Ensure `vercel.json` includes the rewrite rules for SPA routing
- Verify React Router is configured correctly

### Assets Not Loading
- Check that asset paths are relative (not absolute)
- Verify `vite.config.js` build settings

