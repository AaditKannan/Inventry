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
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalParts: number;
  totalInventory: number;
  pendingRequests: number;
  teamMembers: number;
}

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

      // For now, use mock stats since we haven't applied the schema yet
      setStats({
        totalParts: 12,
        totalInventory: 45,
        pendingRequests: 3,
        teamMembers: 8
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading dashboard...</p>
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

      {/* Floating elements */}
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
              <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">
                <Plus className="h-6 w-6" />
                <span>Add Part</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 hover:text-white">
                <Package className="h-6 w-6" />
                <span>View Inventory</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 hover:text-white">
                <MessageSquare className="h-6 w-6" />
                <span>Check Requests</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 hover:text-white">
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
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <Activity className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="font-medium text-white">New part added</p>
                  <p className="text-sm text-blue-200">GoBILDA motor added to inventory</p>
                </div>
                <span className="text-sm text-blue-300 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <div>
                  <p className="font-medium text-white">Inventory updated</p>
                  <p className="text-sm text-blue-200">Stock levels adjusted for competition</p>
                </div>
                <span className="text-sm text-blue-300 ml-auto">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
