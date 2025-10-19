'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, User } from 'lucide-react';
import type { FhirPatient } from '@/types';
import { formatPatientName, getPatientAge, formatGender } from '@/lib/fhir-utils';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PatientBannerProps {
  patient: FhirPatient | null;
  isLoading: boolean;
  error: Error | null;
}

export function PatientBanner({ patient, isLoading, error }: PatientBannerProps) {
  if (isLoading) {
    return (
      <div className="border-b bg-muted/50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Spinner size="md" />
            <span className="text-muted-foreground">Loading patient information...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-b bg-muted/50">
        <div className="container py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading patient: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="border-b bg-muted/50">
        <div className="container py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No patient data available. Make sure you have a valid token and patient context.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b bg-gradient-to-r from-primary/10 to-primary/5"
    >
      <div className="container py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">{formatPatientName(patient)}</h2>
                  {patient.active === false && (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <span className="font-medium text-muted-foreground">Gender:</span>{' '}
                    <span>{formatGender(patient.gender)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Age:</span>{' '}
                    <span>{getPatientAge(patient)} years</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">DOB:</span>{' '}
                    <span>{formatDate(patient.birthDate)}</span>
                  </div>
                  {patient.identifier && patient.identifier[0] && (
                    <div>
                      <span className="font-medium text-muted-foreground">MRN:</span>{' '}
                      <span className="font-mono">{patient.identifier[0].value || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
