'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Database, Search, Filter, Package, ExternalLink, Plus, Eye, ShoppingCart } from 'lucide-react';

interface Part {
  id: string;
  part_number: string;
  name: string;
  description: string;
  manufacturer: 'GoBILDA' | 'REV' | 'Other';
  category: string;
  cost: number;
  datasheet_url?: string;
  image_url?: string;
  specs: {
    material?: string;
    dimensions?: string;
    weight?: string;
    color?: string;
  };
}

// Mock GoBILDA and REV parts data
const mockParts: Part[] = [
  {
    id: '1',
    part_number: 'GB-0001',
    name: 'GoBILDA 5203 Series Yellow Jacket Planetary Gear Motor',
    description: 'High-performance planetary gear motor with 5.2:1 gear ratio, perfect for FTC robots requiring high torque and precision.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    cost: 89.99,
    datasheet_url: 'https://www.gobilda.com/5203-series-yellow-jacket-planetary-gear-motor/',
    specs: {
      material: 'Aluminum, Steel',
      dimensions: '2.5" x 1.5" x 1.5"',
      weight: '0.8 lbs',
      color: 'Yellow'
    }
  },
  {
    id: '2',
    part_number: 'GB-0002',
    name: 'GoBILDA 5202 Series Yellow Jacket Planetary Gear Motor',
    description: 'Compact planetary gear motor with 19.2:1 gear ratio, ideal for space-constrained applications.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    cost: 79.99,
    datasheet_url: 'https://www.gobilda.com/5202-series-yellow-jacket-planetary-gear-motor/',
    specs: {
      material: 'Aluminum, Steel',
      dimensions: '2.5" x 1.5" x 1.5"',
      weight: '0.8 lbs',
      color: 'Yellow'
    }
  },
  {
    id: '3',
    part_number: 'GB-0003',
    name: 'GoBILDA 5201 Series Yellow Jacket Planetary Gear Motor',
    description: 'Ultra-high torque motor with 26.9:1 gear ratio for heavy lifting and driving applications.',
    manufacturer: 'GoBILDA',
    category: 'Motors & Actuators',
    cost: 89.99,
    datasheet_url: 'https://www.gobilda.com/5201-series-yellow-jacket-planetary-gear-motor/',
    specs: {
      material: 'Aluminum, Steel',
      dimensions: '2.5" x 1.5" x 1.5"',
      weight: '0.8 lbs',
      color: 'Yellow'
    }
  },
  {
    id: '4',
    part_number: 'GB-0004',
    name: 'GoBILDA 5mm D-Shaft',
    description: 'Precision 5mm D-shaft for secure motor coupling and power transmission.',
    manufacturer: 'GoBILDA',
    category: 'Structural & Frame',
    cost: 4.99,
    datasheet_url: 'https://www.gobilda.com/5mm-d-shaft/',
    specs: {
      material: 'Steel',
      dimensions: 'Various lengths',
      weight: '0.1 lbs',
      color: 'Silver'
    }
  },
  {
    id: '5',
    part_number: 'GB-0005',
    name: 'GoBILDA 5mm Hex Shaft',
    description: '5mm hex shaft for secure power transmission with anti-rotation capability.',
    manufacturer: 'GoBILDA',
    category: 'Structural & Frame',
    cost: 4.99,
    datasheet_url: 'https://www.gobilda.com/5mm-hex-shaft/',
    specs: {
      material: 'Steel',
      dimensions: 'Various lengths',
      weight: '0.1 lbs',
      color: 'Silver'
    }
  },
  {
    id: '6',
    part_number: 'REV-0001',
    name: 'REV Robotics HD Hex Motor',
    description: 'High-durability hex motor with 40:1 gear ratio, designed for FTC competition use.',
    manufacturer: 'REV',
    category: 'Motors & Actuators',
    cost: 99.99,
    datasheet_url: 'https://www.revrobotics.com/hd-hex-motor/',
    specs: {
      material: 'Aluminum, Steel',
      dimensions: '2.5" x 1.5" x 1.5"',
      weight: '0.9 lbs',
      color: 'Red'
    }
  },
  {
    id: '7',
    part_number: 'REV-0002',
    name: 'REV Robotics Core Hex Motor',
    description: 'Core hex motor with 20:1 gear ratio, perfect for general-purpose applications.',
    manufacturer: 'REV',
    category: 'Motors & Actuators',
    cost: 79.99,
    datasheet_url: 'https://www.revrobotics.com/core-hex-motor/',
    specs: {
      material: 'Aluminum, Steel',
      dimensions: '2.5" x 1.5" x 1.5"',
      weight: '0.8 lbs',
      color: 'Red'
    }
  },
  {
    id: '8',
    part_number: 'REV-0003',
    name: 'REV Robotics UltraPlanetary Motor',
    description: 'UltraPlanetary motor with configurable gear ratios from 3.7:1 to 125:1.',
    manufacturer: 'REV',
    category: 'Motors & Actuators',
    cost: 149.99,
    datasheet_url: 'https://www.revrobotics.com/ultraplanetary/',
    specs: {
      material: 'Aluminum, Steel',
      dimensions: '3.0" x 1.5" x 1.5"',
      weight: '1.2 lbs',
      color: 'Red'
    }
  },
  {
    id: '9',
    part_number: 'REV-0004',
    name: 'REV Robotics Control Hub',
    description: 'Advanced control hub with built-in power distribution and expansion ports.',
    manufacturer: 'REV',
    category: 'Electronics',
    cost: 299.99,
    datasheet_url: 'https://www.revrobotics.com/control-hub/',
    specs: {
      material: 'Aluminum, PCB',
      dimensions: '4.0" x 2.5" x 1.0"',
      weight: '0.5 lbs',
      color: 'Red'
    }
  },
  {
    id: '10',
    part_number: 'REV-0005',
    name: 'REV Robotics Expansion Hub',
    description: 'Expansion hub for additional motor and servo connections.',
    manufacturer: 'REV',
    category: 'Electronics',
    cost: 199.99,
    datasheet_url: 'https://www.revrobotics.com/expansion-hub/',
    specs: {
      material: 'Aluminum, PCB',
      dimensions: '3.0" x 2.0" x 1.0"',
      weight: '0.3 lbs',
      color: 'Red'
    }
  }
];

