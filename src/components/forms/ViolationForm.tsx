import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { ViolationFormData, HOA } from '../../types';
import { sendViolationNotification } from '../../utils/emailService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Label } from '../ui/label';

interface ViolationFormProps {
  hoaId: string;
}

const violationTypes = [
  'Parking Violation',
  'Landscaping/Maintenance',
  'Noise Complaint',
  'Pet Violation',
  'Architectural Violation',
  'Trash/Recycling',
  'Pool/Amenity Rules',
  'Other'
];

const validationSchema = Yup.object({
  type: Yup.string().required('Violation type is required'),
  address: Yup.string().required('Address is required'),
  description: Yup.string().required('Description is required').min(10, 'Please provide more details'),
  reporterEmail: Yup.string().email('Invalid email address'),
  reporterPhone: Yup.string().matches(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
});

const ViolationForm: React.FC<ViolationFormProps> = ({ hoaId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const uploadPhotos = async (photos: File[]): Promise<string[]> => {
    const uploadPromises = photos.map(async (photo) => {
      const photoRef = ref(storage, `violations/${hoaId}/${Date.now()}_${photo.name}`);
      await uploadBytes(photoRef, photo);
      return getDownloadURL(photoRef);
    });
    
    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (values: ViolationFormData, { resetForm }: any) => {
    setIsSubmitting(true);
    
    try {
      let photoUrls: string[] = [];
      if (values.photos.length > 0) {
        photoUrls = await uploadPhotos(values.photos);
      }

      const violationData = {
        hoaId,
        type: values.type,
        address: values.address,
        description: values.description,
        photos: photoUrls,
        reporterEmail: values.reporterEmail || '',
        reporterPhone: values.reporterPhone || '',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'violations'), violationData);
      
      // Get HOA data for email notification
      try {
        const hoaDoc = await getDoc(doc(db, 'hoas', hoaId));
        if (hoaDoc.exists()) {
          const hoaData = hoaDoc.data() as HOA;
          await sendViolationNotification({
            violation: { id: docRef.id, ...violationData },
            hoa: hoaData,
          });
        }
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // Don't fail the whole submission if email fails
      }
      
      setSubmitSuccess(true);
      resetForm();
    } catch (error) {
      console.error('Error submitting violation:', error);
      alert('There was an error submitting your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-card rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Report Submitted Successfully!
        </h2>
        <p className="text-muted-foreground mb-6">
          Thank you for your report. Our admin team will review it and take appropriate action.
        </p>
        <Button onClick={() => setSubmitSuccess(false)}>
          Submit Another Report
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-lg p-8">
      <Formik
        initialValues={{
          type: '',
          address: '',
          description: '',
          photos: [] as File[],
          reporterEmail: '',
          reporterPhone: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, values }) => (
          <Form className="space-y-6">
            <div>
              <Label htmlFor="type">Violation Type *</Label>
              <Field name="type">
                {({ field }: any) => (
                  <Select {...field} id="type">
                    <option value="">Select violation type</option>
                    {violationTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <ErrorMessage name="type" component="div" className="text-destructive text-sm mt-1" />
            </div>

            <div>
              <Label htmlFor="address">Property Address *</Label>
              <Field name="address">
                {({ field }: any) => (
                  <Input {...field} id="address" placeholder="123 Main Street" />
                )}
              </Field>
              <ErrorMessage name="address" component="div" className="text-destructive text-sm mt-1" />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Field name="description">
                {({ field }: any) => (
                  <Textarea 
                    {...field} 
                    id="description" 
                    placeholder="Please provide detailed information about the violation..."
                    rows={4}
                  />
                )}
              </Field>
              <ErrorMessage name="description" component="div" className="text-destructive text-sm mt-1" />
            </div>

            <div>
              <Label htmlFor="photos">Photos (Optional)</Label>
              <Input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  setFieldValue('photos', files);
                }}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                You can upload multiple photos to support your report
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reporterEmail">Your Email (Optional)</Label>
                <Field name="reporterEmail">
                  {({ field }: any) => (
                    <Input {...field} id="reporterEmail" type="email" placeholder="your@email.com" />
                  )}
                </Field>
                <ErrorMessage name="reporterEmail" component="div" className="text-destructive text-sm mt-1" />
              </div>

              <div>
                <Label htmlFor="reporterPhone">Your Phone (Optional)</Label>
                <Field name="reporterPhone">
                  {({ field }: any) => (
                    <Input {...field} id="reporterPhone" type="tel" placeholder="(555) 123-4567" />
                  )}
                </Field>
                <ErrorMessage name="reporterPhone" component="div" className="text-destructive text-sm mt-1" />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ViolationForm;