/**
 * Authentication Types
 * 
 * Types for better-auth integration
 */

// User role types for healthcare application
export type UserRole = 'clinician' | 'admin' | 'staff';

// Extended user type with healthcare provider fields
export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  // Healthcare provider specific fields
  role?: UserRole;
  organization?: string;
  npi?: string; // National Provider Identifier
  specialty?: string;
}

// Session type
export interface Session {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
  };
  user: User;
}

// Sign in credentials
export interface SignInCredentials {
  email: string;
  password: string;
}

// Sign up data
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  organization?: string;
  specialty?: string;
  npi?: string;
}

// Auth context value
export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}
