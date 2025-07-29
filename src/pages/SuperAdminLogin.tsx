import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const SuperAdminLogin: React.FC = () => {
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }, { setSubmitting }: any) => {
    setLoginError('');
    
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        // Let the auth system determine where to redirect
        // SuperAdminDashboard will handle the role check
        navigate('/super-admin');
      } else {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Super Admin Login
            </h1>
            <p className="text-muted-foreground">
              Access the system administration panel
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                {loginError && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
                    {loginError}
                  </div>
                )}

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Field name="email">
                    {({ field }: any) => (
                      <Input {...field} id="email" type="email" placeholder="superadmin@example.com" />
                    )}
                  </Field>
                  <ErrorMessage name="email" component="div" className="text-destructive text-sm mt-1" />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Field name="password">
                    {({ field }: any) => (
                      <Input {...field} id="password" type="password" placeholder="••••••••" />
                    )}
                  </Field>
                  <ErrorMessage name="password" component="div" className="text-destructive text-sm mt-1" />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Signing in...' : 'Sign In as Super Admin'}
                </Button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Looking for HOA admin access?{' '}
              <a href="/demo/admin" className="text-primary hover:underline">
                HOA Admin Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;