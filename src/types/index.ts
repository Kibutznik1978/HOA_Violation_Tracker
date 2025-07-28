export interface Violation {
  id: string;
  hoaId: string;
  type: string;
  address: string;
  description: string;
  photos: string[];
  reporterEmail?: string;
  reporterPhone?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

export interface HOA {
  id: string;
  name: string;
  address: string;
  adminEmail: string;
  additionalEmails: string[];
  subscriptionStatus: 'active' | 'inactive' | 'pending';
  subscriptionId?: string;
  violationTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: 'hoa_admin' | 'super_admin';
  hoaId?: string;
  createdAt: Date;
}

export interface ViolationFormData {
  type: string;
  address: string;
  description: string;
  photos: File[];
  reporterEmail?: string;
  reporterPhone?: string;
}