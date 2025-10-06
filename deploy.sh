#!/bin/bash

# Kara Frontend Deployment Script

echo "🚀 Starting Kara Frontend Deployment..."

# Navigate to frontend directory
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the production app
echo "🏗️  Building production app..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build files are ready in: frontend/build/"
    echo ""
    echo "🌐 Deploy options:"
    echo "   1. Netlify: Drag & drop the build folder to netlify.com/drop"
    echo "   2. Vercel: Run 'npx vercel --prod' from frontend directory"
    echo "   3. Static hosting: Upload contents of build/ folder"
    echo ""
    echo "🔗 Backend API: https://kara-agcc.onrender.com"
    echo ""
    
    # Optional: Start local server to test production build
    read -p "🧪 Test production build locally? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌍 Starting local production server on http://localhost:3000..."
        npx serve -s build -l 3000
    fi
else
    echo "❌ Build failed!"
    exit 1
fi