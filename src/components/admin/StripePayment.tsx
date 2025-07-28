import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionFormProps {
  hoaId: string;
  onSuccess: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ hoaId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Here you would typically call your backend to create a subscription
      // For now, we'll just simulate success
      console.log('Payment method created:', paymentMethod);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Payment Information</Label>
        <div className="mt-2 p-3 border border-input rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}

      <div className="bg-muted p-4 rounded-md">
        <h3 className="font-semibold">HOA Violation Reporting - Monthly Subscription</h3>
        <p className="text-sm text-muted-foreground">$29.99 per month</p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1">
          <li>• Unlimited violation reports</li>
          <li>• Admin panel access</li>
          <li>• Email notifications</li>
          <li>• Photo upload support</li>
          <li>• 24/7 customer support</li>
        </ul>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Subscribe for $29.99/month'}
      </Button>
    </form>
  );
};

interface StripePaymentProps {
  hoaId: string;
  onSuccess: () => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({ hoaId, onSuccess }) => {
  return (
    <Elements stripe={stripePromise}>
      <div className="max-w-md mx-auto">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Setup Subscription</h2>
          <SubscriptionForm hoaId={hoaId} onSuccess={onSuccess} />
        </div>
      </div>
    </Elements>
  );
};

export default StripePayment;