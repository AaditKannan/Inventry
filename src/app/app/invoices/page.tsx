'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, Trash2, Eye, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get user and team info
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

      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `invoices/${profile.team_id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(50);

      // Create invoice record in database
      const { data: invoice, error: dbError } = await supabase
        .from('invoices')
        .insert({
          team_id: profile.team_id,
          filename: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          status: 'uploaded',
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      setUploadProgress(100);

      // Add to local state
      setInvoices(prev => [invoice, ...prev]);
      setSelectedFile(null);

      // Simulate processing
      setTimeout(() => {
        setInvoices(prev => 
          prev.map(inv => 
            inv.id === invoice.id 
              ? { ...inv, status: 'processing' as const }
              : inv
          )
        );
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
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
                      {isUploading ? 'Uploading...' : 'Upload & Process'}
                    </Button>
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-blue-200 mb-2">
                      <span>Upload Progress</span>
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
