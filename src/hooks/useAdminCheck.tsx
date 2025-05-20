
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook to check if the current user has admin role
 * Uses the centralized admin state from AuthContext
 * @returns Object containing loading state, isAdmin flag and current state
 */
export const useAdminCheck = () => {
  const { isAdmin, adminLoading } = useAuth();
  
  // Convert to the expected format to maintain backward compatibility
  const state = adminLoading ? 'loading' : (isAdmin ? 'admin' : 'user');
  
  return {
    loading: adminLoading,
    isAdmin,
    state
  };
};
