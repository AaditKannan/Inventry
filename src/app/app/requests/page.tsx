'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { 
  Plus, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package,
  MapPin,
  Calendar,
  User,
  Building2,
  Send,
  Inbox
} from 'lucide-react';

interface Request {
  id: string;
  requester_team_id: string;
  owner_team_id: string;
  part_id: string;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'fulfilled' | 'cancelled';
  needed_by: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
  part: {
    name: string;
    sku: string | null;
    manufacturer: string | null;
  };
  requester_team: {
    name: string;
    city: string | null;
    region: string | null;
  };
  owner_team: {
    name: string;
    city: string | null;
    region: string | null;
  };
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'outgoing'>('inbox');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data since we're not using real database yet
  const mockIncomingRequests: Request[] = [];
  const mockOutgoingRequests: Request[] = [];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'accepted': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'fulfilled': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'accepted': return <CheckCircle className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      case 'fulfilled': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #3b82f6 1px, transparent 1px)`,
          backgroundSize: '100px 100px, 150px 150px'
        }} />
      </div>

      {/* Twinkling stars - the cool animated dots */}
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

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/10 rounded-lg rotate-45 animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-600/5 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-10 w-20 h-20 border border-blue-400/8 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-float hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-500">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  Part Requests
                </h1>
                <p className="text-blue-200 text-lg">
                  Manage part lending requests between teams
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => alert('Create Request functionality coming soon! For now, go to Parts Library → Add parts → View in Inventory')}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Request
          </Button>
        </div>

        {/* Tabs */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'inbox'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Inbox className="h-4 w-4" />
                Inbox ({mockIncomingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('outgoing')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'outgoing'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-200 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Send className="h-4 w-4" />
                Outgoing ({mockOutgoingRequests.length})
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-500/10 rounded-full">
                {activeTab === 'inbox' ? (
                  <Inbox className="h-12 w-12 text-blue-400" />
                ) : (
                  <Send className="h-12 w-12 text-blue-400" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeTab === 'inbox' ? 'No incoming requests' : 'No outgoing requests'}
            </h3>
            <p className="text-blue-200 mb-6">
              {activeTab === 'inbox' 
                ? "You haven't received any requests yet"
                : "You haven't sent any requests yet"
              }
            </p>
            {activeTab === 'outgoing' && (
              <Button 
                onClick={() => alert('Create Request functionality coming soon! For now, go to Parts Library → Add parts → View in Inventory')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Request
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}