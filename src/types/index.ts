/**
 * Central type exports for the application
 */

// Re-export FHIR types
export * from './fhir';

// Re-export SMART types
export * from './smart';

// Re-export Vendor types
export * from './vendor';

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: Error | null;
}

// Data display props
export interface DataDisplayProps<T> extends LoadingState {
  data: T | null | undefined;
}

// Common button variants
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

// Form validation
export interface FormFieldError {
  message: string;
  type: string;
}

// Navigation
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

// Tab interface
export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

// Theme
export type Theme = 'light' | 'dark' | 'system';
