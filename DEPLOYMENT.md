# 🚀 Deployment Guide for GitHub Pages

## Quick Deploy (Recommended)

### Option 1: Automatic Deployment (GitHub Actions)
1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy to GitHub Pages
3. Your site will be available at: `https://[your-username].github.io/Inventry`

### Option 2: Manual Deployment
1. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 3: Manual Commands
```bash
# Build the project
npm run build

# Create .nojekyll file
touch out/.nojekyll

# Add and commit
git add out/
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
git subtree push --prefix out origin gh-pages
```

## Setup GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy when you push to `main`

## Important Notes

- **Repository Name**: Make sure your repository name matches the `basePath` in `next.config.mjs`
- **Environment Variables**: For production, you'll need to set up your Supabase environment variables in GitHub Secrets
- **Custom Domain**: You can add a custom domain in GitHub Pages settings

## Environment Variables for Production

Add these to your GitHub repository secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

- If the site shows 404, check that the repository name in `next.config.mjs` matches your actual repo name
- If images don't load, ensure `unoptimized: true` is set in the Next.js config
- If the build fails, check the GitHub Actions logs for specific errors

## Local Development

For local development, the app will work normally:
```bash
npm run dev
```

The app will be available at `http://localhost:3000` (or your configured port).
