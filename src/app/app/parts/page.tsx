'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Part {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  manufacturer: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    manufacturer: '',
    tags: ''
  });
  
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    loadParts();
  }, []);

  useEffect(() => {
    filterParts();
  }, [searchQuery, parts]);

  const loadParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading parts:', error);
        toast({
          title: "Error",
          description: "Failed to load parts",
          variant: "destructive"
        });
      } else {
        setParts(data || []);
        setFilteredParts(data || []);
      }
    } catch (error) {
      console.error('Error loading parts:', error);
      toast({
        title: "Error",
        description: "Failed to load parts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterParts = () => {
    if (!searchQuery.trim()) {
      setFilteredParts(parts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = parts.filter(part =>
      part.name.toLowerCase().includes(query) ||
      (part.sku && part.sku.toLowerCase().includes(query)) ||
      (part.manufacturer && part.manufacturer.toLowerCase().includes(query)) ||
      (part.tags && part.tags.some(tag => tag.toLowerCase().includes(query)))
    );
    setFilteredParts(filtered);
  };

  const openDialog = (part?: Part) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        sku: part.sku || '',
        description: part.description || '',
        manufacturer: part.manufacturer || '',
        tags: part.tags ? part.tags.join(', ') : ''
      });
    } else {
      setEditingPart(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        manufacturer: '',
        tags: ''
      });
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingPart(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      manufacturer: '',
      tags: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (editingPart) {
        // Update existing part
        const { error } = await supabase
          .from('parts')
          .update({
            name: formData.name,
            sku: formData.sku || null,
            description: formData.description || null,
            manufacturer: formData.manufacturer || null,
            tags: tags.length > 0 ? tags : null
          })
          .eq('id', editingPart.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Part updated successfully"
        });
      } else {
        // Create new part
        const { error } = await supabase
          .from('parts')
          .insert({
            name: formData.name,
            sku: formData.sku || null,
            description: formData.description || null,
            manufacturer: formData.manufacturer || null,
            tags: tags.length > 0 ? tags : null
          });

        if (error) throw error;
        toast({
          title: "Success",
          description: "Part created successfully"
        });
      }

      closeDialog();
      loadParts();
    } catch (error) {
      console.error('Error saving part:', error);
      toast({
        title: "Error",
        description: "Failed to save part",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (partId: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;

    try {
      const { error } = await supabase
        .from('parts')
        .delete()
        .eq('id', partId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Part deleted successfully"
      });
      loadParts();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast({
        title: "Error",
        description: "Failed to delete part",
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
          <h1 className="text-3xl font-bold text-gray-900">Parts Catalog</h1>
          <p className="text-gray-600 mt-2">
            Manage your robotics parts catalog
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Part
        </Button>
      </div>

      

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search parts by name, SKU, manufacturer, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Parts List */}
      <div className="space-y-4">
        {filteredParts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No parts found' : 'No parts yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first part to the catalog'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => openDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Part
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredParts.map((part) => (
            <Card key={part.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {part.name}
                      </h3>
                      {part.sku && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {part.sku}
                        </span>
                      )}
                    </div>
                    
                    {part.description && (
                      <p className="text-gray-600 mb-3">{part.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {part.manufacturer && (
                        <span>Manufacturer: {part.manufacturer}</span>
                      )}
                      {part.tags && part.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span>Tags:</span>
                          <div className="flex gap-1">
                            {part.tags.map((tag, index) => (
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
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(part)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(part.id)}
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
                {editingPart ? 'Edit Part' : 'Add New Part'}
              </CardTitle>
              <CardDescription>
                {editingPart 
                  ? 'Update the part information'
                  : 'Add a new part to your catalog'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Stock Keeping Unit"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the part"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g., VEX Robotics, REV"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="motor, wheel, sensor (comma-separated)"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingPart ? 'Update Part' : 'Add Part'}
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
