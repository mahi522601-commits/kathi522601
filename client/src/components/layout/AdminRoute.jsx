import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Checking admin access" />;
  }

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
}
