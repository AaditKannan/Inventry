#!/bin/bash

# Deploy script for GitHub Pages
echo "🚀 Starting deployment to GitHub Pages..."

# Build the project
echo "📦 Building project..."
npm run build

# Create .nojekyll file to bypass Jekyll processing
echo "📝 Creating .nojekyll file..."
touch out/.nojekyll

# Add all files to git
echo "📋 Adding files to git..."
git add out/

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages - $(date)"

# Push to gh-pages branch
echo "🚀 Pushing to GitHub Pages..."
git subtree push --prefix out origin gh-pages

echo "✅ Deployment complete!"
echo "🌐 Your site should be available at: https://[your-username].github.io/Inventry"
