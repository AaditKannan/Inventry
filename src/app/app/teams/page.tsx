'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { 
  Building2, 
  MapPin, 
  Eye, 
  EyeOff, 
  Edit, 
  Save, 
  X,
  Users,
  Calendar,
  Settings,
  Crown,
  UserPlus
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  visibility: 'public' | 'private';
  created_at: string;
  created_by: string;
}

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  team_id: string;
  created_at: string;
}

export default function TeamsPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    city: '',
    region: '',
    visibility: 'public' as 'public' | 'private'
  });
  
  const supabase = createClient();

  // Mock team data for now
  const mockTeam: Team = {
    id: '1',
    name: 'Robo Hawks',
    city: 'Austin',
    region: 'Texas',
    lat: 30.2672,
    lng: -97.7431,
    visibility: 'public',
    created_at: new Date().toISOString(),
    created_by: 'user1'
  };

  const mockMembers: Profile[] = [
    {
      id: '1',
      email: 'captain@robohawks.com',
      display_name: 'Team Captain',
      team_id: '1',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      email: 'engineer@robohawks.com',
      display_name: 'Lead Engineer',
      team_id: '1',
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      email: 'programmer@robohawks.com',
      display_name: 'Software Lead',
      team_id: '1',
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's profile to find their team
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id, display_name')
        .eq('id', user.id)
        .single();

      if (profile?.team_id) {
        // Load team data
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('id', profile.team_id)
          .single();

        if (teamData) {
          setTeam(teamData);
          setEditForm({
            name: teamData.name,
            city: teamData.city || '',
            region: teamData.region || '',
            visibility: teamData.visibility
          });
        }

        // Load team members
        const { data: membersData } = await supabase
          .from('profiles')
          .select('id, email, display_name, team_id, created_at')
          .eq('team_id', profile.team_id);

        if (membersData) {
          setMembers(membersData);
        }
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      // Fall back to mock data if real data fails
      setTeam(mockTeam);
      setMembers(mockMembers);
      setEditForm({
        name: mockTeam.name,
        city: mockTeam.city || '',
        region: mockTeam.region || '',
        visibility: mockTeam.visibility
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (team) {
      setTeam({
        ...team,
        name: editForm.name,
        city: editForm.city || null,
        region: editForm.region || null,
        visibility: editForm.visibility
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    if (team) {
      setEditForm({
        name: team.name,
        city: team.city || '',
        region: team.region || '',
        visibility: team.visibility
      });
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-blue-400/50 mx-auto mb-4" />
            <p className="text-blue-200 text-lg">No team found</p>
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
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  Team Management
                </h1>
                <p className="text-blue-200 text-lg">
                  Manage your team settings and members
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Settings className="h-5 w-5 mr-2" />
            {isEditing ? 'Cancel Edit' : 'Edit Team'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Information */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">Team Information</CardTitle>
                <Badge className={`${team.visibility === 'public' 
                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {team.visibility === 'public' ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-blue-200 text-sm mb-2 block">Team Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-slate-800/80 border border-white/20 text-white placeholder-blue-300/70 focus:bg-slate-700/80 focus:border-blue-400 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200 text-sm mb-2 block">City</Label>
                    <Input
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="bg-slate-800/80 border border-white/20 text-white placeholder-blue-300/70 focus:bg-slate-700/80 focus:border-blue-400 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200 text-sm mb-2 block">Region/State</Label>
                    <Input
                      value={editForm.region}
                      onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                      className="bg-slate-800/80 border border-white/20 text-white placeholder-blue-300/70 focus:bg-slate-700/80 focus:border-blue-400 backdrop-blur-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200 text-sm mb-2 block">Visibility</Label>
                    <select
                      value={editForm.visibility}
                      onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value as 'public' | 'private' })}
                      className="w-full bg-slate-800/80 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none focus:bg-slate-700/80 backdrop-blur-sm"
                    >
                      <option value="public" className="bg-slate-800 text-white">Public</option>
                      <option value="private" className="bg-slate-800 text-white">Private</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSaveEdit}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-blue-300 text-sm">Team Name</p>
                    <p className="text-white text-lg font-medium">{team.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Location</p>
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      <span>{[team.city, team.region].filter(Boolean).join(', ') || 'Not specified'}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Created</p>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span>{new Date(team.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-xl">Team Members ({members.length})</CardTitle>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {member.display_name || 'Team Member'}
                        </p>
                        <p className="text-blue-300 text-sm">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      <span className="text-blue-300 text-sm">
                        {new Date(member.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}