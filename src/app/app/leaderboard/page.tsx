'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star,
  Package,
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  Crown,
  Sparkles,
  Heart
} from 'lucide-react';
import StarryBackground from '@/components/ui/starry-background';

interface LeaderboardTeam {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  total_parts_lent: number;
  total_requests_fulfilled: number;
  total_teams_helped: number;
  avg_rating: number;
  last_lend_date: string | null;
  gracious_points: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'this-season' | 'this-month' | 'this-week'>('this-season');
  
  const supabase = createClient();

  // Mock leaderboard data for gracious professionalism
  const mockLeaderboard: LeaderboardTeam[] = [
    {
      id: '1',
      name: 'Robo Hawks',
      city: 'Austin',
      region: 'Texas',
      total_parts_lent: 247,
      total_requests_fulfilled: 89,
      total_teams_helped: 23,
      avg_rating: 4.9,
      last_lend_date: '2024-01-15',
      gracious_points: 1,
      rank: 1
    },
    {
      id: '2',
      name: 'Steel Eagles',
      city: 'Houston',
      region: 'Texas',
      total_parts_lent: 198,
      total_requests_fulfilled: 74,
      total_teams_helped: 19,
      avg_rating: 4.8,
      last_lend_date: '2024-01-12',
      gracious_points: 890,
      rank: 2
    },
    {
      id: '3',
      name: 'Circuit Breakers',
      city: 'Dallas',
      region: 'Texas',
      total_parts_lent: 156,
      total_requests_fulfilled: 61,
      total_teams_helped: 16,
      avg_rating: 4.7,
      last_lend_date: '2024-01-10',
      gracious_points: 720,
      rank: 3
    },
    {
      id: '4',
      name: 'Gear Guardians',
      city: 'San Antonio',
      region: 'Texas',
      total_parts_lent: 134,
      total_requests_fulfilled: 52,
      total_teams_helped: 14,
      avg_rating: 4.6,
      last_lend_date: '2024-01-08',
      gracious_points: 615,
      rank: 4
    },
    {
      id: '5',
      name: 'Bot Builders',
      city: 'Fort Worth',
      region: 'Texas',
      total_parts_lent: 112,
      total_requests_fulfilled: 43,
      total_teams_helped: 12,
      avg_rating: 4.5,
      last_lend_date: '2024-01-06',
      gracious_points: 520,
      rank: 5
    },
    {
      id: '6',
      name: 'Mech Warriors',
      city: 'El Paso',
      region: 'Texas',
      total_parts_lent: 89,
      total_requests_fulfilled: 34,
      total_teams_helped: 10,
      avg_rating: 4.4,
      last_lend_date: '2024-01-04',
      gracious_points: 410,
      rank: 6
    },
    {
      id: '7',
      name: 'Tech Titans',
      city: 'Arlington',
      region: 'Texas',
      total_parts_lent: 67,
      total_requests_fulfilled: 26,
      total_teams_helped: 8,
      avg_rating: 4.3,
      last_lend_date: '2024-01-02',
      gracious_points: 315,
      rank: 7
    },
    {
      id: '8',
      name: 'Robo Rebels',
      city: 'Plano',
      region: 'Texas',
      total_parts_lent: 45,
      total_requests_fulfilled: 18,
      total_teams_helped: 6,
      avg_rating: 4.2,
      last_lend_date: '2023-12-30',
      gracious_points: 235,
      rank: 8
    }
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod]);

  const loadLeaderboard = useCallback(async () => {
    try {
      // In a real implementation, this would query the database for
      // actual lending statistics based on fulfilled requests
      
      // Simulate loading time
      setTimeout(() => {
        setTeams(mockLeaderboard);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-5 w-5 text-blue-400" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 2:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 3:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const getGraciousPointsDisplay = (points: number) => {
    if (points >= 1000) return `${(points / 1000).toFixed(1)}k`;
    return points.toString();
  };

  if (isLoading) {
    return (
      <StarryBackground className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading leaderboard...</p>
          </div>
        </div>
      </StarryBackground>
    );
  }

  return (
    <StarryBackground className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6"
      starCount={25}>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full animate-float hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-500">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-100 bg-clip-text text-transparent mb-2">
            Gracious Professionalism Leaderboard
          </h1>
          <p className="text-blue-200 text-lg">
            Celebrating teams that share parts and help the FTC community thrive
          </p>
        </div>

        {/* Period Filter */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex justify-center">
              <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedPeriod('this-season')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === 'this-season'
                      ? 'bg-yellow-600 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  This Season
                </button>
                <button
                  onClick={() => setSelectedPeriod('this-month')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === 'this-month'
                      ? 'bg-yellow-600 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setSelectedPeriod('this-week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === 'this-week'
                      ? 'bg-yellow-600 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  This Week
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Teams */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {teams.slice(0, 3).map((team, index) => (
            <Card 
              key={team.id}
              className={`bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-yellow-400/30 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 ${
                index === 0 ? 'md:order-2 transform md:scale-105' : 
                index === 1 ? 'md:order-1' : 'md:order-3'
              }`}
            >
              <CardHeader className="text-center pb-3">
                <div className="flex justify-center mb-2">
                  {getRankIcon(team.rank)}
                </div>
                <CardTitle className="text-white text-xl">{team.name}</CardTitle>
                <div className="flex items-center justify-center gap-1 text-blue-300 text-sm">
                  <MapPin className="h-3 w-3" />
                  <span>{[team.city, team.region].filter(Boolean).join(', ')}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge className={`border ${getRankBadgeColor(team.rank)} text-lg px-3 py-1`}>
                    #{team.rank}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-blue-300">Parts Lent</p>
                    <p className="text-white font-bold text-lg">{team.total_parts_lent}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-300">Teams Helped</p>
                    <p className="text-white font-bold text-lg">{team.total_teams_helped}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-300">Rating</p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <p className="text-white font-bold">{team.avg_rating}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-300">GP Points</p>
                    <p className="text-white font-bold text-lg">{getGraciousPointsDisplay(team.gracious_points)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400" />
              Complete Leaderboard
            </CardTitle>
            <CardDescription className="text-blue-200">
              All teams ranked by their contributions to the FTC community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-white/10 hover:border-yellow-400/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge className={`border ${getRankBadgeColor(team.rank)} min-w-[3rem] justify-center`}>
                        #{team.rank}
                      </Badge>
                      {getRankIcon(team.rank)}
                    </div>
                    
                    <div>
                      <p className="text-white font-semibold">{team.name}</p>
                      <div className="flex items-center gap-4 text-sm text-blue-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{[team.city, team.region].filter(Boolean).join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>{team.total_parts_lent} parts lent</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{team.total_teams_helped} teams helped</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-blue-300">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{team.avg_rating}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-300">GP Points</p>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span className="text-white font-bold">{getGraciousPointsDisplay(team.gracious_points)}</span>
                      </div>
                    </div>
                    {team.last_lend_date && (
                      <div className="text-center">
                        <p className="text-blue-300">Last Lend</p>
                        <p className="text-white font-medium">
                          {new Date(team.last_lend_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gracious Professionalism Info */}
        <Card className="mt-8 bg-gradient-to-r from-yellow-500/10 to-yellow-400/10 backdrop-blur-xl border-yellow-500/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-yellow-300 text-xl flex items-center gap-2">
              <Heart className="h-6 w-6" />
              About Gracious Professionalism
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-200">
              Gracious Professionalism is a core value of FIRST programs. Teams earn Gracious Professionalism (GP) points by 
              lending parts, sharing knowledge, and helping other teams succeed. This leaderboard celebrates teams that embody 
              the spirit of &quot;coopertition&quot; - fierce competition combined with mutual respect and assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    </StarryBackground>
  );
}
