import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

// This component handles auth redirects to ensure users are sent to the dashboard
// after successful authentication (especially with OAuth)
const AuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) return;
    
    // If we're on the auth callback page, let that component handle the redirect
    if (location.pathname === '/auth/callback') return;

    // Only show welcome message once per session
    const showWelcomeMessage = () => {
      if (!hasShownWelcome) {
        toast.success('Welcome to PsyPlex', {
          description: 'You have successfully signed in'
        });
        setHasShownWelcome(true);
      }
    };

    // If user is logged in and not on a therapist page, redirect to dashboard
    if (user && !location.pathname.startsWith('/therapist')) {
      console.log('User is authenticated, redirecting to dashboard');
      showWelcomeMessage();
      navigate('/therapist');
    } 
    // If user is not logged in but trying to access protected pages, redirect to login
    else if (!user && location.pathname.startsWith('/therapist')) {
      console.log('User is not authenticated, redirecting to login');
      navigate('/login');
      toast.error('Authentication required', {
        description: 'Please sign in to access this page'
      });
    }
    // If user is logged in and on a therapist page, just show welcome message
    else if (user && location.pathname.startsWith('/therapist') && !hasShownWelcome) {
      showWelcomeMessage();
    }
  }, [user, loading, navigate, location.pathname, hasShownWelcome]);

  // This component doesn't render anything visible
  return null;
};

export default AuthRedirect;
