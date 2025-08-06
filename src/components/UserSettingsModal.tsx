import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import { Loader2, Download, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync?: () => void;
}

const UserSettingsModal = ({ isOpen, onClose, onSync }: UserSettingsModalProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { watchedVideoIds, refetch: refetchWatchHistory } = useWatchHistory();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserSettings();
    }
  }, [isOpen, user]);

  const loadUserSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setEmailNotifications(data?.email_notifications ?? true);
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast({
        title: "Error",
        description: "Failed to load your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: emailNotifications })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setExporting(true);
    try {
      // Fetch user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch watch history
      const { data: watchHistory } = await supabase
        .from('watched_videos')
        .select('*')
        .eq('user_id', user.id);

      const userData = {
        profile,
        watchHistory,
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Failed to export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleClearWatchHistory = async () => {
    if (!user) return;

    setClearingHistory(true);
    try {
      const { error } = await supabase
        .from('watched_videos')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      await refetchWatchHistory();
      
      toast({
        title: "Watch history cleared",
        description: "Your watch history has been successfully cleared.",
      });
    } catch (error) {
      console.error('Error clearing watch history:', error);
      toast({
        title: "Error",
        description: "Failed to clear watch history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClearingHistory(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      console.log('Starting account deletion request for user:', user.id);
      
      // Generate deletion token and calculate deletion date (30 days from now)
      const deletionToken = crypto.randomUUID();
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);
      
      // Update profile to mark for deletion
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          deletion_requested_at: new Date().toISOString(),
          scheduled_for_deletion: true,
          deletion_token: deletionToken
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error scheduling account deletion:', profileError);
        toast({
          title: "Error",
          description: "Failed to schedule account deletion. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Account scheduled for deletion successfully');

      // Send deletion confirmation email
      try {
        const emailResponse = await supabase.functions.invoke('send-deletion-email', {
          body: {
            email: user.email,
            deletionToken: deletionToken,
            deletionDate: deletionDate.toISOString()
          }
        });

        if (emailResponse.error) {
          console.error('Error sending deletion email:', emailResponse.error);
          // Don't block the deletion process if email fails
        } else {
          console.log('Deletion confirmation email sent successfully');
        }
      } catch (emailError) {
        console.error('Failed to send deletion confirmation email:', emailError);
        // Don't block the deletion process if email fails
      }

      // Sign out the user immediately
      await supabase.auth.signOut();
      
      toast({
        title: "Account Deletion Scheduled",
        description: "Your account will be deleted in 30 days. Check your email for reactivation instructions.",
      });
      
      onClose();
    } catch (error) {
      console.error('Unexpected error during account deletion scheduling:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSyncStories = async () => {
    if (!onSync) return;
    
    setSyncLoading(true);
    try {
      await onSync();
      toast({
        title: "Stories synced",
        description: "Successfully synced with YouTube playlist",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync stories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <ScrollArea className="max-h-[80vh] pr-4">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {/* Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Get notified when new stories are added
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
              </div>

              <Separator />

              {/* Privacy & Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Privacy & Data</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Export your data</Label>
                      <div className="text-sm text-muted-foreground">
                        Download all your data in JSON format
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportData}
                      disabled={exporting}
                    >
                      {exporting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Clear watch history</Label>
                      <div className="text-sm text-muted-foreground">
                        Remove all your watched video records
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleClearWatchHistory}
                      disabled={clearingHistory}
                    >
                      {clearingHistory ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Clear
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Advanced */}
              {onSync && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Advanced</h3>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Sync Stories</h4>
                        <p className="text-xs text-muted-foreground">
                          Manually refresh stories from the YouTube playlist
                        </p>
                      </div>
                      <Button
                        onClick={handleSyncStories}
                        disabled={syncLoading}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`} />
                        <span>{syncLoading ? 'Syncing...' : 'Sync Now'}</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />
                </>
              )}

              {/* Danger Zone */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-destructive">Delete account</Label>
                    <div className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                          Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Your account will be scheduled for deletion in 30 days. You'll receive an email 
                          with instructions to reactivate your account if you change your mind. After 30 days, 
                          all your data will be permanently deleted, including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Your profile information</li>
                            <li>Watch history</li>
                            <li>Notification preferences</li>
                            <li>Featured story preferences</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          disabled={deleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Schedule Deletion
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </>
          )}
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsModal;