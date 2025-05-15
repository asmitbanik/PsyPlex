import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// This component handles auth redirects to ensure users are sent to the dashboard
// after successful authentication (especially with OAuth)
const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there are auth params in the URL (from OAuth redirect)
    const checkForAuthRedirect = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('User is authenticated, redirecting to dashboard');
          toast.success('Successfully signed in');
          navigate('/therapist');
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };

    checkForAuthRedirect();

    // Also set up a listener for future auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, redirecting to dashboard');
        toast.success('Successfully signed in');
        navigate('/therapist');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // This component doesn't render anything visible
  return null;
};

export default AuthRedirect;
