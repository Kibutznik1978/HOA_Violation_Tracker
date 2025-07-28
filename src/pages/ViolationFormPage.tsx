import React from 'react';
import { useParams } from 'react-router-dom';
import ViolationForm from '../components/forms/ViolationForm';

const ViolationFormPage: React.FC = () => {
  const { hoaId } = useParams<{ hoaId: string }>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Submit Violation Report
            </h1>
            <p className="text-muted-foreground">
              Please provide details about the violation you've observed
            </p>
          </header>

          <ViolationForm hoaId={hoaId!} />
        </div>
      </div>
    </div>
  );
};

export default ViolationFormPage;