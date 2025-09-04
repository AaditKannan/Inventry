'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Users, Eye, EyeOff } from 'lucide-react';
import StarryBackground from '@/components/ui/starry-background';

interface Team {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<'check' | 'create' | 'join'>('check');
  const [profile, setProfile] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create team form state
  const [teamNumber, setTeamNumber] = useState('');
  const [teamName, setTeamName] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [displayName, setDisplayName] = useState(''); // Add display name field
  
  // Join team form state
  const [selectedTeamId, setSelectedTeamId] = useState('');
  
  const supabase = createClient();
  const router = useRouter();



  const loadPublicTeams = useCallback(async () => {
    try {
      const { data: publicTeams, error } = await supabase
        .from('teams')
        .select('id, name, city, region')
        .eq('visibility', 'public')
        .order('name');

      if (error) {
        console.error('Error loading teams:', error);
      } else {
        setTeams(publicTeams || []);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  }, [supabase]);

  const checkProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('Checking profile for user:', user.id);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('display_name, team_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        console.log('Profile error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If profile doesn't exist (PGRST116), create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              display_name: null,
              team_id: null
            });
          
          if (createError) {
            console.error('Error creating profile:', createError);
            // If we can't create profile, still show create form
            setStep('create');
          } else {
            console.log('Profile created successfully');
            // Profile created but incomplete, show create form
            setStep('create');
          }
        } else {
          // Other errors, show create form
          setStep('create');
        }
              } else if (profileData?.display_name && profileData?.team_id) {
          console.log('Profile complete, redirecting to app');
          // User has completed onboarding, redirect to app
          router.push('/app');
          return;
        } else {
          console.log('Profile incomplete, showing create form');
          console.log('Profile data:', profileData);
          setStep('create');
        }

      await loadPublicTeams();
    } catch (error) {
      console.error('Error checking profile:', error);
      setStep('create');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router, loadPublicTeams]);

  useEffect(() => {
    checkProfile();
  }, [checkProfile]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!teamName.trim()) {
        alert('Please enter your team name');
        setIsSubmitting(false);
        return;
      }

      // Check if team name already exists
      const { data: existingTeam, error: checkError } = await supabase
        .from('teams')
        .select('id')
        .eq('name', teamName.trim())
        .maybeSingle();

      if (existingTeam) {
        alert(`Team name "${teamName}" already exists. Please choose a different name.`);
        setIsSubmitting(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Create the team
      console.log('Creating team with data:', {
        name: teamName,
        city: city || null,
        region: region || null,
        visibility,
        created_by: user.id
      });

      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          city: city || null,
          region: region || null,
          visibility,
          created_by: user.id
        })
        .select()
        .maybeSingle();

      console.log('Team creation result:', { teamData, teamError });

      if (teamError) {
        console.error('Team creation error:', teamError);
        throw teamError;
      }

      if (!teamData) {
        throw new Error('Team was not created - no data returned');
      }

      const team = teamData;

      // Update user profile with team_id
      console.log('Updating profile with:', { team_id: team.id, display_name: displayName || teamName, user_id: user.id });
      
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({ team_id: team.id, display_name: displayName || teamName })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
      
      console.log('Profile updated successfully:', updatedProfile);

      // Create default location for the team
      await supabase
        .from('locations')
        .insert({
          team_id: team.id,
          name: 'Main Lab',
          address: `${city}, ${region}`,
          is_default: true
        });

      console.log('Team created successfully, redirecting to /app...');
      console.log('Profile updated with:', { team_id: team.id, display_name: displayName || teamName });
      
      // Wait a bit for the database to commit the changes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force a hard redirect to ensure middleware sees the updated profile
      window.location.href = '/app';
    } catch (error) {
      console.error('Error creating team:', error);
      
      // Check for specific error types
      if (error && typeof error === 'object' && 'code' in error) {
        const dbError = error as any;
        if (dbError.code === '23505') {
          alert(`Team name "${teamName}" already exists. Please choose a different name.`);
        } else {
          alert(`Failed to create team: ${dbError.message || 'Unknown database error'}`);
        }
      } else {
        alert(`Failed to create team: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Update user profile with team_id and display_name
      const { error } = await supabase
        .from('profiles')
        .update({ 
          team_id: selectedTeamId,
          display_name: displayName || 'Team Member' // Set display name when joining team
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      console.log('Team joined successfully, redirecting to /app...');
      console.log('Profile updated with:', { team_id: selectedTeamId, display_name: displayName || 'Team Member' });
      
      // Try multiple redirect approaches
      try {
        // First try router.push
        router.push('/app');
        
        // If that doesn't work after a short delay, try window.location
        setTimeout(() => {
          if (window.location.pathname !== '/app') {
            console.log('Router push failed, trying window.location...');
            window.location.href = '/app';
          }
        }, 1000);
      } catch (error) {
        console.error('Redirect error:', error);
        // Fallback to window.location
        window.location.href = '/app';
      }
    } catch (error) {
      console.error('Error joining team:', error);
      alert('Failed to join team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.city && team.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (team.region && team.region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <StarryBackground className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4"
      starCount={25}>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-float hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-500">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mb-2">
            Welcome to Inventry!
          </h1>
          <p className="text-blue-200 text-lg">
            Let&apos;s get you set up with your robotics team
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-xl p-1 rounded-lg shadow-lg border border-white/20">
            <button
              onClick={() => setStep('create')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                step === 'create'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Create Team
            </button>
            <button
              onClick={() => setStep('join')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                step === 'join'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              Join Team
            </button>
          </div>
        </div>

        {/* Create Team Form */}
        {step === 'create' && (
          <Card className="max-w-md mx-auto bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group card-hover-glow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-white">
                <Building2 className="h-6 w-6 text-blue-400" />
                Create Your Team
              </CardTitle>
              <CardDescription className="text-blue-200">
                Create your robotics team on Inventry and start managing your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTeam} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="teamNumber" className="text-blue-200 font-medium">Team Number</Label>
                  <div className="relative group">
                    <Input
                      id="teamNumber"
                      value={teamNumber}
                      onChange={(e) => setTeamNumber(e.target.value)}
                      placeholder="e.g., 12345 (optional)"
                      className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-blue-300/40 input-hover-glow"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-md border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-blue-200 font-medium">Team Name *</Label>
                  <div className="relative group">
                    <Input
                      id="teamName"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g., RoboRockets"
                      required
                      className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-blue-300/40 input-hover-glow"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-md border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-blue-200 font-medium">Your Display Name *</Label>
                  <div className="relative group">
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g., John Doe"
                      required
                      className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-blue-300/40 input-hover-glow"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-md border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-blue-200 font-medium">City</Label>
                    <div className="relative group">
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., Seattle"
                        className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-blue-300/40 input-hover-glow"
                      />
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="absolute inset-0 rounded-md border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-blue-200 font-medium">Region</Label>
                    <div className="relative group">
                      <Input
                        id="region"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="e.g., WA"
                        className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-blue-300/40 input-hover-glow"
                      />
                      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      <div className="absolute inset-0 rounded-md border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-blue-200 font-medium">Team Visibility</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        value="public"
                        checked={visibility === 'public'}
                        onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 text-blue-200 group-hover:text-white transition-colors">
                        <Eye className="h-4 w-4 text-blue-400" />
                        <span>Public</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        value="private"
                        checked={visibility === 'private'}
                        onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center gap-2 text-blue-200 group-hover:text-white transition-colors">
                        <EyeOff className="h-4 w-4 text-red-400" />
                        <span>Private</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-400/20 hover:border-blue-300/40 button-hover-glow" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Team...</span>
                    </div>
                  ) : (
                    'Create Team'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Join Team Form */}
        {step === 'join' && (
          <Card className="max-w-md mx-auto bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group card-hover-glow">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-white">
                <Users className="h-6 w-6 text-blue-400" />
                Join Existing Team
              </CardTitle>
              <CardDescription className="text-blue-200">
                Join a public robotics team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinTeam} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-blue-200 font-medium">Your Display Name *</Label>
                  <div className="relative group">
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g., John Doe"
                      required
                      className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-blue-300/40 input-hover-glow"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-md border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search" className="text-blue-200 font-medium">Search Teams</Label>
                  <div className="relative group">
                    <Input
                      id="search"
                      placeholder="Search by name, city, or region..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:bg-white/15 group-hover:border-blue-300/40 input-hover-glow"
                    />
                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    <div className="absolute inset-0 rounded-md border-2 border-blue-400/0 group-hover:border-blue-400/40 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-blue-200 font-medium">Available Teams</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredTeams.length === 0 ? (
                      <p className="text-sm text-blue-300 text-center py-4">
                        No teams found matching your search
                      </p>
                    ) : (
                      filteredTeams.map((team) => (
                        <label key={team.id} className="flex items-center gap-3 p-2 border border-white/10 rounded-lg hover:bg-white/5 cursor-pointer transition-all duration-200">
                          <input
                            type="radio"
                            name="team"
                            value={team.id}
                            checked={selectedTeamId === team.id}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <div className="font-medium text-white">{team.name}</div>
                            <div className="text-sm text-blue-300">
                              {[team.city, team.region].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-blue-400/20 hover:border-blue-300/40 button-hover-glow" 
                  disabled={!selectedTeamId || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Joining Team...</span>
                    </div>
                  ) : (
                    'Join Team'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </StarryBackground>
  );
}
