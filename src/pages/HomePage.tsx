import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const HomePage: React.FC = () => {
  const { hoaId } = useParams<{ hoaId: string }>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              HOA Violation Reporting
            </h1>
            <p className="text-xl text-muted-foreground">
              Report violations in your community quickly and easily
            </p>
          </header>

          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Submit a Violation Report</h2>
            <p className="text-muted-foreground mb-6">
              Use the form below to report any violations you've observed in your community. 
              Include as much detail as possible to help our admin team address the issue.
            </p>
            
            <Link to={`/${hoaId}/submit`}>
              <Button size="lg" className="w-full md:w-auto">
                Submit Violation Report
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link 
              to={`/${hoaId}/admin`} 
              className="text-primary hover:underline"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;