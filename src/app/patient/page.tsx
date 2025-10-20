'use client';

import { LogOut, User as UserIcon } from 'lucide-react';
import { PatientBanner } from '@/components/patient/patient-banner';
import { PatientDataTabs } from '@/components/patient/patient-data-tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import configData from '@/config/config.json';
import { useAuth } from '@/hooks/use-auth';
import { usePatientQuery } from '@/hooks/use-fhir-query';
import { storage } from '@/lib/storage';
import { useTokenStore } from '@/stores/token-store';
import type { AppConfig } from '@/types';

const Config = configData as AppConfig;

export default function PatientPage() {
  const { user, signOut: authSignOut } = useAuth();
  const token = useTokenStore((state) => state.token);
  const clearToken = useTokenStore((state) => state.clearToken);
  const clearVendor = useVendorStore((state) => state.clearVendor);
  const fhirBaseUrl = storage.getItem(Config.STORAGE_KEYS.FHIR_BASE_URL);

  const {
    data: patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = usePatientQuery(fhirBaseUrl, token);

  const handleLogout = async () => {
    // Clear SMART on FHIR tokens
    clearToken();
    clearVendor();
    storage.clear();

    // Sign out from backend auth
    await authSignOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">SMART on FHIR Provider Launch</h1>
          </div>
          <div className="flex items-center gap-2">
            <VendorBadge />
            {user && (
              <div className="flex items-center gap-2 mr-2 px-3 py-1 rounded-md bg-muted">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Patient Banner */}
      <PatientBanner patient={patient ?? null} isLoading={isLoadingPatient} error={patientError} />

      {/* Main Content */}
      <main className="container py-6">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Welcome to the SMART on FHIR Provider EHR Launch example application!
          </p>
        </div>

        <PatientDataTabs fhirBaseUrl={fhirBaseUrl} token={token} />
      </main>
    </div>
  );
}
