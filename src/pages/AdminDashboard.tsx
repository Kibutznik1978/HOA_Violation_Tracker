import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import ViolationList from '../components/admin/ViolationList';

const AdminDashboard: React.FC = () => {
  const { hoaId } = useParams<{ hoaId: string }>();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage violation reports for your HOA
            </p>
            {user && (
              <p className="text-sm text-muted-foreground mt-1">
                Logged in as: {user.email}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </header>

        <ViolationList hoaId={hoaId!} />
      </div>
    </div>
  );
};

export default AdminDashboard;