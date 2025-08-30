'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Package, Search, Plus, Eye, Trash2, Edit, ExternalLink } from 'lucide-react';

interface Part {
  id: string;
  part_number: string;
  name: string;
  description: string;
  manufacturer: 'GoBILDA' | 'REV' | 'Other';
  cost: number;
  price?: number;
  current_stock: number;
  stock?: number;
  min_stock: number;
  category: string;
  location: string;
  lendable?: boolean;
  reserved?: number; // How many are reserved/not available for lending
  created_at: string;
  updated_at?: string;
}

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState('');
  const [showCustomPartModal, setShowCustomPartModal] = useState(false);
  const [customPart, setCustomPart] = useState({
    name: '',
    part_number: '',
    description: '',
    manufacturer: 'Other' as 'GoBILDA' | 'REV' | 'Other',
    category: 'Tools & Accessories',
    cost: 0,
    stock: 1,
    location: 'Main Storage'
  });

  const supabase = createClient();
  const router = useRouter();

  const categories = [
    'Motors & Actuators',
    'Wheels & Traction', 
    'Structural & Frame',
    'Electronics',
    'Fasteners',
    'Power & Battery',
    'Control Systems',
    'Tools & Accessories'
  ];

  const loadParts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load ONLY real data from localStorage - no fake/mock data
      const inventoryFromStorage = JSON.parse(localStorage.getItem('inventory') || '[]');
      
      // Apply filters to real inventory data only
      let filtered = inventoryFromStorage;

      if (selectedCategory !== 'all') {
        filtered = filtered.filter((part: any) => part.category === selectedCategory);
      }

      if (selectedManufacturer !== 'all') {
        filtered = filtered.filter((part: any) => part.manufacturer === selectedManufacturer);
      }

      if (selectedStockStatus !== 'all') {
        filtered = filtered.filter((part: any) => {
          const stockLevel = getStockStatus(part);
          return stockLevel === selectedStockStatus;
        });
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((part: any) =>
          part.part_number.toLowerCase().includes(query) ||
          part.name.toLowerCase().includes(query) ||
          part.description.toLowerCase().includes(query)
        );
      }

      // Only show real parts from localStorage
      setParts(filtered);
    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router, selectedCategory, selectedManufacturer, selectedStockStatus, searchQuery]);

  useEffect(() => {
    loadParts();
  }, [loadParts]);

  const getStockStatus = (part: any) => {
    const stock = part.stock || part.current_stock || 0;
    const minStock = part.min_stock || 1;
    
    if (stock === 0) return 'out-of-stock';
    if (stock <= minStock) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'low-stock':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'in-stock':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getManufacturerColor = (manufacturer: string) => {
    switch (manufacturer) {
      case 'GoBILDA':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'REV':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Other':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPartUnit = (part: Part) => {
    const category = part.category?.toLowerCase() || '';
    const name = part.name?.toLowerCase() || '';
    
    if (category.includes('motor') || name.includes('motor')) return 'motor';
    if (category.includes('servo') || name.includes('servo')) return 'servo';
    if (category.includes('wheel') || name.includes('wheel')) return 'wheel';
    if (category.includes('sensor') || name.includes('sensor')) return 'sensor';
    if (category.includes('battery') || name.includes('battery')) return 'battery';
    if (category.includes('gear') || name.includes('gear')) return 'gear';
    if (category.includes('shaft') || name.includes('shaft')) return 'shaft';
    if (category.includes('bearing') || name.includes('bearing')) return 'bearing';
    if (category.includes('screw') || name.includes('screw') || name.includes('bolt')) return 'screw';
    if (category.includes('hub') || name.includes('hub')) return 'hub';
    if (category.includes('bracket') || name.includes('bracket')) return 'bracket';
    
    return 'unit'; // fallback
  };

  const formatQuantityDisplay = (quantity: number, part: Part) => {
    const unit = getPartUnit(part);
    if (quantity === 1) return `1 ${unit}`;
    return `${quantity} ${unit}s`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'undefined' || dateString === 'null') {
      return 'Recently added';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Recently added';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleUpdateQuantity = (partId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleDeletePart(partId);
      return;
    }

    // Update quantity in localStorage (normalize data structure)
    const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const updatedInventory = currentInventory.map((part: any) => 
      part.id === partId ? { 
        ...part, 
        current_stock: newQuantity,
        stock: newQuantity, // Ensure both fields are updated
        updated_at: new Date().toISOString()
      } : part
    );
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    
    // Reload the parts
    loadParts();
  };

  const handleUpdateLocation = (partId: string, location: string) => {
    // Update location in localStorage
    const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const updatedInventory = currentInventory.map((part: any) => 
      part.id === partId ? { 
        ...part, 
        location: location,
        updated_at: new Date().toISOString()
      } : part
    );
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    
    // Reset editing state
    setEditingLocation(null);
    setNewLocation('');
    
    // Reload the parts
    loadParts();
  };

  const startEditingLocation = (partId: string, currentLocation: string) => {
    setEditingLocation(partId);
    setNewLocation(currentLocation || '');
  };

  const handleAddCustomPart = () => {
    if (!customPart.name || !customPart.part_number) {
      alert('Please fill in name and part number');
      return;
    }

    const inventoryItem = {
      id: `custom-${Date.now()}`,
      part_id: `custom-${Date.now()}`,
      part_number: customPart.part_number,
      name: customPart.name,
      description: customPart.description,
      manufacturer: customPart.manufacturer,
      category: customPart.category,
      cost: customPart.cost,
      price: customPart.cost,
      current_stock: customPart.stock,
      stock: customPart.stock,
      min_stock: 1,
      condition: 'new' as const,
      location: customPart.location,
      lendable: true,
      notes: 'Custom part',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Get existing inventory and add custom part
    const existingInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    existingInventory.push(inventoryItem);
    localStorage.setItem('inventory', JSON.stringify(existingInventory));

    // Add to activity log
    const activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    activities.unshift({
      id: `activity-${Date.now()}`,
      type: 'part_added',
      description: 'Custom part added to inventory',
      details: `${customPart.name} (${customPart.part_number}) - ${customPart.stock}x`,
      timestamp: new Date().toISOString(),
      itemCount: customPart.stock
    });
    localStorage.setItem('recentActivities', JSON.stringify(activities.slice(0, 10))); // Keep last 10

    // Reset form and close modal
    setCustomPart({
      name: '',
      part_number: '',
      description: '',
      manufacturer: 'Other',
      category: 'Tools & Accessories',
      cost: 0,
      stock: 1,
      location: 'Main Storage'
    });
    setShowCustomPartModal(false);
    
    // Reload parts
    loadParts();
  };

  const handleDeletePart = (partId: string) => {
    // Remove from localStorage
    const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    const updatedInventory = currentInventory.filter((part: any) => part.id !== partId);
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    
    // Reload the parts
    loadParts();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading inventory...</p>
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
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  Inventory Management
                </h1>
                <p className="text-blue-200 text-lg">
                  Manage your robotics parts and track stock levels
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCustomPartModal(true)}
              variant="outline"
              className="bg-slate-800/50 border-white/20 text-blue-200 hover:bg-slate-700/50 hover:text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Custom Part
            </Button>
            <Button
              onClick={() => router.push('/app/parts')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="h-5 w-5 mr-2" />
              Browse Library
            </Button>
          </div>
        </div>

        {/* Search Bar - Full Width */}
        <Card className="mb-6 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
              <Input
                placeholder="Search parts by name, SKU, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-slate-800/90 border-2 border-white/30 text-white placeholder-blue-300/80 focus:bg-slate-700/90 focus:border-blue-400 backdrop-blur-sm rounded-xl shadow-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <Label className="text-blue-200 text-sm mb-2 block">Category</Label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none focus:bg-slate-700/80 backdrop-blur-sm"
                >
                  <option value="all" className="bg-slate-800 text-white">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800 text-white">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manufacturer Filter */}
              <div>
                <Label className="text-blue-200 text-sm mb-2 block">Manufacturer</Label>
                <select
                  value={selectedManufacturer}
                  onChange={(e) => setSelectedManufacturer(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none focus:bg-slate-700/80 backdrop-blur-sm"
                >
                  <option value="all" className="bg-slate-800 text-white">All Manufacturers</option>
                  <option value="GoBILDA" className="bg-slate-800 text-white">GoBILDA</option>
                  <option value="REV" className="bg-slate-800 text-white">REV</option>
                  <option value="Other" className="bg-slate-800 text-white">Other</option>
                </select>
              </div>

              {/* Stock Status Filter */}
              <div>
                <Label className="text-blue-200 text-sm mb-2 block">Stock Status</Label>
                <select
                  value={selectedStockStatus}
                  onChange={(e) => setSelectedStockStatus(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none focus:bg-slate-700/80 backdrop-blur-sm"
                >
                  <option value="all" className="bg-slate-800 text-white">All Status</option>
                  <option value="in-stock" className="bg-slate-800 text-white">In Stock</option>
                  <option value="low-stock" className="bg-slate-800 text-white">Low Stock</option>
                  <option value="out-of-stock" className="bg-slate-800 text-white">Out of Stock</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FTC-Relevant Inventory Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm">Total Units</p>
                  <p className="text-white text-2xl font-bold">
                    {parts.reduce((sum, part) => sum + (part.stock || part.current_stock || 0), 0)}
                  </p>
                  <p className="text-blue-400 text-xs">{parts.length} unique parts</p>
                </div>
                <Package className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm">Inventory Value</p>
                  <p className="text-white text-2xl font-bold">
                    ${parts.reduce((sum, part) => sum + ((part.stock || part.current_stock || 0) * (part.price || part.cost || 0)), 0).toLocaleString()}
                  </p>
                  <p className="text-green-400 text-xs">Total investment</p>
                </div>
                <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm">Low Stock Items</p>
                  <p className="text-white text-2xl font-bold">
                    {parts.filter(p => getStockStatus(p) === 'low-stock' || getStockStatus(p) === 'out-of-stock').length}
                  </p>
                  <p className="text-purple-400 text-xs">Need restocking</p>
                </div>
                <div className="h-8 w-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm">Recent Additions</p>
                  <p className="text-white text-2xl font-bold">
                    {parts.filter(p => {
                      const addedDate = new Date(p.created_at || p.updated_at || '');
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return addedDate > weekAgo;
                    }).length}
                  </p>
                  <p className="text-yellow-400 text-xs">Added this week</p>
                </div>
                <div className="h-8 w-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parts List */}
        {parts.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-blue-400/50 mx-auto mb-4" />
              <p className="text-blue-200 text-lg mb-2">No parts in inventory</p>
              <p className="text-blue-300 text-sm mb-6">
                Start by adding parts from the Parts Library
              </p>
              <Button
                onClick={() => router.push('/app/parts')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Browse Parts Library
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parts.map((part) => (
              <Card 
                key={part.id} 
                className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors line-clamp-2 pr-2">
                        {part.name}
                      </CardTitle>
                      <p className="text-blue-300 text-sm font-mono">{part.part_number}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(part.id, (part.stock || part.current_stock || 0) - 1)}
                        className="bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400 w-8 h-8 p-0"
                      >
                        -
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateQuantity(part.id, (part.stock || part.current_stock || 0) + 1)}
                        className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-400 w-8 h-8 p-0"
                      >
                        +
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePart(part.id)}
                        className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400 w-8 h-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-blue-200 text-sm line-clamp-2">{part.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`border ${getManufacturerColor(part.manufacturer)}`}>
                      {part.manufacturer}
                    </Badge>
                    <Badge className={`border ${getStockStatusColor(getStockStatus(part))}`}>
                      {getStockStatus(part).replace('-', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-300">Total Stock</p>
                      <p className="text-white font-medium">{formatQuantityDisplay(part.stock || part.current_stock || 0, part)}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Available for Lending</p>
                      <p className="text-white font-medium">
                        {part.lendable ? formatQuantityDisplay(Math.max(0, (part.stock || part.current_stock || 0) - (part.reserved || 0)), part) : 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-300">Location</p>
                      {editingLocation === part.id ? (
                        <div className="flex gap-1">
                          <Input
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateLocation(part.id, newLocation);
                              if (e.key === 'Escape') setEditingLocation(null);
                            }}
                            className="h-6 text-xs bg-slate-800 border-slate-600 text-white"
                            placeholder="Location..."
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateLocation(part.id, newLocation)}
                            className="h-6 w-6 p-0 bg-green-500/20 hover:bg-green-500/30"
                          >
                            ✓
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="text-white font-medium cursor-pointer hover:text-blue-300 transition-colors flex items-center gap-1"
                          onClick={() => startEditingLocation(part.id, part.location || 'Main Storage')}
                        >
                          {part.location || 'Main Storage'}
                          <Edit className="h-3 w-3 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-blue-300">Value</p>
                      <p className="text-white font-medium">{formatCurrency((part.price || part.cost || 0) * (part.stock || part.current_stock || 0))}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Added</p>
                      <p className="text-white font-medium">{formatDate(part.created_at || part.updated_at || '')}</p>
                    </div>
                  </div>

                  {/* Purchase Link */}
                  {(part.manufacturer === 'GoBILDA' || part.manufacturer === 'REV') && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const baseUrl = part.manufacturer === 'GoBILDA' 
                            ? 'https://www.gobilda.com/search/?q=' 
                            : 'https://www.revrobotics.com/search/?q=';
                          window.open(baseUrl + encodeURIComponent(part.part_number || part.name), '_blank');
                        }}
                        className="w-full bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Buy from {part.manufacturer}
                      </Button>
                    </div>
                  )}

                  {/* Lendable Status */}
                  {(part.lendable !== false) && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-400 text-xs">Available for lending</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Custom Part Modal */}
      <Dialog open={showCustomPartModal} onOpenChange={setShowCustomPartModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-blue-300">Add Custom Part</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-200">Part Name *</Label>
                <Input
                  value={customPart.name}
                  onChange={(e) => setCustomPart({...customPart, name: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="e.g., Custom Bracket"
                />
              </div>
              <div>
                <Label className="text-blue-200">Part Number *</Label>
                <Input
                  value={customPart.part_number}
                  onChange={(e) => setCustomPart({...customPart, part_number: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="e.g., CUST-001"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-blue-200">Description</Label>
              <Input
                value={customPart.description}
                onChange={(e) => setCustomPart({...customPart, description: e.target.value})}
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Brief description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-200">Manufacturer</Label>
                <select
                  value={customPart.manufacturer}
                  onChange={(e) => setCustomPart({...customPart, manufacturer: e.target.value as 'GoBILDA' | 'REV' | 'Other'})}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  <option value="Other">Other</option>
                  <option value="GoBILDA">GoBILDA</option>
                  <option value="REV">REV</option>
                </select>
              </div>
              <div>
                <Label className="text-blue-200">Category</Label>
                <select
                  value={customPart.category}
                  onChange={(e) => setCustomPart({...customPart, category: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-600 text-white rounded-md px-3 py-2"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-blue-200">Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={customPart.cost}
                  onChange={(e) => setCustomPart({...customPart, cost: parseFloat(e.target.value) || 0})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-blue-200">Quantity</Label>
                <Input
                  type="number"
                  value={customPart.stock}
                  onChange={(e) => setCustomPart({...customPart, stock: parseInt(e.target.value) || 1})}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-blue-200">Location</Label>
                <Input
                  value={customPart.location}
                  onChange={(e) => setCustomPart({...customPart, location: e.target.value})}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Main Storage"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowCustomPartModal(false)}
                variant="outline"
                className="flex-1 bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomPart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Part
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}