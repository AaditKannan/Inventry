import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If user is not authenticated and trying to access protected routes
  if (!user && request.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated but doesn't have a complete profile, redirect to onboarding
  if (user && request.nextUrl.pathname.startsWith('/app')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, team_id')
        .eq('id', user.id)
        .single();

      console.log('Middleware profile check:', { profile, path: request.nextUrl.pathname });

      if (!profile?.display_name || !profile?.team_id) {
        console.log('Redirecting to onboarding - missing profile data');
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    } catch (error) {
      console.log('Redirecting to onboarding - profile error:', error);
      // If profile doesn't exist, redirect to onboarding
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // If authenticated user with complete profile tries to access auth pages, redirect to app
  if (user && request.nextUrl.pathname === '/login') {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, team_id')
        .eq('id', user.id)
        .single();

      if (profile?.display_name && profile?.team_id) {
        return NextResponse.redirect(new URL('/app', request.url));
      }
    } catch (error) {
      // If profile doesn't exist, let them go to onboarding
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/app/:path*',
    '/login',
    '/onboarding',
  ],
};
