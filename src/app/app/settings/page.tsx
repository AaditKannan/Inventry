'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  const handleEdit = () => {
    setIsEditing(true);
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

  const handleSave = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name || null,
          prefs: {
            emailNotifications: editForm.emailNotifications,
            requestNotifications: editForm.requestNotifications,
            transactionNotifications: editForm.transactionNotifications
          }
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings updated successfully"
      });

      setIsEditing(false);
      loadProfile(); // Reload data to get updated values
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-500">Unable to load your profile information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account preferences and settings
          </p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {profile.email}
              </div>
              <p className="text-sm text-gray-500">
                Email address cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              {isEditing ? (
                <Input
                  id="display_name"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  placeholder="Enter your display name"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md border">
                  {profile.display_name || 'No display name set'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Account Created</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Team Status</Label>
              <div className="p-3 bg-gray-50 rounded-md border">
                {profile.team_id ? 'Team Member' : 'No Team'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-gray-500">
                    Receive notifications via email
                  </div>
                </div>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editForm.emailNotifications}
                  onChange={(e) => setEditForm({ ...editForm, emailNotifications: e.target.checked })}
                  className="w-4 h-4"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {profile.prefs?.emailNotifications ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-500">
                    {profile.prefs?.emailNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">Request Notifications</div>
                  <div className="text-sm text-gray-500">
                    Notify when someone requests parts from your team
                  </div>
                </div>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editForm.requestNotifications}
                  onChange={(e) => setEditForm({ ...editForm, requestNotifications: e.target.checked })}
                  className="w-4 h-4"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {profile.prefs?.requestNotifications ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-500">
                    {profile.prefs?.requestNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">Transaction Updates</div>
                  <div className="text-sm text-gray-500">
                    Notify when transaction status changes
                  </div>
                </div>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editForm.transactionNotifications}
                  onChange={(e) => setEditForm({ ...editForm, transactionNotifications: e.target.checked })}
                  className="w-4 h-4"
                />
              ) : (
                <div className="flex items-center gap-2">
                  {profile.prefs?.transactionNotifications ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-500">
                    {profile.prefs?.transactionNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Actions
          </CardTitle>
          <CardDescription>
            Manage your account and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Sign Out</div>
                <div className="text-sm text-gray-500">
                  Sign out of your account on this device
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
