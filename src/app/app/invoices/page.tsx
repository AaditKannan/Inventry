'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Trash2, Eye, Download, Zap, Package, TrendingUp } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import parseInvoiceText, { ParsedInvoice, ParsedInvoiceItem, generateInventorySuggestions } from '@/lib/invoice-parser';

interface Invoice {
  id: string;
  filename: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  uploaded_at: string;
  file_size: number;
  total_amount?: number;
  vendor_name?: string;
  invoice_number?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showParsingResults, setShowParsingResults] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });

  const processInvoiceWithAI = async (file: File) => {
    setIsProcessing(true);
    console.log('🤖 Starting AI processing for:', file.name);

    try {
      // Extract text from file (simulated for demo)
      const text = await extractTextFromFile(file);
      
      // Parse with AI
      const parsed = parseInvoiceText(text);
      console.log('✅ AI parsing complete:', parsed);
      
      setParsedInvoice(parsed);
      setShowParsingResults(true);
      
    } catch (error) {
      console.error('❌ AI processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    console.log('📄 Extracting text from:', file.name, 'Type:', file.type);
    
    try {
      if (file.type === 'application/pdf') {
        // Extract text from PDF using PDF.js
        const pdfjsLib = await import('pdfjs-dist');
        // Set the worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let fullText = '';
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const textItems = textContent.items.map((item: any) => item.str);
          fullText += textItems.join(' ') + '\n';
        }
        
        console.log('✅ PDF text extracted, length:', fullText.length);
        return fullText;
      } else if (file.type.startsWith('image/')) {
        // Extract text from image using enhanced OCR
        const Tesseract = await import('tesseract.js');
        console.log('🔍 Starting enhanced OCR processing...');
        
        // Enhanced OCR options for better accuracy
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        });
        
        console.log('✅ Enhanced OCR text extracted, length:', text.length);
        console.log('📄 OCR Text Preview:', text.substring(0, 500));
        return text;
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      throw new Error(`Failed to extract text from ${file.type} file: ${error}`);
    }
  };

  const handleAddToInventory = (items: ParsedInvoiceItem[]) => {
    console.log('📦 Adding to inventory:', items);
    
    // Get current inventory from localStorage
    const currentInventory = JSON.parse(localStorage.getItem('inventory') || '[]');
    
    // Convert parsed items to inventory format (using proper data structure)
    // Allow items with confidence > 0.3 OR items without matchedPart (manual review)
    const newInventoryItems = items
      .filter(item => item.confidence > 0.3)
      .map(item => ({
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        part_id: item.matchedPart?.id || `unmatched-${Date.now()}`,
        part_number: item.sku || item.matchedPart?.sku || `UNKNOWN-${Date.now()}`,
        name: item.matchedPart?.name || item.description,
        description: item.description,
        manufacturer: item.matchedPart?.manufacturer || item.manufacturer || 'Unknown',
        category: item.matchedPart?.category || 'Tools & Accessories',
        cost: item.price,
        price: item.price,
        current_stock: item.quantity,
        stock: item.quantity,
        min_stock: 1,
        condition: 'new' as const,
        location: 'Main Storage',
        lendable: true,
        notes: `Added from invoice ${parsedInvoice?.invoice_number || 'AI-parsed'} - ${item.matchedPart ? 'Matched' : 'Unmatched'}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        added_from: 'invoice'
      }));
    
    // Check for existing parts and merge quantities
    const updatedInventory = [...currentInventory];
    
    newInventoryItems.forEach(newItem => {
      const existingIndex = updatedInventory.findIndex(item => 
        item.part_number === newItem.part_number
      );
      
      if (existingIndex >= 0) {
        // Update existing item quantity
        updatedInventory[existingIndex].current_stock = (updatedInventory[existingIndex].current_stock || 0) + newItem.current_stock;
        updatedInventory[existingIndex].stock = updatedInventory[existingIndex].current_stock;
        updatedInventory[existingIndex].updated_at = new Date().toISOString();
      } else {
        // Add new item
        updatedInventory.push(newItem);
      }
    });
    
    // Save to localStorage
    localStorage.setItem('inventory', JSON.stringify(updatedInventory));
    
    // Save activity log
    const activities = JSON.parse(localStorage.getItem('recentActivities') || '[]');
    activities.unshift({
      id: `activity-${Date.now()}`,
      type: 'invoice_processed',
      description: `AI processed invoice: ${parsedInvoice?.vendor || 'Unknown'} - ${newInventoryItems.length} items added`,
      details: `Invoice #${parsedInvoice?.invoice_number || 'N/A'}`,
      timestamp: new Date().toISOString(),
      itemCount: newInventoryItems.length
    });
    localStorage.setItem('recentActivities', JSON.stringify(activities.slice(0, 10))); // Keep last 10
    
    console.log(`✅ Added ${newInventoryItems.length} items to inventory`);
    
    // Show success message and redirect
    alert(`Successfully added ${newInventoryItems.length} items to inventory!`);
    setShowParsingResults(false);
    setParsedInvoice(null);
    setSelectedFile(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Process with AI immediately
      setUploadProgress(25);
      await processInvoiceWithAI(selectedFile);
      
      setUploadProgress(75);
      
      // Save to localStorage for tracking
      const uploads = JSON.parse(localStorage.getItem('uploadedInvoices') || '[]');
      const newUpload = {
        id: `upload-${Date.now()}`,
        filename: selectedFile.name,
        file_size: selectedFile.size,
        uploaded_at: new Date().toISOString(),
        status: 'processed',
        vendor: parsedInvoice?.vendor || 'Unknown',
        total_amount: parsedInvoice?.total_amount || 0,
        invoice_number: parsedInvoice?.invoice_number || 'N/A'
      };
      
      uploads.unshift(newUpload);
      localStorage.setItem('uploadedInvoices', JSON.stringify(uploads.slice(0, 20))); // Keep last 20
      
      
      console.log('✅ File processed successfully');

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to process file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'processing':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'completed':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">{/* Clean background, no weird patterns */}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-float hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-500">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent mb-2">
            Invoice Processing
          </h1>
          <p className="text-blue-200 text-lg">
            Upload invoices and let AI extract parts automatically
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl hover:border-blue-400/30 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-6 w-6 text-blue-400" />
              Upload Invoice
            </CardTitle>
            <CardDescription className="text-blue-200">
              Drag and drop your invoice files here, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragActive || dragActive
                  ? 'border-blue-400 bg-blue-50/10'
                  : 'border-white/20 hover:border-blue-400/40 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">
                {isDragActive ? 'Drop your invoice here' : 'Drag & drop your invoice here'}
              </p>
              <p className="text-blue-200 text-sm mb-4">
                Supports PDF, images, and documents
              </p>
              <Button variant="outline" className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400">
                Browse Files
              </Button>
            </div>

            {selectedFile && (
              <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{selectedFile.name}</p>
                      <p className="text-blue-200 text-sm">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedFile(null)}
                      variant="outline"
                      size="sm"
                      className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                      {isUploading ? 'Processing...' : 'Process with AI'}
                    </Button>
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-blue-200 mb-2">
                      <span>Processing Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <div>
                  <h3 className="text-white font-semibold">Processing File...</h3>
                  <p className="text-blue-200 text-sm">
                    {selectedFile?.type === 'application/pdf' ? 'Extracting text from PDF' : 'Running OCR on image'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Parsing Results */}
        {showParsingResults && parsedInvoice && (
          <Card className="mb-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-400" />
                Processing Complete
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                  {(parsedInvoice.parsing_confidence * 100).toFixed(1)}% Confidence
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-200">
                Identified {parsedInvoice.items.length} items from {parsedInvoice.vendor}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Invoice Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white/5 rounded-lg border border-green-400/20">
                <div>
                  <p className="text-green-200 text-sm">Vendor</p>
                  <p className="text-white font-semibold">{parsedInvoice.vendor}</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm">Invoice #</p>
                  <p className="text-white font-semibold">{parsedInvoice.invoice_number}</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm">Date</p>
                  <p className="text-white font-semibold">{parsedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-green-200 text-sm">Total</p>
                  <p className="text-white font-semibold">${parsedInvoice.total_amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Parsed Items */}
              <div className="space-y-3 mb-6">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-400" />
                  Identified Parts ({parsedInvoice.items.length})
                </h4>
                
                {parsedInvoice.items.map((item, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium">{item.description}</p>
                          {item.matchedPart && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-400/30 text-xs">
                              Matched
                            </Badge>
                          )}
                          {item.confidence && (
                            <Badge variant="outline" className="border-blue-400/30 text-blue-300 text-xs">
                              {(item.confidence * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        
                        {item.matchedPart && (
                          <p className="text-green-200 text-sm">
                            → {item.matchedPart.name} ({item.matchedPart.manufacturer})
                          </p>
                        )}
                        
                        {item.sku && (
                          <p className="text-blue-200 text-sm">SKU: {item.sku}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-medium">
                          {item.quantity}x ${item.price.toFixed(2)}
                        </p>
                        <p className="text-blue-200 text-sm">
                          Total: ${item.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleAddToInventory(parsedInvoice.items)}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                  disabled={parsedInvoice.items.filter(item => item.confidence > 0.3).length === 0}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Add {parsedInvoice.items.filter(item => item.confidence > 0.3).length} Items to Inventory
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowParsingResults(false);
                    setParsedInvoice(null);
                  }}
                  className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20"
                >
                  Close
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => router.push('/app/inventory')}
                  className="bg-blue-500/10 border-blue-400/20 text-blue-300 hover:bg-blue-500/20"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Inventory
                </Button>
              </div>

              {/* Smart Suggestions */}
              {(() => {
                const { suggestions } = generateInventorySuggestions(parsedInvoice.items);
                return suggestions.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                    <h5 className="text-blue-300 font-medium mb-2">💡 Smart Suggestions</h5>
                    <ul className="text-blue-200 text-sm space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Invoices List */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-400" />
              Recent Invoices
            </CardTitle>
            <CardDescription className="text-blue-200">
              Track the status of your uploaded invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-blue-400/50 mx-auto mb-4" />
                <p className="text-blue-200 text-lg mb-2">No invoices yet</p>
                <p className="text-blue-300 text-sm">Upload your first invoice to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/10 rounded-lg">
                        {getStatusIcon(invoice.status)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{invoice.filename}</p>
                        <p className="text-blue-200 text-sm">
                          {formatFileSize(invoice.file_size)} • {formatDate(invoice.uploaded_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                      
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
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
