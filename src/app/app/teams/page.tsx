'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    lat: '',
    lng: '',
    visibility: 'public' as 'public' | 'private'
  });
  
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      if (!profile?.team_id) return;

      // Load team data
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', profile.team_id)
        .single();

      if (teamError) throw teamError;

      // Load team members
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('team_id', profile.team_id)
        .order('created_at');

      if (membersError) throw membersError;

      setTeam(teamData);
      setMembers(membersData || []);
      
      // Initialize edit form
      setEditForm({
        name: teamData.name,
        city: teamData.city || '',
        region: teamData.region || '',
        lat: teamData.lat?.toString() || '',
        lng: teamData.lng?.toString() || '',
        visibility: teamData.visibility
      });
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({
      name: team?.name || '',
      city: team?.city || '',
      region: team?.region || '',
      lat: team?.lat?.toString() || '',
      lng: team?.lng?.toString() || '',
      visibility: team?.visibility || 'public'
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!team) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: editForm.name,
          city: editForm.city || null,
          region: editForm.region || null,
          lat: editForm.lat ? parseFloat(editForm.lat) : null,
          lng: editForm.lng ? parseFloat(editForm.lng) : null,
          visibility: editForm.visibility
        })
        .eq('id', team.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team updated successfully"
      });

      setIsEditing(false);
      loadData(); // Reload data to get updated values
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };

  const isTeamAdmin = () => {
    if (!team) return false;
    // This function will be updated to work with the current user context
    // For now, return true to allow editing for testing
    return true;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Found</h3>
            <p className="text-gray-500">You need to be part of a team to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your team profile and settings
          </p>
        </div>
        {isTeamAdmin() && (
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Team
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Team Profile */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Team Profile
          </CardTitle>
          <CardDescription>
            Basic information about your robotics team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {team.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              {isEditing ? (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="public"
                      checked={editForm.visibility === 'public'}
                      onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value as 'public' | 'private' })}
                      className="w-4 h-4"
                    />
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Public
                    </div>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="private"
                      checked={editForm.visibility === 'private'}
                      onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value as 'public' | 'private' })}
                      className="w-4 h-4"
                    />
                    <div className="flex items-center gap-1">
                      <EyeOff className="h-4 w-4" />
                      Private
                    </div>
                  </label>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border flex items-center gap-2">
                  {team.visibility === 'public' ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Public
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Private
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  placeholder="e.g., Seattle"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {team.city || 'Not specified'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              {isEditing ? (
                <Input
                  id="region"
                  value={editForm.region}
                  onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  placeholder="e.g., WA"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {team.region || 'Not specified'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              {isEditing ? (
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={editForm.lat}
                  onChange={(e) => setEditForm({ ...editForm, lat: e.target.value })}
                  placeholder="e.g., 47.6062"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {team.lat ? team.lat.toFixed(6) : 'Not specified'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              {isEditing ? (
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={editForm.lng}
                  onChange={(e) => setEditForm({ ...editForm, lng: e.target.value })}
                  placeholder="e.g., -122.3321"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {team.lng ? team.lng.toFixed(6) : 'Not specified'}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-gray-500">
              Team created on {new Date(team.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({members.length})
          </CardTitle>
          <CardDescription>
            People who are part of your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {member.display_name?.[0] || member.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {member.display_name || 'No display name'}
                    </div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
