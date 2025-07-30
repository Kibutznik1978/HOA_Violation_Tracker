import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Check, ChevronLeft, ChevronRight, Home, User, CreditCard, Settings, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createHOAAccount, OnboardingData as ServiceOnboardingData } from '../services/onboardingService';
import { StateSelect } from '../components/ui/state-select';
import { SimpleAddressAutocomplete, AddressComponents } from '../components/ui/simple-address-autocomplete';
import { formatPhoneNumber, formatZipCode } from '../utils/formatters';

interface OnboardingData {
  // Step 1: HOA Information
  hoaName: string;
  hoaAddress: string;
  hoaCity: string;
  hoaState: string;
  hoaZip: string;
  hoaPhone: string;
  
  // Step 2: Admin Account
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirm: string;
  
  // Step 3: Payment (handled by Stripe)
  
  // Step 4: Customization
  violationTypes: string[];
  customViolationType: string;
  primaryColor: string;
  logoUrl: string;
}

const steps = [
  { id: 1, title: 'HOA Information', icon: Home, description: 'Basic details about your community' },
  { id: 2, title: 'Admin Account', icon: User, description: 'Create your administrator account' },
  { id: 3, title: 'Payment Setup', icon: CreditCard, description: 'Subscribe to start using the service' },
  { id: 4, title: 'Customization', icon: Settings, description: 'Configure violation types and branding' },
  { id: 5, title: 'Complete', icon: CheckCircle, description: 'Your HOA is ready to go!' }
];

