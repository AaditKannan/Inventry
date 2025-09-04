'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Boxes, 
  MessageSquare, 
  Users, 
  Map, 
  Plus,
  TrendingUp,
  Activity,
  Zap,
  FileText
} from 'lucide-react';

interface DashboardStats {
  totalParts: number;
  totalInventory: number;
  pendingRequests: number;
  teamMembers: number;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  details: string;
  timestamp: string;
  itemCount?: number;
}

const RecentActivityList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Load real activities from localStorage
    const loadActivities = () => {
      const storedActivities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
      const inventoryItems = JSON.parse(localStorage.getItem('inventory') || '[]');
      
      // Create activities from recent inventory additions if no stored activities
      if (storedActivities.length === 0 && inventoryItems.length > 0) {
        const recentInventoryActivities = inventoryItems
          .filter((item: any) => item.created_at)
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((item: any) => ({
            id: `inventory-${item.id}`,
            type: item.added_from === 'invoice' ? 'invoice_item_added' : 'part_added',
            description: item.added_from === 'invoice' ? 'Part added from invoice' : 'Part added to inventory',
            details: `${item.name} (${item.part_number})`,
            timestamp: item.created_at,
            itemCount: item.stock || item.current_stock || 1
          }));
        
        setActivities(recentInventoryActivities);
      } else {
        setActivities(storedActivities);
      }
    };

    loadActivities();
    
    // Refresh every 10 seconds to catch new activities
    const interval = setInterval(loadActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_processed':
        return <Zap className="h-5 w-5 text-yellow-400" />;
      case 'invoice_item_added':
        return <FileText className="h-5 w-5 text-green-400" />;
      case 'part_added':
        return <Package className="h-5 w-5 text-blue-400" />;
      case 'inventory_updated':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      default:
        return <Activity className="h-5 w-5 text-blue-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return activityTime.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-blue-400/50 mx-auto mb-4" />
        <p className="text-blue-200 text-lg mb-2">No recent activity</p>
        <p className="text-blue-300 text-sm">
          Start by adding parts to see activity updates here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
          {getActivityIcon(activity.type)}
          <div className="flex-1">
            <p className="font-medium text-white">{activity.description}</p>
            <p className="text-sm text-blue-200">{activity.details}</p>
          </div>
          <span className="text-sm text-blue-300">{formatTimestamp(activity.timestamp)}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalParts: 0,
    totalInventory: 0,
    pendingRequests: 0,
    teamMembers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter();

  const loadDashboardData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's team
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      if (!profile?.team_id) {
        router.push('/onboarding');
        return;
      }

      // Get team info
      const { data: teamData } = await supabase
        .from('teams')
        .select('name, city, region')
        .eq('id', profile.team_id)
        .single();

      setTeam(teamData);

      // Get real stats from localStorage - show 0 if no real data
      const inventoryFromStorage = JSON.parse(localStorage.getItem('inventory') || '[]');
      
      setStats({
        totalParts: 0, // No parts library yet - will be 0 until real parts added
        totalInventory: inventoryFromStorage.length, // Real count from localStorage
        pendingRequests: 0, // No requests yet - will be 0 until real requests
        teamMembers: 1 // At least 1 (current user)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6 relative overflow-hidden">
      {/* Background pattern - subtle grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #1e3a8a 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #1e3a8a 1px, transparent 1px)`,
          backgroundSize: '120px 120px, 180px 180px'
        }} />
      </div>



      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-500/10 rounded-lg rotate-45 animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-600/5 rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-10 w-20 h-20 border border-blue-400/8 rounded-full animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-float hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-500">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mb-2">
            Welcome back!
          </h1>
          <p className="text-blue-200 text-lg">
            {team ? `${team.name} • ${team.city}, ${team.region}` : 'Loading team info...'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Total Parts</p>
                  <p className="text-2xl font-bold text-white">{stats.totalParts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Inventory Items</p>
                  <p className="text-2xl font-bold text-white">{stats.totalInventory}</p>
                </div>
                <Boxes className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Pending Requests</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingRequests}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Team Members</p>
                  <p className="text-2xl font-bold text-white">{stats.teamMembers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-white text-xl">Quick Actions</CardTitle>
            <CardDescription className="text-blue-200">
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => router.push('/app/parts')}
                className="h-20 flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
              >
                <Plus className="h-6 w-6" />
                <span>Add Part</span>
              </Button>
              <Button 
                onClick={() => router.push('/app/inventory')}
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 hover:text-white"
              >
                <Package className="h-6 w-6" />
                <span>View Inventory</span>
              </Button>
              <Button 
                onClick={() => router.push('/app/requests')}
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 hover:text-white"
              >
                <MessageSquare className="h-6 w-6" />
                <span>Check Requests</span>
              </Button>
              <Button 
                onClick={() => router.push('/app/map')}
                variant="outline" 
                className="h-20 flex-col gap-2 bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 hover:text-white"
              >
                <Map className="h-6 w-6" />
                <span>View Map</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-white text-xl">Recent Activity</CardTitle>
            <CardDescription className="text-blue-200">
              Latest updates from your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
