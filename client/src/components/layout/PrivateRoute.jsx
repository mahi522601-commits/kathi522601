import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import  LoadingSpinner  from '../ui/LoadingSpinner';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner label="Loading your account" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }

  return children;
}
