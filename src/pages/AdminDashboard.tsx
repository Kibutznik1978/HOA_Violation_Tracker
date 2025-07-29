import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import ViolationList from '../components/admin/ViolationList';
import HOASettings from '../components/admin/HOASettings';

const AdminDashboard: React.FC = () => {
  const { hoaId } = useParams<{ hoaId: string }>();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'violations' | 'settings'>('violations');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage violation reports and HOA settings
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

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'violations' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('violations')}
            className="px-4 py-2"
          >
            Violations
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="px-4 py-2"
          >
            Settings
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'violations' && <ViolationList hoaId={hoaId!} />}
        {activeTab === 'settings' && <HOASettings hoaId={hoaId!} />}
      </div>
    </div>
  );
};

export default AdminDashboard;