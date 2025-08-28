'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>('Click to test');
  const [loading, setLoading] = useState(false);

  const testBasic = () => {
    setStatus('Basic test clicked!');
  };

  const testEnvironment = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      setStatus('❌ Environment variables are missing!');
    } else {
      setStatus(`✅ Environment variables found!\nURL: ${url.substring(0, 30)}...\nKey: ${key.substring(0, 20)}...`);
    }
  };

  const testSupabase = async () => {
    setLoading(true);
    setStatus('Testing Supabase...');

    try {
      // Check environment variables first
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        setStatus(`❌ Environment variables missing!\nURL: ${url || 'undefined'}\nKey: ${key ? 'present' : 'missing'}`);
        return;
      }

      setStatus(`Environment OK\nURL: ${url.substring(0, 30)}...\nKey: ${key.substring(0, 20)}...\n\nCreating client...`);

      // Dynamic import to avoid build issues
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      setStatus('Client created, testing connection...');
      
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        setStatus(`❌ Supabase error: ${error.message}`);
      } else {
        setStatus('✅ Supabase connection successful!');
      }
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}\n\nStack: ${err.stack}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Debug Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testBasic} className="w-full">
            Test Basic Click
          </Button>
          
          <Button onClick={testEnvironment} className="w-full">
            Check Environment Variables
          </Button>
          
          <Button 
            onClick={testSupabase} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Supabase'}
          </Button>
          
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="text-sm font-mono whitespace-pre-line">{status}</p>
          </div>

          <div className="text-xs text-gray-600 space-y-2">
            <p><strong>Current Environment:</strong></p>
            <p>NODE_ENV: {process.env.NODE_ENV}</p>
            <p>URL Set: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No'}</p>
            <p>Key Set: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
