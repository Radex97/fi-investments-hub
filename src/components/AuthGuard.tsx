
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard = ({ children, requireAdmin = false }: AuthGuardProps) => {
  const { user, isAdmin, adminLoading } = useAuth();
  const navigate = useNavigate();
  const [checkComplete, setCheckComplete] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Handle user authentication check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        console.log('AuthGuard: No user found, redirecting to login');
        navigate('/login', { replace: true });
      } else {
        setCheckComplete(true);
      }
    }, 300); // Small delay to avoid flashing content

    return () => clearTimeout(timer);
  }, [user, navigate]);

  // Handle admin permission check with debounce to prevent rapid redirects
  useEffect(() => {
    if (requireAdmin && user && !adminLoading && !isAdmin && !redirecting) {
      console.log('AuthGuard: User is not admin, redirecting to dashboard');
      setRedirecting(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [requireAdmin, user, adminLoading, isAdmin, navigate, redirecting]);

  // Show nothing while still checking auth
  if (!checkComplete || !user) return null;
  
  // Show loading state while checking admin status
  if (requireAdmin && adminLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="space-y-4 w-[600px] max-w-[90vw]">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  // Don't render children if admin is required but user is not admin
  if (requireAdmin && !isAdmin) return null;

  return <>{children}</>;
};

export default AuthGuard;
