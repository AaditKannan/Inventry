'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Package, Search, Plus, Filter, Edit, Trash2, Eye, PlusCircle, MinusCircle, Settings } from 'lucide-react';

interface Part {
  id: string;
  part_number: string;
  name: string;
  description: string;
  manufacturer: 'GoBILDA' | 'REV' | 'Other';
  cost: number;
  current_stock: number;
  min_stock: number;
  category: string;
  location: string;
  created_at: string;
}

interface PartCategory {
  id: string;
  name: string;
  description: string;
}

interface PartSpecification {
  size: string;
  specifications: string;
  available: boolean;
}

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPart, setShowAddPart] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [showPartDetails, setShowPartDetails] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const supabase = createClient();
  const router = useRouter();

  const loadParts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', user.id)
        .single();

      if (!profile?.team_id) {
        throw new Error('No team found');
      }

      // For now, use mock data since we haven't applied the schema yet
      // This will be replaced with real database queries once schema is applied
      const mockPartsData = [
        {
          id: '1',
          part_number: 'GB-001',
          name: 'GoBILDA Yellow Jacket Motor',
          description: 'High-performance planetary gear motor for FTC robots',
          manufacturer: 'GoBILDA' as const,
          cost: 89.99,
          current_stock: 5,
          min_stock: 2,
          category: 'Motors & Actuators',
          location: 'Main Lab',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          part_number: 'REV-001',
          name: 'REV HD Hex Motor',
          description: 'High-durability hex motor for competition use',
          manufacturer: 'REV' as const,
          cost: 99.99,
          current_stock: 3,
          min_stock: 1,
          category: 'Motors & Actuators',
          location: 'Main Lab',
          created_at: new Date().toISOString()
        }
      ];

      // Apply filters to mock data
      let filtered = mockPartsData;

      if (selectedCategory !== 'all') {
        filtered = filtered.filter(part => part.category === selectedCategory);
      }

      if (selectedManufacturer !== 'all') {
        filtered = filtered.filter(part => part.manufacturer === selectedManufacturer);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(part =>
          part.part_number.toLowerCase().includes(query) ||
          part.name.toLowerCase().includes(query) ||
          part.description.toLowerCase().includes(query)
        );
      }

      setParts(filtered);
    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router, searchQuery, selectedCategory, selectedManufacturer]);

  const loadCategories = useCallback(async () => {
    try {
      // For now, use mock categories since we haven't applied the schema yet
      const mockCategories = [
        { id: '1', name: 'Motors & Actuators', description: 'Electric motors and actuators' },
        { id: '2', name: 'Wheels & Traction', description: 'Wheels and traction systems' },
        { id: '3', name: 'Structural & Frame', description: 'Beams, brackets, and frame components' },
        { id: '4', name: 'Electronics', description: 'Controllers, sensors, and electrical components' },
        { id: '5', name: 'Fasteners', description: 'Screws, nuts, bolts, and mounting hardware' },
        { id: '6', name: 'Power & Battery', description: 'Batteries, power distribution, and charging' },
        { id: '7', name: 'Control Systems', description: 'Joysticks, gamepads, and control interfaces' },
        { id: '8', name: 'Tools & Accessories', description: 'Tools, cables, and miscellaneous accessories' }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [supabase]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadParts();
  }, [loadParts]);

  const getStockStatus = (current: number, min: number) => {
    if (current <= 0) return 'out-of-stock';
    if (current <= min) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'low-stock':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'in-stock':
        return 'text-green-500 bg-green-50 border-green-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getManufacturerColor = (manufacturer: string) => {
    switch (manufacturer) {
      case 'GoBILDA':
        return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'REV':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'Other':
        return 'text-gray-500 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openPartDetails = (part: Part) => {
    setSelectedPart(part);
    setShowPartDetails(true);
    setSelectedSize('');
    setSelectedQuantity(1);
  };

  const closePartDetails = () => {
    setShowPartDetails(false);
    setSelectedPart(null);
    setSelectedSize('');
    setSelectedQuantity(1);
  };

  const handleAddToInventory = () => {
    if (selectedPart && selectedSize && selectedQuantity > 0) {
      // Here you would add the part to inventory with selected size and quantity
      console.log(`Adding ${selectedQuantity}x ${selectedPart.name} (${selectedSize}) to inventory`);
      closePartDetails();
    }
  };

  // Mock part specifications - in real app this would come from database
  const getPartSpecifications = (part: Part): PartSpecification[] => {
    if (part.manufacturer === 'GoBILDA') {
      return [
        { size: '5201 Series', specifications: '26.9:1 gear ratio, Ultra-high torque', available: true },
        { size: '5202 Series', specifications: '19.2:1 gear ratio, Compact design', available: true },
        { size: '5203 Series', specifications: '5.2:1 gear ratio, High performance', available: true }
      ];
    } else if (part.manufacturer === 'REV') {
      return [
        { size: 'HD Hex Motor', specifications: '40:1 gear ratio, High durability', available: true },
        { size: 'Core Hex Motor', specifications: '20:1 gear ratio, General purpose', available: true },
        { size: 'UltraPlanetary', specifications: '3.7:1 to 125:1 configurable', available: true }
      ];
    }
    return [
      { size: 'Standard', specifications: 'General purpose specifications', available: true }
    ];
  };

  const filteredParts = parts.filter(part => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        part.part_number.toLowerCase().includes(query) ||
        part.name.toLowerCase().includes(query) ||
        part.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading inventory...</p>
                   </div>

        {/* Part Details Modal */}
        {showPartDetails && selectedPart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl">{selectedPart.name}</CardTitle>
                    <p className="text-blue-300 text-sm font-mono">{selectedPart.part_number}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closePartDetails}
                    className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-blue-200">{selectedPart.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-300 text-sm">Manufacturer</p>
                    <p className="text-white font-medium">{selectedPart.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Category</p>
                    <p className="text-white font-medium">{selectedPart.category}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Price</p>
                    <p className="text-white font-medium text-lg">{formatCurrency(selectedPart.cost || 0)}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Current Stock</p>
                    <p className="text-white font-medium">{selectedPart.current_stock}</p>
                  </div>
                </div>

                {/* Size Selection */}
                <div>
                  <Label className="text-blue-200 text-sm mb-2 block">Select Size/Specification</Label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none focus:bg-slate-700/80 backdrop-blur-sm"
                  >
                    <option value="" className="bg-slate-800 text-white">Choose a size...</option>
                    {getPartSpecifications(selectedPart).map((spec, index) => (
                      <option key={index} value={spec.size} className="bg-slate-800 text-white">
                        {spec.size} - {spec.specifications}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Selection */}
                <div>
                  <Label className="text-blue-200 text-sm mb-2 block">Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                      className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center bg-slate-800/80 border border-white/20 text-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                      className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex-1"
                    onClick={handleAddToInventory}
                    disabled={!selectedSize || selectedQuantity < 1}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Inventory
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
                    onClick={closePartDetails}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mb-2">
              Inventory Management
            </h1>
            <p className="text-blue-200 text-lg">
              Manage your robotics parts and track stock levels
            </p>
          </div>
          <Button
            onClick={() => setShowAddPart(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Part
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
                <Input
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-blue-300/50 focus:bg-white/20 focus:border-blue-400"
                />
              </div>

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
                     <option key={category.id} value={category.name} className="bg-slate-800 text-white">
                       {category.name}
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

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => {
            const stockStatus = getStockStatus(part.current_stock, part.min_stock);
            return (
                             <Card
                 key={part.id}
                 className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group cursor-pointer"
                 onClick={() => openPartDetails(part)}
               >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors">
                        {part.name}
                      </CardTitle>
                      <p className="text-blue-300 text-sm font-mono">{part.part_number}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-blue-200 text-sm line-clamp-2">{part.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getManufacturerColor(part.manufacturer)}`}>
                      {part.manufacturer}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStockStatusColor(stockStatus)}`}>
                      {stockStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-300">Cost</p>
                      <p className="text-white font-medium">{formatCurrency(part.cost || 0)}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Stock</p>
                      <p className="text-white font-medium">{part.current_stock}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-400"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-blue-300 text-xs">{formatDate(part.created_at)}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredParts.length === 0 && !isLoading && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-blue-400/50 mx-auto mb-4" />
              <p className="text-blue-200 text-lg mb-2">No parts found</p>
              <p className="text-blue-300 text-sm mb-4">
                {searchQuery || selectedCategory !== 'all' || selectedManufacturer !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first part to get started'
                }
              </p>
              {!searchQuery && selectedCategory === 'all' && selectedManufacturer === 'all' && (
                <Button
                  onClick={() => setShowAddPart(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Part
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{parts.length}</p>
              <p className="text-blue-200 text-sm">Total Parts</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="h-8 w-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {parts.filter(p => p.current_stock > p.min_stock).length}
              </p>
              <p className="text-blue-200 text-sm">In Stock</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="h-8 w-8 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-5 w-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {parts.filter(p => p.current_stock > 0 && p.current_stock <= p.min_stock).length}
              </p>
              <p className="text-blue-200 text-sm">Low Stock</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6 text-center">
              <div className="h-8 w-8 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="h-5 w-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {parts.filter(p => p.current_stock === 0).length}
              </p>
              <p className="text-blue-200 text-sm">Out of Stock</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
