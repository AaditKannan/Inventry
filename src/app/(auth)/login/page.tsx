'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Github, Zap, Shield, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const router = useRouter();
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        setMessage('✨ Magic link sent! Check your email for the secure login link.');
        setMessageType('success');
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern - static, no performance impact - same as home page */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '100px 100px, 150px 150px'
        }} />
      </div>

      {/* Large, bright stars that move on their own - no mouse interaction */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-80 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Floating geometric shapes - smooth movement - same as home page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/10 rounded-lg rotate-45 animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-600/5 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-10 w-20 h-20 border border-blue-400/8 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 group">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full group-hover:shadow-lg group-hover:shadow-blue-500/25 group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all duration-500 hover:scale-110">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
            Welcome to Inventry
          </CardTitle>
          <CardDescription className="text-blue-200 text-lg">
            Your robotics inventory command center
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-200 font-medium">
                Email Address
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-blue-300/40 hover:shadow-lg hover:shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40"
                />
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                <div className="absolute inset-0 rounded-md border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-300 pointer-events-none"></div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-400/20 hover:border-blue-300/40" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Send Magic Link
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-950/50 px-3 py-1 text-blue-300 rounded-full border border-white/10">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth('github')}
              disabled={isLoading}
              className="w-full bg-white/5 border-white/20 text-blue-200 hover:bg-white/10 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 group"
            >
              <Github className="w-4 h-4 mr-2 group-hover:text-blue-300 transition-colors" />
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
              className="w-full bg-white/5 border-white/20 text-blue-200 hover:bg-white/10 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 group"
            >
              <Shield className="w-4 h-4 mr-2 group-hover:text-blue-300 transition-colors" />
              Google
            </Button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm border transition-all duration-300 transform ${
              messageType === 'success' 
                ? 'bg-green-500/20 text-green-300 border-green-500/30 shadow-lg shadow-green-500/20 shadow-2xl shadow-green-500/40' 
                : 'bg-red-500/20 text-red-300 border-red-500/30 shadow-lg shadow-red-500/20 shadow-2xl shadow-red-500/40'
            }`}>
              <div className="flex items-center space-x-2">
                {messageType === 'success' ? (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                )}
                <span>{message}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
