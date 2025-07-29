import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { HOA } from '../types';
import { Button } from '../components/ui/button';

const HomePage: React.FC = () => {
  const { hoaId } = useParams<{ hoaId: string }>();
  const [hoa, setHoa] = useState<HOA | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadHoa = async () => {
      if (!hoaId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const hoaDoc = await getDoc(doc(db, 'hoas', hoaId));
        if (hoaDoc.exists()) {
          setHoa({ id: hoaDoc.id, ...hoaDoc.data() } as HOA);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading HOA:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadHoa();
  }, [hoaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (notFound || !hoa) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">HOA Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The HOA you're looking for doesn't exist or may have been removed.
          </p>
          <Link to="/demo">
            <Button>Go to Demo HOA</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {hoa.name}
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              {hoa.address}
            </p>
            <p className="text-xl text-muted-foreground">
              Report violations in your community quickly and easily
            </p>
          </header>

          <div className="bg-card rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Submit a Violation Report</h2>
            <p className="text-muted-foreground mb-6">
              Use the form below to report any violations you've observed in your community. 
              Include as much detail as possible to help our admin team address the issue promptly.
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Common Violation Types:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {hoa.violationTypes.map((type, index) => (
                  <div key={index} className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded">
                    {type}
                  </div>
                ))}
              </div>
            </div>
            
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