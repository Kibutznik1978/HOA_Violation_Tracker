import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLoginForm from '../components/forms/AdminLoginForm';

const AdminLoginPage: React.FC = () => {
  const { hoaId } = useParams<{ hoaId: string }>();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <header className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Admin Login
            </h1>
            <p className="text-muted-foreground">
              Sign in to access the admin panel
            </p>
          </header>

          <AdminLoginForm hoaId={hoaId!} />
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;