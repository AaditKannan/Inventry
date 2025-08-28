import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function POST() {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
  }

  // Redirect to home page after logout
  redirect('/');
}
