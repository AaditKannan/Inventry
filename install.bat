@echo off
echo Installing dependencies for Inventry...
npm install
echo.
echo Dependencies installed successfully!
echo.
echo Next steps:
echo 1. Copy .env.example to .env.local and fill in your values
echo 2. Set up Supabase project and run schema.sql
echo 3. Run: npm run dev
pause
