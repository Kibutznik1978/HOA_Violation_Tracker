import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface AdminLoginFormProps {
  hoaId: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ hoaId }) => {
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }, { setSubmitting }: any) => {
    setLoginError('');
    
    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        navigate(`/${hoaId}/admin/dashboard`);
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
                <Input {...field} id="email" type="email" placeholder="admin@example.com" />
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
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default AdminLoginForm;