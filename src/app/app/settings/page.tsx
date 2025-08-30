'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Bell, 
  Shield, 
  Save, 
  Edit, 
  X,
  Mail,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  UserCircle
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  team_id: string | null;
  created_at: string;
  prefs?: {
    emailNotifications?: boolean;
    requestNotifications?: boolean;
    transactionNotifications?: boolean;
  };
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    emailNotifications: true,
    requestNotifications: true,
    transactionNotifications: true
  });
  
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(profileData);
      setEditForm({
        display_name: profileData.display_name || '',
        emailNotifications: profileData.prefs?.emailNotifications ?? true,
        requestNotifications: profileData.prefs?.requestNotifications ?? true,
        transactionNotifications: profileData.prefs?.transactionNotifications ?? true
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          prefs: {
            emailNotifications: editForm.emailNotifications,
            requestNotifications: editForm.requestNotifications,
            transactionNotifications: editForm.transactionNotifications
          }
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        display_name: editForm.display_name,
        prefs: {
          emailNotifications: editForm.emailNotifications,
          requestNotifications: editForm.requestNotifications,
          transactionNotifications: editForm.transactionNotifications
        }
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleCancel = () => {
    setEditForm({
      display_name: profile?.display_name || '',
      emailNotifications: profile?.prefs?.emailNotifications ?? true,
      requestNotifications: profile?.prefs?.requestNotifications ?? true,
      transactionNotifications: profile?.prefs?.transactionNotifications ?? true
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading settings...</p>
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
                <SettingsIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-blue-200 text-lg">
                  Manage your account and notification preferences
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <Edit className="h-5 w-5 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Settings'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <UserCircle className="h-6 w-6 text-blue-400" />
                <CardTitle className="text-white text-xl">Profile Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-blue-200 text-sm mb-2 block">Display Name</Label>
                    <Input
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                      className="bg-slate-800/80 border border-white/20 text-white placeholder-blue-300/70 focus:bg-slate-700/80 focus:border-blue-400 backdrop-blur-sm"
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div>
                    <Label className="text-blue-200 text-sm mb-2 block">Email</Label>
                    <Input
                      value={profile?.email || ''}
                      disabled
                      className="bg-slate-800/40 border border-white/10 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-blue-300 text-xs mt-1">Email cannot be changed</p>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400 flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-blue-300 text-sm">Display Name</p>
                    <p className="text-white text-lg font-medium">
                      {profile?.display_name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Email</p>
                    <div className="flex items-center gap-2 text-white">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span>{profile?.email}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Member Since</p>
                    <p className="text-white">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="h-6 w-6 text-blue-400" />
                <CardTitle className="text-white text-xl">Notification Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-blue-300 text-sm">Receive updates via email</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.emailNotifications}
                        onChange={(e) => setEditForm({ ...editForm, emailNotifications: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-slate-800 border-white/20 rounded focus:ring-blue-500"
                      />
                    ) : (
                      <Badge className={`${editForm.emailNotifications 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {editForm.emailNotifications ? 'Enabled' : 'Disabled'}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium">Request Notifications</p>
                    <p className="text-blue-300 text-sm">Alerts for new part requests</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.requestNotifications}
                        onChange={(e) => setEditForm({ ...editForm, requestNotifications: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-slate-800 border-white/20 rounded focus:ring-blue-500"
                      />
                    ) : (
                      <Badge className={`${editForm.requestNotifications 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {editForm.requestNotifications ? 'Enabled' : 'Disabled'}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-white/10">
                  <div>
                    <p className="text-white font-medium">Transaction Notifications</p>
                    <p className="text-blue-300 text-sm">Updates on part exchanges</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.transactionNotifications}
                        onChange={(e) => setEditForm({ ...editForm, transactionNotifications: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-slate-800 border-white/20 rounded focus:ring-blue-500"
                      />
                    ) : (
                      <Badge className={`${editForm.transactionNotifications 
                        ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {editForm.transactionNotifications ? 'Enabled' : 'Disabled'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="mt-8 bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-400" />
              <CardTitle className="text-white text-xl">Account Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-blue-200 hover:bg-white/20 hover:border-blue-400"
              >
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-400"
              >
                <X className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}