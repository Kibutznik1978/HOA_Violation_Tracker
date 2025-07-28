import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import HOAManagement from '../components/admin/HOAManagement';

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/demo" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage HOAs, subscriptions, and system-wide settings
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Logged in as: {user.email}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </header>

        <HOAManagement />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;