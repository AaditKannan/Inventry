'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { 
  MapPin, 
  Package, 
  Building2, 
  Search,
  Plus,
  MessageSquare,
  Globe,
  Users,
  MapIcon
} from 'lucide-react';
import StarryBackground from '@/components/ui/starry-background';

interface Team {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  visibility: 'public' | 'private';
}

export default function MapPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const supabase = createClient();

  // Mock teams data for now
  const mockTeams: Team[] = [
    {
      id: '1',
      name: 'Robo Hawks',
      city: 'Austin',
      region: 'Texas',
      lat: 30.2672,
      lng: -97.7431,
      visibility: 'public'
    },
    {
      id: '2',
      name: 'Steel Eagles',
      city: 'Houston',
      region: 'Texas',
      lat: 29.7604,
      lng: -95.3698,
      visibility: 'public'
    },
    {
      id: '3',
      name: 'Circuit Breakers',
      city: 'Dallas',
      region: 'Texas',
      lat: 32.7767,
      lng: -96.7970,
      visibility: 'public'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTeams(mockTeams);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <StarryBackground className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading map...</p>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-float hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-500">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  Team Map
                </h1>
                <p className="text-blue-200 text-lg">
                  Discover robotics teams and their inventory worldwide
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <Input
                placeholder="Search teams by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-slate-800/90 border-2 border-white/30 text-white placeholder-blue-300/80 focus:bg-slate-700/90 focus:border-blue-400 backdrop-blur-sm rounded-xl shadow-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="bg-slate-800/50 rounded-xl p-12 text-center border-2 border-dashed border-blue-500/30">
              <MapIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Map Coming Soon</h3>
              <p className="text-blue-200">
                Map view will show team locations with inventory data and request capabilities
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card 
              key={team.id}
              className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group cursor-pointer"
              onClick={() => setSelectedTeam(team)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                      {team.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-blue-300 text-sm mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{[team.city, team.region].filter(Boolean).join(', ')}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Public
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-blue-300">Inventory</p>
                      <p className="text-white font-medium">15 parts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-blue-300">Members</p>
                      <p className="text-white font-medium">8 active</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-white/10">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    View Inventory
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-400"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Request Parts
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTeams.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="text-center py-12">
              <Building2 className="h-16 w-16 text-blue-400/50 mx-auto mb-4" />
              <p className="text-blue-200 text-lg mb-2">No teams found</p>
              <p className="text-blue-300 text-sm">
                Try adjusting your search to find robotics teams in your area
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </StarryBackground>
  );
}