const defaultViolationTypes = [
  'Landscaping/Yard Maintenance',
  'Architectural Violations',
  'Parking Violations',
  'Pet Policy Violations',
  'Noise Complaints',
  'Trash/Recycling Issues',
  'Pool/Amenity Violations',
  'Commercial Activity'
];

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdHoaId, setCreatedHoaId] = useState<string | null>(null);
  const navigate = useNavigate();

  const formik = useFormik<OnboardingData>({
    initialValues: {
      hoaName: '',
      hoaAddress: '',
      hoaCity: '',
      hoaState: '',
      hoaZip: '',
      hoaPhone: '',
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminPassword: '',
      adminPasswordConfirm: '',
      violationTypes: [...defaultViolationTypes],
      customViolationType: '',
      primaryColor: '#3B82F6',
      logoUrl: ''
    },
    validationSchema: Yup.object({
      hoaName: Yup.string().min(3, 'HOA name must be at least 3 characters').required('HOA name is required'),
      hoaAddress: Yup.string().min(5, 'Please enter a complete address').required('Address is required'),
      hoaCity: Yup.string().min(2, 'City must be at least 2 characters').required('City is required'),
      hoaState: Yup.string().length(2, 'Please select a valid state').required('State is required'),
      hoaZip: Yup.string().matches(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code').required('ZIP code is required'),
      hoaPhone: Yup.string().matches(/^\(\d{3}\) \d{3}-\d{4}$/, 'Please enter a valid phone number').required('Phone number is required'),
      adminFirstName: Yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
      adminLastName: Yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
      adminEmail: Yup.string().email('Invalid email address').required('Email is required'),
      adminPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
      adminPasswordConfirm: Yup.string()
        .oneOf([Yup.ref('adminPassword')], 'Passwords must match')
        .required('Please confirm your password')
    }),
    onSubmit: async (values) => {
      // Don't handle form submission here - use button handlers instead
    }
  });

  const handleAddressSelect = (addressComponents: AddressComponents) => {
    // Auto-fill city, state, and ZIP from address selection
    if (addressComponents.city) {
      formik.setFieldValue('hoaCity', addressComponents.city);
    }
    if (addressComponents.state) {
      formik.setFieldValue('hoaState', addressComponents.state);
    }
    if (addressComponents.zipCode) {
      formik.setFieldValue('hoaZip', addressComponents.zipCode);
    }
  };

  const handleCompleteOnboarding = async (values: OnboardingData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert form data to service format
      const serviceData: ServiceOnboardingData = {
        hoaName: values.hoaName,
        hoaAddress: values.hoaAddress,
        hoaCity: values.hoaCity,
        hoaState: values.hoaState,
        hoaZip: values.hoaZip,
        hoaPhone: values.hoaPhone,
        adminFirstName: values.adminFirstName,
        adminLastName: values.adminLastName,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
        violationTypes: values.violationTypes,
        primaryColor: values.primaryColor,
        logoUrl: values.logoUrl
      };

      // Create HOA account in Firebase
      const result = await createHOAAccount(serviceData);
      setCreatedHoaId(result.hoaId);
      
      // Navigate to success page with HOA ID
      navigate('/onboarding/success', { 
        state: { 
          hoaId: result.hoaId,
          hoaName: values.hoaName,
          adminEmail: values.adminEmail
        }
      });
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setError(error.message || 'Failed to create your HOA account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addCustomViolationType = () => {
    if (formik.values.customViolationType.trim()) {
      formik.setFieldValue('violationTypes', [
        ...formik.values.violationTypes,
        formik.values.customViolationType.trim()
      ]);
      formik.setFieldValue('customViolationType', '');
    }
  };

  const removeViolationType = (index: number) => {
    const newTypes = formik.values.violationTypes.filter((_, i) => i !== index);
    formik.setFieldValue('violationTypes', newTypes);
  };

  const goToNextStep = () => {
    const currentStepValid = validateCurrentStep();
    if (currentStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = (): boolean => {
    const errors = formik.errors;
    
    switch (currentStep) {
      case 1:
        return !errors.hoaName && !errors.hoaAddress && !errors.hoaCity && !errors.hoaState && !errors.hoaZip && !errors.hoaPhone;
      case 2:
        return !errors.adminFirstName && !errors.adminLastName && !errors.adminEmail && !errors.adminPassword && !errors.adminPasswordConfirm;
      case 3:
        return true; // Payment validation handled by Stripe
      case 4:
        return formik.values.violationTypes.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="hoaName">HOA/Community Name *</Label>
              <Input
                id="hoaName"
                name="hoaName"
                placeholder="Sunset Gardens HOA"
                value={formik.values.hoaName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.hoaName && formik.errors.hoaName ? 'border-red-500' : ''}
              />
              {formik.touched.hoaName && formik.errors.hoaName && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.hoaName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="hoaAddress">Community Address *</Label>
              <SimpleAddressAutocomplete
                value={formik.values.hoaAddress}
                onChange={(value) => formik.setFieldValue('hoaAddress', value)}
                onAddressSelect={handleAddressSelect}
                onBlur={() => formik.setFieldTouched('hoaAddress', true)}
                placeholder="Start typing your address..."
                className={formik.touched.hoaAddress && formik.errors.hoaAddress ? 'border-red-500' : ''}
              />
              {formik.touched.hoaAddress && formik.errors.hoaAddress && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.hoaAddress}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Start typing and select from suggestions for auto-completion
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hoaCity">City *</Label>
                <Input
                  id="hoaCity"
                  name="hoaCity"
                  placeholder="Phoenix"
                  value={formik.values.hoaCity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.touched.hoaCity && formik.errors.hoaCity ? 'border-red-500' : ''}
                />
                {formik.touched.hoaCity && formik.errors.hoaCity && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.hoaCity}</p>
                )}
              </div>
              <div>
                <Label htmlFor="hoaState">State *</Label>
                <StateSelect
                  value={formik.values.hoaState}
                  onChange={(value) => formik.setFieldValue('hoaState', value)}
                  onBlur={() => formik.setFieldTouched('hoaState', true)}
                  className={formik.touched.hoaState && formik.errors.hoaState ? 'border-red-500' : ''}
                  placeholder="Select state..."
                />
                {formik.touched.hoaState && formik.errors.hoaState && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.hoaState}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hoaZip">ZIP Code *</Label>
                <Input
                  id="hoaZip"
                  name="hoaZip"
                  placeholder="85001"
                  value={formik.values.hoaZip}
                  onChange={(e) => {
                    const formatted = formatZipCode(e.target.value);
                    formik.setFieldValue('hoaZip', formatted);
                  }}
                  onBlur={formik.handleBlur}
                  className={formik.touched.hoaZip && formik.errors.hoaZip ? 'border-red-500' : ''}
                  maxLength={10}
                />
                {formik.touched.hoaZip && formik.errors.hoaZip && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.hoaZip}</p>
                )}
              </div>
              <div>
                <Label htmlFor="hoaPhone">Phone Number *</Label>
                <Input
                  id="hoaPhone"
                  name="hoaPhone"
                  placeholder="(555) 123-4567"
                  value={formik.values.hoaPhone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    formik.setFieldValue('hoaPhone', formatted);
                  }}
                  onBlur={formik.handleBlur}
                  className={formik.touched.hoaPhone && formik.errors.hoaPhone ? 'border-red-500' : ''}
                  maxLength={14}
                />
                {formik.touched.hoaPhone && formik.errors.hoaPhone && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.hoaPhone}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminFirstName">First Name *</Label>
                <Input
                  id="adminFirstName"
                  name="adminFirstName"
                  placeholder="John"
                  value={formik.values.adminFirstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.touched.adminFirstName && formik.errors.adminFirstName ? 'border-red-500' : ''}
                />
                {formik.touched.adminFirstName && formik.errors.adminFirstName && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.adminFirstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="adminLastName">Last Name *</Label>
                <Input
                  id="adminLastName"
                  name="adminLastName"
                  placeholder="Smith"
                  value={formik.values.adminLastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.touched.adminLastName && formik.errors.adminLastName ? 'border-red-500' : ''}
                />
                {formik.touched.adminLastName && formik.errors.adminLastName && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.adminLastName}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="adminEmail">Email Address *</Label>
              <Input
                id="adminEmail"
                name="adminEmail"
                type="email"
                placeholder="admin@sunsetgardens.com"
                value={formik.values.adminEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.adminEmail && formik.errors.adminEmail ? 'border-red-500' : ''}
              />
              {formik.touched.adminEmail && formik.errors.adminEmail && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.adminEmail}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">This will be your login email</p>
            </div>

            <div>
              <Label htmlFor="adminPassword">Password *</Label>
              <Input
                id="adminPassword"
                name="adminPassword"
                type="password"
                placeholder="••••••••"
                value={formik.values.adminPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.adminPassword && formik.errors.adminPassword ? 'border-red-500' : ''}
              />
              {formik.touched.adminPassword && formik.errors.adminPassword && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.adminPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="adminPasswordConfirm">Confirm Password *</Label>
              <Input
                id="adminPasswordConfirm"
                name="adminPasswordConfirm"
                type="password"
                placeholder="••••••••"
                value={formik.values.adminPasswordConfirm}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.adminPasswordConfirm && formik.errors.adminPasswordConfirm ? 'border-red-500' : ''}
              />
              {formik.touched.adminPasswordConfirm && formik.errors.adminPasswordConfirm && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.adminPasswordConfirm}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Plan</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $29<span className="text-xl text-gray-600">.99</span>
                </div>
                <p className="text-gray-600">per month</p>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  'Unlimited violation submissions',
                  'Full admin dashboard',
                  'Automated email notifications',
                  'Photo upload & storage',
                  'Custom violation types',
                  'Priority support'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-4">
                  Enter your payment information to start your 14-day free trial
                </p>
                <div className="text-center">
                  <div className="bg-gray-100 p-8 rounded-lg">
                    <p className="text-gray-500">Stripe Payment Form</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Payment integration will be implemented here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Violation Types</Label>
              <p className="text-gray-600 mb-4">
                Configure the types of violations residents can report. You can customize these later.
              </p>
              
              <div className="space-y-2 mb-4">
                {formik.values.violationTypes.map((type, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{type}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeViolationType(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom violation type"
                  value={formik.values.customViolationType}
                  onChange={(e) => formik.setFieldValue('customViolationType', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomViolationType()}
                />
                <Button type="button" onClick={addCustomViolationType}>
                  Add
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="color"
                  id="primaryColor"
                  name="primaryColor"
                  value={formik.values.primaryColor}
                  onChange={formik.handleChange}
                  className="w-16 h-10 rounded border"
                />
                <Input
                  value={formik.values.primaryColor}
                  onChange={formik.handleChange}
                  name="primaryColor"
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">This color will be used for buttons and accents</p>
            </div>

            <div>
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                name="logoUrl"
                placeholder="https://example.com/logo.png"
                value={formik.values.logoUrl}
                onChange={formik.handleChange}
              />
              <p className="text-sm text-gray-500 mt-1">Add your HOA logo to customize the violation form</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to HOA Connect!</h2>
              <p className="text-gray-600">
                Your HOA is now set up and ready to receive violation reports.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg text-left">
              <h3 className="font-semibold mb-3">Your HOA Details:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {formik.values.hoaName}</p>
                <p><strong>URL:</strong> hoaconnect.com/{createdHoaId || formik.values.hoaName.toLowerCase().replace(/\s+/g, '-')}</p>
                <p><strong>Admin Email:</strong> {formik.values.adminEmail}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => navigate(`/${createdHoaId || formik.values.hoaName.toLowerCase().replace(/\s+/g, '-')}/admin/dashboard`)}>
                Go to Admin Dashboard
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/${createdHoaId || formik.values.hoaName.toLowerCase().replace(/\s+/g, '-')}`)}>
                View Public Page
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted
                        ? 'bg-green-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden md:block w-24 h-0.5 bg-gray-300 absolute mt-6 ml-12" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
            <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
                {error}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={formik.handleSubmit}>
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPrevStep}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={goToNextStep}
                    className="flex items-center"
                    disabled={!validateCurrentStep()}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleCompleteOnboarding(formik.values)}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    {isLoading ? 'Setting up...' : 'Complete Setup'}
                    <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;