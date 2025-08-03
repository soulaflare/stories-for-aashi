import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const ReactivateAccount = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      reactivateAccount();
    } else {
      setError('Invalid reactivation link');
      setLoading(false);
    }
  }, [token]);

  const reactivateAccount = async () => {
    try {
      // Find and update the profile to cancel deletion
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id, deletion_requested_at')
        .eq('deletion_token', token)
        .eq('scheduled_for_deletion', true)
        .single();

      if (fetchError || !profile) {
        setError('Invalid or expired reactivation link');
        setLoading(false);
        return;
      }

      // Check if the 30-day period has passed
      const deletionRequestDate = new Date(profile.deletion_requested_at);
      const expiryDate = new Date(deletionRequestDate);
      expiryDate.setDate(expiryDate.getDate() + 30);

      if (new Date() > expiryDate) {
        setError('This reactivation link has expired. Your account may have already been deleted.');
        setLoading(false);
        return;
      }

      // Reactivate the account
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          deletion_requested_at: null,
          scheduled_for_deletion: false,
          deletion_token: null
        })
        .eq('deletion_token', token);

      if (updateError) {
        console.error('Error reactivating account:', updateError);
        setError('Failed to reactivate account. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      toast({
        title: "Account Reactivated",
        description: "Your account has been successfully reactivated. You can now sign in.",
      });

    } catch (error) {
      console.error('Error during account reactivation:', error);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {success && <CheckCircle className="h-5 w-5 text-green-500" />}
            {error && <XCircle className="h-5 w-5 text-destructive" />}
            Account Reactivation
          </CardTitle>
          <CardDescription>
            {loading && "Processing your reactivation request..."}
            {success && "Your account has been successfully reactivated"}
            {error && "Unable to reactivate your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="text-center text-muted-foreground">
              Please wait while we process your request.
            </div>
          )}
          
          {success && (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground">
                Your account deletion has been canceled. You can now sign in to your account normally.
              </div>
              <Button onClick={handleGoToLogin} className="w-full">
                Go to Sign In
              </Button>
            </div>
          )}
          
          {error && (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground">
                {error}
              </div>
              <Button onClick={handleGoToLogin} variant="outline" className="w-full">
                Go to Homepage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReactivateAccount;