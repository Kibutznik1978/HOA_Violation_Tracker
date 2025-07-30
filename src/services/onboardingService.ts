import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export interface OnboardingData {
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
  
  // Step 4: Customization
  violationTypes: string[];
  primaryColor: string;
  logoUrl: string;
}

export interface HOADocument {
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  adminEmail: string;
  adminUid: string;
  violationTypes: string[];
  branding: {
    primaryColor: string;
    logoUrl: string;
  };
  subscriptionStatus: 'trial' | 'active' | 'inactive';
  trialEndsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument {
  email: string;
  firstName: string;
  lastName: string;
  role: 'hoa_admin' | 'super_admin';
  hoaId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const generateSlug = (hoaName: string): string => {
  return hoaName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

export const checkSlugAvailability = async (slug: string): Promise<boolean> => {
  try {
    const hoaDoc = await getDoc(doc(db, 'hoas', slug));
    return !hoaDoc.exists();
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return false;
  }
};

export const createUniqueSlug = async (baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;
  
  while (!(await checkSlugAvailability(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

export const createHOAAccount = async (data: OnboardingData): Promise<{ hoaId: string; userId: string }> => {
  try {
    // Step 1: Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.adminEmail,
      data.adminPassword
    );
    const user = userCredential.user;

    // Step 2: Generate unique slug for HOA
    const baseSlug = generateSlug(data.hoaName);
    const uniqueSlug = await createUniqueSlug(baseSlug);

    // Step 3: Create HOA document
    const hoaDocument: HOADocument = {
      name: data.hoaName,
      slug: uniqueSlug,
      address: data.hoaAddress,
      city: data.hoaCity,
      state: data.hoaState,
      zip: data.hoaZip,
      phone: data.hoaPhone,
      adminEmail: data.adminEmail,
      adminUid: user.uid,
      violationTypes: data.violationTypes || [
        'Landscaping/Yard Maintenance',
        'Architectural Violations',
        'Parking Violations',
        'Pet Policy Violations',
        'Noise Complaints',
        'Trash/Recycling Issues',
        'Pool/Amenity Violations',
        'Commercial Activity'
      ],
      branding: {
        primaryColor: data.primaryColor || '#3B82F6',
        logoUrl: data.logoUrl || ''
      },
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use the unique slug as the document ID
    await setDoc(doc(db, 'hoas', uniqueSlug), hoaDocument);

    // Step 4: Create user document
    const userDocument: UserDocument = {
      email: data.adminEmail,
      firstName: data.adminFirstName,
      lastName: data.adminLastName,
      role: 'hoa_admin',
      hoaId: uniqueSlug,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use the Firebase Auth UID as the document ID
    await setDoc(doc(db, 'users', user.uid), userDocument);

    return {
      hoaId: uniqueSlug,
      userId: user.uid
    };

  } catch (error: any) {
    console.error('Error creating HOA account:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already registered. Please use a different email or try logging in.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please choose a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address.');
    } else {
      throw new Error('Failed to create account. Please try again later.');
    }
  }
};

export const getHOABySlug = async (slug: string): Promise<HOADocument | null> => {
  try {
    const hoaDoc = await getDoc(doc(db, 'hoas', slug));
    if (hoaDoc.exists()) {
      return hoaDoc.data() as HOADocument;
    }
    return null;
  } catch (error) {
    console.error('Error fetching HOA by slug:', error);
    return null;
  }
};

export const updateHOASettings = async (
  hoaId: string, 
  updates: Partial<HOADocument>
): Promise<void> => {
  try {
    await setDoc(doc(db, 'hoas', hoaId), {
      ...updates,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating HOA settings:', error);
    throw new Error('Failed to update HOA settings. Please try again.');
  }
};