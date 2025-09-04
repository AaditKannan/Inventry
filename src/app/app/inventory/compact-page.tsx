'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Package, Search, Eye, Trash2, Edit, ExternalLink, Plus } from 'lucide-react';

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
  reserved?: number;
  created_at: string;
  updated_at?: string;
  notes?: string;
}

export default function CompactInventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  const loadParts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const inventoryFromStorage = JSON.parse(localStorage.getItem('inventory') || '[]');
      
      let filtered = inventoryFromStorage;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((part: any) =>
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
  }, [supabase, router, searchQuery]);

  useEffect(() => {
    loadParts();
  }, [loadParts]);

  const getStockStatus = (part: Part) => {
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

  const handleUpdateQuantity = (partId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      const updatedInventory = currentInventory.filter((part: any) => part.id !== partId);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    } else {
      const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
      const updatedInventory = currentInventory.map((part: any) => 
        part.id === partId ? { 
          ...part, 
          current_stock: newQuantity,
          stock: newQuantity,
          updated_at: new Date().toISOString()
        } : part
      );
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    }
    
    loadParts();
  };

  const openPartDetails = (part: Part) => {
    setSelectedPart(part);
  };

  const closePartDetails = () => {
    setSelectedPart(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
              Inventory
            </h1>
            <p className="text-blue-200">
              {parts.length} parts in stock
            </p>
          </div>
          <Button 
            onClick={() => router.push('/app/parts')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Parts
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg text-white placeholder-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Compact Grid - 5 columns showing MANY more parts */}
        {parts.length === 0 ? (
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No parts in inventory</h3>
              <p className="text-blue-200 mb-4">Start by adding parts from the parts library</p>
              <Button 
                onClick={() => router.push('/app/parts')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Browse Parts Library
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {parts.map((part) => (
              <Card 
                key={part.id} 
                className="bg-white/5 backdrop-blur-xl border-white/20 shadow-lg hover:border-blue-400/30 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 group cursor-pointer"
                onClick={() => openPartDetails(part)}
              >
                <CardContent className="p-3">
                  {/* Header with stock status and brand */}
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      className={`text-xs ${getStockStatusColor(getStockStatus(part))}`}
                    >
                      {part.stock || part.current_stock || 0}
                    </Badge>
                    <Badge 
                      className={`text-xs ${getManufacturerColor(part.manufacturer)}`}
                    >
                      {part.manufacturer}
                    </Badge>
                  </div>

                  {/* Part name - prominent but compact */}
                  <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-300 transition-colors">
                    {part.name}
                  </h3>

                  {/* Essential info only */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300 text-xs">SKU:</span>
                      <span className="text-white text-xs font-mono">{part.part_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-300 text-xs">Location:</span>
                      <span className="text-white text-xs">{part.location}</span>
                    </div>
                  </div>

                  {/* Quick action buttons */}
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateQuantity(part.id, (part.stock || part.current_stock || 0) - 1);
                      }}
                      className="flex-1 bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-400 h-7 text-xs"
                    >
                      -
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateQuantity(part.id, (part.stock || part.current_stock || 0) + 1);
                      }}
                      className="flex-1 bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-400 h-7 text-xs"
                    >
                      +
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPartDetails(part);
                      }}
                      className="flex-1 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 h-7 text-xs"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Part Details Modal */}
        <Dialog open={!!selectedPart} onOpenChange={(open) => !open && closePartDetails()}>
          <DialogContent className="max-w-2xl bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {selectedPart?.name}
              </DialogTitle>
              <div className="text-blue-200">
                {selectedPart?.part_number} • {selectedPart?.manufacturer}
              </div>
            </DialogHeader>
            
            {selectedPart && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-blue-300 font-medium mb-2">Description</h4>
                  <p className="text-blue-100">{selectedPart.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-blue-300 font-medium mb-2">Stock</h4>
                    <p className="text-white text-lg font-semibold">{selectedPart.stock || selectedPart.current_stock || 0}</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 font-medium mb-2">Location</h4>
                    <p className="text-white">{selectedPart.location}</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 font-medium mb-2">Cost</h4>
                    <p className="text-white">${selectedPart.cost}</p>
                  </div>
                  <div>
                    <h4 className="text-blue-300 font-medium mb-2">Category</h4>
                    <p className="text-white">{selectedPart.category}</p>
                  </div>
                </div>

                {selectedPart.notes && (
                  <div>
                    <h4 className="text-blue-300 font-medium mb-2">Notes</h4>
                    <p className="text-blue-100">{selectedPart.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleUpdateQuantity(selectedPart.id, (selectedPart.stock || selectedPart.current_stock || 0) - 1);
                      if ((selectedPart.stock || selectedPart.current_stock || 0) <= 1) {
                        closePartDetails();
                      }
                    }}
                    className="bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
                  >
                    Remove 1
                  </Button>
                  <Button
                    onClick={() => handleUpdateQuantity(selectedPart.id, (selectedPart.stock || selectedPart.current_stock || 0) + 1)}
                    className="bg-green-500/20 border-green-500/30 text-green-300 hover:bg-green-500/30"
                  >
                    Add 1
                  </Button>
                  {(selectedPart.manufacturer === 'GoBILDA' || selectedPart.manufacturer === 'REV') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const baseUrl = selectedPart.manufacturer === 'GoBILDA' 
                          ? 'https://www.gobilda.com/search/?q=' 
                          : 'https://www.revrobotics.com/search/?q=';
                        window.open(baseUrl + encodeURIComponent(selectedPart.part_number || selectedPart.name), '_blank');
                      }}
                      className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Buy More
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

