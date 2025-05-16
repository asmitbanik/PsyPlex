import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Process the OAuth callback
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (!accessToken) {
          toast.error('Authentication failed', {
            description: 'No access token found in the callback URL'
          });
          navigate('/login');
          return;
        }

        // Exchange the auth code for a session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data?.session) {
          toast.success('Successfully signed in with Google');
          navigate('/therapist'); // Redirect to dashboard
        } else {
          navigate('/login'); // Redirect to login page if no session was created
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        toast.error('Authentication error', {
          description: error instanceof Error ? error.message : 'Failed to complete authentication'
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Completing authentication...</h2>
        <p className="text-muted-foreground">Please wait while we finalize your sign in.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
