import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { hoaId } = useParams<{ hoaId: string }>();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/${hoaId}/admin`} replace />;
  }

  if (user.hoaId && user.hoaId !== hoaId && user.role !== 'super_admin') {
    return <Navigate to={`/${user.hoaId}/admin/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;