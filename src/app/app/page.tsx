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

      // Get stats
      const [partsResult, inventoryResult, requestsResult, membersResult] = await Promise.all([
        supabase.from('parts').select('id', { count: 'exact' }),
        supabase.from('inventory_items').select('id', { count: 'exact' }).eq('team_id', profile.team_id),
        supabase.from('requests').select('id', { count: 'exact' }).eq('owner_team_id', profile.team_id).eq('status', 'pending'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('team_id', profile.team_id)
      ]);

      setStats({
        totalParts: partsResult.count || 0,
        totalInventory: inventoryResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        teamMembers: membersResult.count || 0
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
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back to {team?.name} {team?.city && `(${team.city}${team?.region ? `, ${team.region}` : ''})`}
        </p>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParts}</div>
            <p className="text-xs text-muted-foreground">
              Parts in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInventory}</div>
            <p className="text-xs text-muted-foreground">
              Items in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => router.push('/app/parts')}
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <Plus className="h-6 w-6" />
            <span>Add Part</span>
          </Button>
          
          <Button 
            onClick={() => router.push('/app/inventory')}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <Boxes className="h-6 w-6" />
            <span>Manage Inventory</span>
          </Button>
          
          <Button 
            onClick={() => router.push('/app/requests')}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <MessageSquare className="h-6 w-6" />
            <span>View Requests</span>
          </Button>
          
          <Button 
            onClick={() => router.push('/app/map')}
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
          >
            <Map className="h-6 w-6" />
            <span>Explore Teams</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">New part "Arduino Uno" added to catalog</span>
                <span className="text-xs text-gray-400 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Request from TechTitans accepted</span>
                <span className="text-xs text-gray-400 ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Inventory updated: 5 motors added</span>
                <span className="text-xs text-gray-400 ml-auto">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
