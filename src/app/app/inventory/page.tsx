'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, Edit, Trash2, Boxes, MapPin, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  team_id: string;
  part_id: string;
  quantity: number;
  condition: 'new' | 'used' | 'broken';
  location_id: string | null;
  lendable: boolean;
  notes: string | null;
  updated_at: string;
  part: {
    name: string;
    sku: string | null;
    manufacturer: string | null;
  };
  location: {
    name: string;
  } | null;
}

interface Part {
  id: string;
  name: string;
  sku: string | null;
  manufacturer: string | null;
}

interface Location {
  id: string;
  name: string;
  address: string | null;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    part_id: '',
    quantity: 1,
    condition: 'used' as 'new' | 'used' | 'broken',
    location_id: '',
    lendable: true,
    notes: ''
  });
  
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [searchQuery, inventory]);

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

      // Load inventory items for the team
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select(`
          *,
          part:parts(name, sku, manufacturer),
          location:locations(name)
        `)
        .eq('team_id', profile.team_id)
        .order('updated_at', { ascending: false });

      if (inventoryError) throw inventoryError;

      // Load parts for the dropdown
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('id, name, sku, manufacturer')
        .order('name');

      if (partsError) throw partsError;

      // Load locations for the dropdown
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('id, name, address')
        .eq('team_id', profile.team_id)
        .order('name');

      if (locationsError) throw locationsError;

      setInventory(inventoryData || []);
      setParts(partsData || []);
      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  const filterInventory = () => {
    if (!searchQuery.trim()) {
      setFilteredInventory(inventory);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = inventory.filter(item =>
      item.part.name.toLowerCase().includes(query) ||
      (item.part.sku && item.part.sku.toLowerCase().includes(query)) ||
      (item.part.manufacturer && item.part.manufacturer.toLowerCase().includes(query)) ||
      (item.notes && item.notes.toLowerCase().includes(query))
    );
    setFilteredInventory(filtered);
  };

  const openDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        part_id: item.part_id,
        quantity: item.quantity,
        condition: item.condition,
        location_id: item.location_id || '',
        lendable: item.lendable,
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        part_id: '',
        quantity: 1,
        condition: 'used',
        location_id: '',
        lendable: true,
        notes: ''
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      part_id: '',
      quantity: 1,
      condition: 'used',
      location_id: '',
      lendable: true,
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      if (!profile?.team_id) return;

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('inventory_items')
          .update({
            part_id: formData.part_id,
            quantity: formData.quantity,
            condition: formData.condition,
            location_id: formData.location_id || null,
            lendable: formData.lendable,
            notes: formData.notes || null
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Inventory item updated successfully"
        });
      } else {
        // Create new item
        const { error } = await supabase
          .from('inventory_items')
          .insert({
            team_id: profile.team_id,
            part_id: formData.part_id,
            quantity: formData.quantity,
            condition: formData.condition,
            location_id: formData.location_id || null,
            lendable: formData.lendable,
            notes: formData.notes || null
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Inventory item created successfully"
        });
      }

      closeDialog();
      loadData();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to save inventory item",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Inventory item deleted successfully"
      });
      loadData();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive"
      });
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-yellow-100 text-yellow-800';
      case 'broken': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Inventory</h1>
          <p className="text-gray-600 mt-2">
            Manage your team's inventory items
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Demo Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Demo Mode:</strong> This is a UI test. All data shown is mock data for demonstration purposes. You can add, edit, and delete inventory items to test the interface.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search inventory by part name, SKU, manufacturer, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Boxes className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No inventory items found' : 'No inventory yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first inventory item'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredInventory.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.part.name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                      {item.lendable && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Lendable
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        Qty: {item.quantity}
                      </span>
                      {item.part.sku && (
                        <span>SKU: {item.part.sku}</span>
                      )}
                      {item.part.manufacturer && (
                        <span>Manufacturer: {item.part.manufacturer}</span>
                      )}
                    </div>
                    
                    {item.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4" />
                        Location: {item.location.name}
                      </div>
                    )}
                    
                    {item.notes && (
                      <p className="text-gray-600 text-sm">{item.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </CardTitle>
              <CardDescription>
                {editingItem 
                  ? 'Update the inventory item information'
                  : 'Add a new item to your team inventory'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="part_id">Part *</Label>
                  <select
                    id="part_id"
                    value={formData.part_id}
                    onChange={(e) => setFormData({ ...formData, part_id: e.target.value })}
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
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as 'new' | 'used' | 'broken' })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="broken">Broken</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location_id">Location</Label>
                  <select
                    id="location_id"
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">No location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="lendable"
                    checked={formData.lendable}
                    onChange={(e) => setFormData({ ...formData, lendable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="lendable">Available for lending</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes about this item"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={closeDialog}
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
