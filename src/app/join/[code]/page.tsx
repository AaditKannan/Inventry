'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { 
  Building2, 
  Users, 
  Check, 
  X,
  MapPin,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import StarryBackground from '@/components/ui/starry-background';

interface TeamInvite {
  teamId: string;
  teamName: string;
  createdAt: string;
  createdBy: string;
}

interface Team {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  visibility: 'public' | 'private';
  created_at: string;
}

export default function JoinTeamPage() {
  const params = useParams();
  const router = useRouter();
  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  const inviteCode = params.code as string;

  useEffect(() => {
    loadInviteData();
  }, [inviteCode]);

  const loadInviteData = async () => {
    try {
      // Get invite from localStorage (in production, this would be from database)
      const invites = JSON.parse(localStorage.getItem('teamInvites') || '{}');
      const inviteData = invites[inviteCode];

      if (!inviteData) {
        setError('Invalid or expired invite link');
        setIsLoading(false);
        return;
      }

      setInvite(inviteData);

      // Load team data from database
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', inviteData.teamId)
        .single();

      if (teamError) {
        console.error('Error loading team:', teamError);
        setError('Team not found');
        setIsLoading(false);
        return;
      }

      setTeam(teamData);
    } catch (error) {
      console.error('Error loading invite:', error);
      setError('Failed to load invite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!team || !invite) return;

    setIsJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login with return path
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      // Update user's profile to join the team
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ team_id: team.id })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error joining team:', profileError);
        alert('Failed to join team. Please try again.');
        return;
      }

      // Success! Redirect to the app
      alert(`Successfully joined ${team.name}!`);
      router.push('/app');
    } catch (error) {
      console.error('Error joining team:', error);
      alert('Failed to join team. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-blue-200 mt-4">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !team || !invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-white">Invalid Invitation</CardTitle>
            <CardDescription className="text-blue-200">
              {error || 'This invitation link is invalid or has expired.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

      return (
      <StarryBackground className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6"
        starCount={25}>

      <div className="flex items-center justify-center min-h-screen relative z-10">
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">You're Invited!</CardTitle>
            <CardDescription className="text-blue-200">
              You've been invited to join a robotics team on Inventry
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Team Information */}
            <div className="bg-slate-800/30 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-lg">{team.name}</h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  team.visibility === 'public' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-red-500/20 text-red-300'
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
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {(team.city || team.region) && (
                  <div className="flex items-center gap-2 text-blue-300">
                    <MapPin className="h-4 w-4" />
                    <span>{[team.city, team.region].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-blue-300">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleJoinTeam}
                disabled={isJoining}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                {isJoining ? 'Joining...' : 'Join Team'}
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>

            <p className="text-blue-300 text-xs text-center">
              By joining this team, you'll be able to access their inventory and participate in part lending.
            </p>
          </CardContent>
        </Card>
      </div>
    </StarryBackground>
  );
}