export default function PartsLibraryPage() {
  const [parts, setParts] = useState<Part[]>(mockParts);
  const [filteredParts, setFilteredParts] = useState<Part[]>(mockParts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [showPartDetails, setShowPartDetails] = useState(false);

  const categories = ['Motors & Actuators', 'Wheels & Traction', 'Structural & Frame', 'Electronics', 'Fasteners', 'Power & Battery', 'Control Systems', 'Tools & Accessories'];

  useEffect(() => {
    filterParts();
  }, [searchQuery, selectedCategory, selectedManufacturer]);

  const filterParts = () => {
    let filtered = parts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(part => part.category === selectedCategory);
    }

    if (selectedManufacturer !== 'all') {
      filtered = filtered.filter(part => part.manufacturer === selectedManufacturer);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(query) ||
        part.part_number.toLowerCase().includes(query) ||
        part.description.toLowerCase().includes(query)
      );
    }

    setFilteredParts(filtered);
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

  const getCategoryColor = (category: string) => {
    const colors = [
      'text-green-500 bg-green-50 border-green-200',
      'text-blue-500 bg-blue-50 border-blue-200',
      'text-yellow-500 bg-yellow-50 border-yellow-200',
      'text-purple-500 bg-purple-50 border-purple-200',
      'text-red-500 bg-red-50 border-red-200',
      'text-indigo-500 bg-indigo-50 border-indigo-200',
      'text-pink-500 bg-pink-50 border-pink-200',
      'text-orange-500 bg-orange-50 border-orange-200'
    ];
    const index = categories.indexOf(category);
    return colors[index % colors.length];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const openPartDetails = (part: Part) => {
    setSelectedPart(part);
    setShowPartDetails(true);
  };

  const closePartDetails = () => {
    setShowPartDetails(false);
    setSelectedPart(null);
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
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-float hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-500">
              <Database className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mb-2">
            Parts Library
          </h1>
          <p className="text-blue-200 text-lg">
            Browse GoBILDA and REV robotics parts for your FTC robot
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
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
                  className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 focus:border-blue-400 focus:outline-none"
                >
                  <option value="all">All Manufacturers</option>
                  <option value="GoBILDA">GoBILDA</option>
                  <option value="REV">REV</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => (
            <Card
              key={part.id}
              className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 group cursor-pointer"
              onClick={() => openPartDetails(part)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg group-hover:text-blue-300 transition-colors line-clamp-2">
                      {part.name}
                    </CardTitle>
                    <p className="text-blue-300 text-sm font-mono">{part.part_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPartDetails(part);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-blue-200 text-sm line-clamp-3">{part.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getManufacturerColor(part.manufacturer)}`}>
                    {part.manufacturer}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(part.category)}`}>
                    {part.category}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <p className="text-white font-medium text-lg">{formatCurrency(part.cost)}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to inventory logic here
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                    {part.datasheet_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(part.datasheet_url, '_blank');
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredParts.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="text-center py-12">
              <Database className="h-16 w-16 text-blue-400/50 mx-auto mb-4" />
              <p className="text-blue-200 text-lg mb-2">No parts found</p>
              <p className="text-blue-300 text-sm">
                Try adjusting your search or filters to find what you're looking for
              </p>
            </CardContent>
          </Card>
        )}

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
                    <p className="text-white font-medium text-lg">{formatCurrency(selectedPart.cost)}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Part Number</p>
                    <p className="text-white font-medium">{selectedPart.part_number}</p>
                  </div>
                </div>

                {selectedPart.specs && (
                  <div>
                    <p className="text-blue-300 text-sm mb-2">Specifications</p>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedPart.specs).map(([key, value]) => (
                        value && (
                          <div key={key}>
                            <p className="text-blue-300 text-sm capitalize">{key.replace('_', ' ')}</p>
                            <p className="text-white font-medium">{value}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex-1"
                    onClick={() => {
                      // Add to inventory logic here
                      closePartDetails();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Inventory
                  </Button>
                  {selectedPart.datasheet_url && (
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
                      onClick={() => window.open(selectedPart.datasheet_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Datasheet
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
