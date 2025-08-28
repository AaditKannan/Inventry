// Simple script to check environment variables
require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variables Check ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('URL Preview:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 50) + '...');
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Key Preview:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + '...');
}
