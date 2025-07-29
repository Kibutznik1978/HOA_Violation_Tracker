import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import HOAManagement from '../components/admin/HOAManagement';
import UserManagement from '../components/admin/UserManagement';

const SuperAdminDashboard: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'hoas' | 'users' | 'subscriptions'>('hoas');

  console.log('🔍 SuperAdmin - Current user:', user, 'Loading:', loading, 'Role check:', user?.role, 'Is super_admin?', user?.role === 'super_admin');
  
  // Show loading while auth is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  // Only redirect after loading is complete and user is not super admin
  if (!user || user.role !== 'super_admin') {
    console.log('🔍 SuperAdmin - Redirecting to super admin login. User:', user, 'Role:', user?.role);
    return <Navigate to="/super-admin/login" replace />;
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
              Manage HOAs, users, subscriptions, and system-wide settings
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Logged in as: {user.email}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </header>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'hoas' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('hoas')}
            className="px-4 py-2"
          >
            HOA Management
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="px-4 py-2"
          >
            User Management
          </Button>
          <Button
            variant={activeTab === 'subscriptions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('subscriptions')}
            className="px-4 py-2"
          >
            Subscriptions
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'hoas' && <HOAManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Subscription Management</h2>
            <p className="text-muted-foreground">
              Manage HOA subscriptions and payment processing. Individual HOA subscription setup is handled through their respective admin panels.
            </p>
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Subscription Overview</h3>
              <p className="text-sm text-muted-foreground">
                All subscription management and Stripe integration will be available here. 
                For now, you can manage subscription status through the HOA Management tab.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;