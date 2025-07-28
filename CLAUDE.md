# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based HOA violation reporting web application with the following implemented features:

**Frontend Stack:**
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library for UI components
- Formik and Yup for form handling and validation
- React Router for navigation

**Backend Stack:**
- Firebase Firestore for database
- Firebase Authentication for user management
- Firebase Storage for photo uploads
- Firebase Cloud Functions for email notifications
- Stripe integration for payment processing ($29.99/month per HOA)

**Key Features Implemented:**
- ✅ Multi-tenant violation submission forms with photo uploads
- ✅ Auto-completing address input and violation type dropdowns
- ✅ HOA admin panels with full CRUD operations
- ✅ Real-time violation status updates
- ✅ Search and filter capabilities for admin panel
- ✅ Firebase Auth with role-based access (HOA admin vs super admin)
- ✅ Super admin functionality for HOA and subscription management
- ✅ Email notification system (requires Cloud Functions deployment)
- ✅ Stripe payment integration for subscriptions
- ✅ Protected routes and authentication flows

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Deploy to Firebase (requires Firebase CLI setup)
firebase deploy
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Input, etc.)
│   ├── forms/           # Form components (ViolationForm, AdminLoginForm)
│   ├── admin/           # Admin panel components
│   └── ProtectedRoute.tsx
├── pages/               # Page components for different routes
├── hooks/               # Custom React hooks (useAuth)
├── firebase/            # Firebase configuration
├── types/               # TypeScript type definitions
└── utils/               # Utility functions (cn, emailService)
```

## Route Structure

- `/` → Redirects to `/demo`
- `/:hoaId` → HOA homepage with violation submission link
- `/:hoaId/submit` → Violation submission form
- `/:hoaId/admin` → Admin login page
- `/:hoaId/admin/dashboard` → Admin dashboard (protected)
- `/super-admin` → Super admin dashboard for managing all HOAs

## Database Schema

**Collections:**
- `violations` - Individual violation reports
- `hoas` - HOA information and settings
- `users` - User accounts with roles

**Key Fields:**
- Violations: hoaId, type, address, description, photos[], status, timestamps
- HOAs: name, address, adminEmail, additionalEmails[], subscriptionStatus, violationTypes[]
- Users: email, role ('hoa_admin' | 'super_admin'), hoaId

## Environment Setup

Required environment variables in `.env`:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

## Authentication Flow

1. HOA admins log in via `/:hoaId/admin`
2. Protected routes check authentication status
3. Role-based access: HOA admins see their HOA only, super admins see all
4. Automatic redirection based on user role and HOA association

## Implementation Notes

- All forms use Formik with Yup validation
- Images are uploaded to Firebase Storage with organized folder structure
- Real-time updates using Firestore onSnapshot listeners
- Email notifications require Firebase Cloud Functions deployment
- Stripe integration ready for production with webhook handling
- Responsive design with mobile-first approach
- Type-safe throughout with comprehensive TypeScript types

## Next Steps for Production

1. Deploy Firebase Cloud Functions for email notifications
2. Set up Stripe webhooks for payment processing
3. Configure Firebase Security Rules
4. Set up proper error monitoring
5. Add comprehensive testing suite
6. Configure CI/CD pipeline