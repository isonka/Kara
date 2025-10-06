# Kara Frontend Deployment Guide

## Quick Deploy Options

### Option 1: Netlify (Recommended)
1. **Connect Repository:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git" 
   - Connect your GitHub repository

2. **Build Settings:**
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`
   - Node version: 18

3. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://kara-agcc.onrender.com
   ```

### Option 2: Vercel
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

### Option 3: Manual Static Hosting
1. **Build the app:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload contents of `frontend/build/` to your hosting provider**

## Production Build
The app is already built and ready in `frontend/build/` directory.

## Environment Configuration
- **API URL:** https://kara-agcc.onrender.com (Render backend)
- **Build Output:** `frontend/build/`
- **SPA Routing:** Configured for React Router

## Features Deployed
✅ Authentication system
✅ Supplier management  
✅ Ingredient management
✅ Recipe management (create/edit/delete)
✅ Recipe cost calculation
✅ Mobile-responsive design
✅ REST API integration

## Backend
Backend is already deployed at: https://kara-agcc.onrender.com