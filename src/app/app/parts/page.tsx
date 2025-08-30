'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Database, Search, Filter, Package, ExternalLink, Plus, Eye, ShoppingCart } from 'lucide-react';

interface PartVariant {
  sku: string;
  rpm?: string;
  torque?: string;
  price: number;
  shaft_length?: string;
  shaft_type?: string;
  gear_ratio?: string;
}

interface BasePart {
  id: string;
  name: string;
  description: string;
  manufacturer: 'GoBILDA' | 'REV' | 'Other';
  category: string;
  series: string;
  datasheet_url?: string;
  image_url?: string;
  variants: PartVariant[];
  specification_options: {
    shaft_lengths?: string[];
    rpms?: string[];
    gear_ratios?: string[];
    shaft_types?: string[];
  };
}

// COMPREHENSIVE PARTS LIBRARY - Import from data file
import completePartsLibrary from '@/data/parts-library';

const partsLibrary: BasePart[] = completePartsLibrary;

export default function PartsPage() {
  const [parts, setParts] = useState<BasePart[]>(partsLibrary);
  const [filteredParts, setFilteredParts] = useState<BasePart[]>(partsLibrary);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [selectedPart, setSelectedPart] = useState<BasePart | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<PartVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const router = useRouter();

  // Get unique categories and manufacturers
  const categories = ['all', ...Array.from(new Set(parts.map(part => part.category)))];
  const manufacturers = ['all', ...Array.from(new Set(parts.map(part => part.manufacturer)))];

  // Filter parts based on search and filters
  useEffect(() => {
    let filtered = parts;

    if (searchTerm) {
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.series.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.variants.some(variant => 
          variant.sku.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(part => part.category === selectedCategory);
    }

    if (selectedManufacturer !== 'all') {
      filtered = filtered.filter(part => part.manufacturer === selectedManufacturer);
    }

    setFilteredParts(filtered);
  }, [searchTerm, selectedCategory, selectedManufacturer, parts]);

  const openPartDetails = (part: BasePart) => {
    setSelectedPart(part);
    setSelectedVariant(part.variants[0]); // Default to first variant
    setQuantity(1);
  };

  const closePartDetails = () => {
    setSelectedPart(null);
    setSelectedVariant(null);
  };

  const handleSpecificationChange = (specType: string, value: string) => {
    if (!selectedPart) return;

    let matchingVariant: PartVariant | null = null;

    if (specType === 'rpm') {
      matchingVariant = selectedPart.variants.find(v => v.rpm === value) || null;
    } else if (specType === 'gear_ratio') {
      matchingVariant = selectedPart.variants.find(v => v.gear_ratio === value) || null;
    } else if (specType === 'shaft_length') {
      matchingVariant = selectedPart.variants.find(v => v.shaft_length === value) || null;
    }

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  const handleAddToInventory = () => {
    if (!selectedPart || !selectedVariant) return;

    const inventoryItem = {
      id: `inv-${Date.now()}`,
      part_id: selectedPart.id,
      part_number: selectedVariant.sku,
      name: selectedPart.name,
      description: selectedPart.description,
      manufacturer: selectedPart.manufacturer,
      category: selectedPart.category,
      cost: selectedVariant.price,
      price: selectedVariant.price,
      current_stock: quantity,
      stock: quantity,
      min_stock: 1,
      condition: 'new' as const,
      location: 'Main Storage',
      lendable: true,
      notes: `${selectedVariant.rpm || ''} | ${selectedVariant.torque || ''} | ${selectedVariant.shaft_type || 'Standard'} ${selectedVariant.shaft_length || ''}`.replace(/^\s*\|\s*|\s*\|\s*$/g, ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      added_at: new Date().toISOString(),
      specs: {
        rpm: selectedVariant.rpm,
        torque: selectedVariant.torque,
        shaft_type: selectedVariant.shaft_type,
        shaft_length: selectedVariant.shaft_length,
        gear_ratio: selectedVariant.gear_ratio
      }
    };

    // Get existing inventory from localStorage
    const existingInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    
    // Check if part already exists
    const existingItemIndex = existingInventory.findIndex((item: any) => 
      item.part_number === selectedVariant!.sku
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item (normalize both fields)
      existingInventory[existingItemIndex].current_stock = (existingInventory[existingItemIndex].current_stock || existingInventory[existingItemIndex].stock || 0) + quantity;
      existingInventory[existingItemIndex].stock = existingInventory[existingItemIndex].current_stock;
      existingInventory[existingItemIndex].updated_at = new Date().toISOString();
    } else {
      // Add new item
      existingInventory.push(inventoryItem);
    }

    // Save back to localStorage
    localStorage.setItem('inventory', JSON.stringify(existingInventory));

    // Add to activity log
    const activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    activities.unshift({
      id: `activity-${Date.now()}`,
      type: 'part_added',
      description: 'Part added to inventory',
      details: `${selectedPart.name} (${selectedVariant.sku}) - ${quantity}x`,
      timestamp: new Date().toISOString(),
      itemCount: quantity
    });
    localStorage.setItem('recentActivities', JSON.stringify(activities.slice(0, 10))); // Keep last 10

    // Close modal and show success
    closePartDetails();
    
    alert(`Added ${quantity}x ${selectedPart.name} (${selectedVariant.sku}) to inventory!`);
  };

  const getVariantDisplay = (variant: PartVariant): string => {
    const parts = [];
    if (variant.rpm !== 'N/A' && variant.rpm !== 'Variable') parts.push(variant.rpm);
    if (variant.torque !== 'N/A' && variant.torque !== 'Variable') parts.push(variant.torque);
    if (variant.gear_ratio) parts.push(`Ratio: ${variant.gear_ratio}`);
    if (variant.shaft_length) parts.push(`Length: ${variant.shaft_length}`);
    return parts.join(' • ');
  };

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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full animate-float hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-500">
              <Database className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mb-2">
            Parts Library
          </h1>
          <p className="text-blue-200 text-lg">
            Complete GoBILDA and REV Robotics parts catalog for FTC teams
          </p>
        </div>

        {/* Search Bar - Full Width */}
        <Card className="mb-6 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-300" />
              <Input
                placeholder="Search by part name, series, SKU, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-slate-800/90 border-2 border-white/30 text-white placeholder-blue-300/80 focus:bg-slate-700/90 focus:border-blue-400 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 hover:border-blue-400/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-6 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="text-blue-200 mb-2 block">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-800/50 border-white/20 text-white hover:bg-slate-700/50 focus:border-blue-400">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="hover:bg-slate-700">
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="manufacturer" className="text-blue-200 mb-2 block">Manufacturer</Label>
                <Select value={selectedManufacturer} onValueChange={setSelectedManufacturer}>
                  <SelectTrigger className="bg-slate-800/50 border-white/20 text-white hover:bg-slate-700/50 focus:border-blue-400">
                    <SelectValue placeholder="All Manufacturers" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    {manufacturers.map(manufacturer => (
                      <SelectItem key={manufacturer} value={manufacturer} className="hover:bg-slate-700">
                        {manufacturer === 'all' ? 'All Manufacturers' : manufacturer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedManufacturer('all');
                  }}
                  className="w-full bg-slate-800/50 border-white/20 text-blue-200 hover:bg-slate-700/50 hover:border-blue-400 hover:text-white transition-all duration-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts Count */}
        <div className="mb-6">
          <p className="text-blue-200 text-center">
            Showing {filteredParts.length} part series with {filteredParts.reduce((total, part) => total + part.variants.length, 0)} total variants
          </p>
        </div>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => (
            <Card 
              key={part.id} 
              className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group cursor-pointer h-full flex flex-col"
              onClick={() => openPartDetails(part)}
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex justify-between items-start mb-2">
                  <Badge 
                    variant="outline" 
                    className={`border ${
                      part.manufacturer === 'GoBILDA' 
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        : part.manufacturer === 'REV'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                    }`}
                  >
                    {part.manufacturer}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-600/20 text-slate-300 border-slate-500/30">
                    {part.series}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors min-h-[3.5rem] flex items-center">
                  {part.name}
                </CardTitle>
                <CardDescription className="text-blue-200 text-sm">
                  {part.variants.length} variants available
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <p className="text-blue-100 text-sm min-h-[2.5rem] line-clamp-2">{part.description}</p>
                  
                  {/* Price Range */}
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300 text-sm">Price:</span>
                    <span className="text-white font-medium">
                      ${Math.min(...part.variants.map(v => v.price))}
                      {Math.min(...part.variants.map(v => v.price)) !== Math.max(...part.variants.map(v => v.price)) 
                        ? ` - $${Math.max(...part.variants.map(v => v.price))}` 
                        : ''}
                    </span>
                  </div>

                  {/* Available Options Preview - Standardized */}
                  <div className="min-h-[3rem] space-y-1">
                    {part.specification_options.rpms && (
                      <div className="flex justify-between">
                        <span className="text-blue-300 text-xs">RPM Options:</span>
                        <span className="text-white text-xs">{part.specification_options.rpms.length}</span>
                      </div>
                    )}
                    {part.specification_options.shaft_lengths && (
                      <div className="flex justify-between">
                        <span className="text-blue-300 text-xs">Lengths:</span>
                        <span className="text-white text-xs">{part.specification_options.shaft_lengths.length}</span>
                      </div>
                    )}
                    {part.specification_options.gear_ratios && (
                      <div className="flex justify-between">
                        <span className="text-blue-300 text-xs">Ratios:</span>
                        <span className="text-white text-xs">{part.specification_options.gear_ratios.length}</span>
                      </div>
                    )}
                    {!part.specification_options.rpms && !part.specification_options.shaft_lengths && !part.specification_options.gear_ratios && (
                      <div className="flex justify-between">
                        <span className="text-blue-300 text-xs">Type:</span>
                        <span className="text-white text-xs">Standard</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons - Always at bottom */}
                <div className="flex gap-2 pt-2 mt-auto">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400 hover:text-white transition-all duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPartDetails(part);
                    }}
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                  {part.datasheet_url && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="bg-slate-600/20 border-slate-500/30 text-slate-300 hover:bg-slate-600/30 hover:border-slate-400 hover:text-white transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(part.datasheet_url, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Part Details Modal */}
        {selectedPart && selectedVariant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl">{selectedPart.name}</CardTitle>
                    <CardDescription className="text-blue-200">
                      {selectedVariant.sku} • {selectedPart.manufacturer} {selectedPart.series}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={closePartDetails}
                    className="text-blue-200 hover:text-white hover:bg-white/10"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-blue-300 font-medium mb-2">Description</h4>
                  <p className="text-blue-100">{selectedPart.description}</p>
                </div>

                {/* Specification Selectors */}
                <div className="space-y-4">
                  <h4 className="text-blue-300 font-medium">Configure Specifications</h4>
                  
                  {/* RPM Selection */}
                  {selectedPart.specification_options.rpms && (
                    <div>
                      <Label className="text-blue-300 mb-2 block">RPM / Speed</Label>
                      <Select 
                        value={selectedVariant.rpm} 
                        onValueChange={(value) => handleSpecificationChange('rpm', value)}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-white/20 text-white hover:bg-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20 text-white">
                          {selectedPart.specification_options.rpms.map(rpm => (
                            <SelectItem key={rpm} value={rpm} className="hover:bg-slate-700">
                              {rpm}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Gear Ratio Selection */}
                  {selectedPart.specification_options.gear_ratios && (
                    <div>
                      <Label className="text-blue-300 mb-2 block">Gear Ratio</Label>
                      <Select 
                        value={selectedVariant.gear_ratio || ''} 
                        onValueChange={(value) => handleSpecificationChange('gear_ratio', value)}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-white/20 text-white hover:bg-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20 text-white">
                          {selectedPart.specification_options.gear_ratios.map(ratio => (
                            <SelectItem key={ratio} value={ratio} className="hover:bg-slate-700">
                              {ratio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Shaft Length Selection */}
                  {selectedPart.specification_options.shaft_lengths && (
                    <div>
                      <Label className="text-blue-300 mb-2 block">Length</Label>
                      <Select 
                        value={selectedVariant.shaft_length || ''} 
                        onValueChange={(value) => handleSpecificationChange('shaft_length', value)}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-white/20 text-white hover:bg-slate-700/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20 text-white">
                          {selectedPart.specification_options.shaft_lengths.map(length => (
                            <SelectItem key={length} value={length} className="hover:bg-slate-700">
                              {length}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Selected Variant Specifications */}
                <div>
                  <h4 className="text-blue-300 font-medium mb-3">Selected Configuration</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-blue-300 block">SKU</span>
                      <span className="text-white font-medium">{selectedVariant.sku}</span>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <span className="text-blue-300 block">Price</span>
                      <span className="text-white font-medium">${selectedVariant.price}</span>
                    </div>
                    {selectedVariant.rpm !== 'N/A' && selectedVariant.rpm !== 'Variable' && (
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-blue-300 block">RPM</span>
                        <span className="text-white font-medium">{selectedVariant.rpm}</span>
                      </div>
                    )}
                    {selectedVariant.torque !== 'N/A' && selectedVariant.torque !== 'Variable' && (
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-blue-300 block">Torque</span>
                        <span className="text-white font-medium">{selectedVariant.torque}</span>
                      </div>
                    )}
                    {selectedVariant.shaft_type && (
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-blue-300 block">Shaft Type</span>
                        <span className="text-white font-medium">{selectedVariant.shaft_type}</span>
                      </div>
                    )}
                    {selectedVariant.shaft_length && (
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-blue-300 block">Length</span>
                        <span className="text-white font-medium">{selectedVariant.shaft_length}</span>
                      </div>
                    )}
                    {selectedVariant.gear_ratio && (
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <span className="text-blue-300 block">Gear Ratio</span>
                        <span className="text-white font-medium">{selectedVariant.gear_ratio}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity Selection */}
                <div>
                  <Label className="text-blue-300 mb-2 block">Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-slate-800/50 border-white/20 text-white hover:bg-slate-700/50"
                    >
                      -
                    </Button>
                    <span className="text-white font-medium w-8 text-center">{quantity}</span>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="bg-slate-800/50 border-white/20 text-white hover:bg-slate-700/50"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleAddToInventory}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add {quantity}x to Inventory
                  </Button>
                  {selectedPart.datasheet_url && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(selectedPart.datasheet_url, '_blank')}
                      className="bg-slate-800/50 border-white/20 text-blue-200 hover:bg-slate-700/50 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Datasheet
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}