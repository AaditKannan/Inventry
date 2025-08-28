'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { 
  MapPin, 
  Package, 
  Building2, 
  Search,
  Plus,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface Team {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  lat: number | null;
  lng: number | null;
  visibility: 'public' | 'private';
}

interface InventorySummary {
  team_id: string;
  total_items: number;
  lendable_items: number;
  common_tags: string[];
}

interface Part {
  id: string;
  name: string;
  sku: string | null;
  manufacturer: string | null;
}

export default function MapPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [inventorySummaries, setInventorySummaries] = useState<InventorySummary[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    part_id: '',
    quantity: 1,
    needed_by: '',
    message: ''
  });
  
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      // Load public teams with coordinates
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('visibility', 'public')
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .order('name');

      if (teamsError) throw teamsError;

      // Load parts for the request form
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('id, name, sku, manufacturer')
        .order('name');

      if (partsError) throw partsError;

      // Load inventory summaries for public teams
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select(`
          team_id,
          quantity,
          lendable,
          part:parts(tags)
        `)
        .in('team_id', teamsData?.map(t => t.id) || []);

      if (inventoryError) throw inventoryError;

      // Process inventory data to create summaries
      const summaries: InventorySummary[] = [];
      const teamInventoryMap = new Map<string, any[]>();

      inventoryData?.forEach(item => {
        if (!teamInventoryMap.has(item.team_id)) {
          teamInventoryMap.set(item.team_id, []);
        }
        teamInventoryMap.get(item.team_id)!.push(item);
      });

      teamInventoryMap.forEach((items, teamId) => {
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const lendableItems = items
          .filter(item => item.lendable)
          .reduce((sum, item) => sum + item.quantity, 0);
        
        const allTags = items
          .flatMap(item => item.part?.tags || [])
          .filter(Boolean);
        
        const tagCounts = allTags.reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const commonTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([tag]) => tag);

        summaries.push({
          team_id: teamId,
          total_items: totalItems,
          lendable_items: lendableItems,
          common_tags: commonTags
        });
      });

      setTeams(teamsData || []);
      setParts(partsData || []);
      setInventorySummaries(summaries);
    } catch (error) {
      console.error('Error loading map data:', error);
      toast({
        title: "Error",
        description: "Failed to load map data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.city && team.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (team.region && team.region.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInventorySummary = (teamId: string) => {
    return inventorySummaries.find(summary => summary.team_id === teamId);
  };

  const openRequestDialog = (team: Team) => {
    setSelectedTeam(team);
    setRequestFormData({
      part_id: '',
      quantity: 1,
      needed_by: '',
      message: ''
    });
    setIsRequestDialogOpen(true);
  };

  const closeRequestDialog = () => {
    setIsRequestDialogOpen(false);
    setSelectedTeam(null);
    setRequestFormData({
      part_id: '',
      quantity: 1,
      needed_by: '',
      message: ''
    });
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeam) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      if (!profile?.team_id) return;

      // Create new request
      const { error } = await supabase
        .from('requests')
        .insert({
          requester_team_id: profile.team_id,
          owner_team_id: selectedTeam.id,
          part_id: requestFormData.part_id,
          quantity: requestFormData.quantity,
          needed_by: requestFormData.needed_by || null,
          message: requestFormData.message || null
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Request created successfully"
      });

      closeRequestDialog();
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: "Failed to create request",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Map</h1>
        <p className="text-gray-600 mt-2">
          Discover public robotics teams and their available inventory
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search teams by name, city, or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map Coming Soon</h3>
                <p className="text-gray-500 mb-4">
                  MapLibre GL integration will show team locations with markers
                </p>
                <div className="text-sm text-gray-400">
                  {teams.length} public teams with coordinates found
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Public Teams ({filteredTeams.length})
        </h2>
        
        {filteredTeams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No teams found' : 'No public teams available'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Teams need to set their location coordinates to appear on the map'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const inventory = getInventorySummary(team.id);
              return (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {team.name}
                    </CardTitle>
                    <CardDescription>
                      {team.city && team.region 
                        ? `${team.city}, ${team.region}`
                        : 'Location not specified'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Inventory Summary */}
                    {inventory ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Total Items:</span>
                          <span className="font-medium">{inventory.total_items}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Available for Lending:</span>
                          <span className="font-medium text-green-600">{inventory.lendable_items}</span>
                        </div>
                        {inventory.common_tags.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Common Parts:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {inventory.common_tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No inventory data available
                      </div>
                    )}

                    {/* Coordinates */}
                    {team.lat && team.lng && (
                      <div className="text-xs text-gray-400">
                        📍 {team.lat.toFixed(4)}, {team.lng.toFixed(4)}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2">
                      <Button
                        onClick={() => openRequestDialog(team)}
                        className="w-full"
                        disabled={!inventory || inventory.lendable_items === 0}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Parts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Request Dialog */}
      {isRequestDialogOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Request from {selectedTeam.name}</CardTitle>
              <CardDescription>
                Request parts from this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="part_id">Part *</Label>
                  <select
                    id="part_id"
                    value={requestFormData.part_id}
                    onChange={(e) => setRequestFormData({ ...requestFormData, part_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a part</option>
                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.name} {part.sku && `(${part.sku})`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={requestFormData.quantity}
                    onChange={(e) => setRequestFormData({ ...requestFormData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="needed_by">Needed By</Label>
                  <Input
                    id="needed_by"
                    type="date"
                    value={requestFormData.needed_by}
                    onChange={(e) => setRequestFormData({ ...requestFormData, needed_by: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    value={requestFormData.message}
                    onChange={(e) => setRequestFormData({ ...requestFormData, message: e.target.value })}
                    placeholder="Explain why you need this part..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Send Request
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={closeRequestDialog}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
