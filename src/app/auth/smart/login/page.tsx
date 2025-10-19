'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { initializeSmartAuth } from '@/lib/smart-auth';
import Config from '@/config/config.json';

export default function SmartLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const iss = searchParams.get('iss');
    const launch = searchParams.get('launch');

    if (!iss) {
      setError('Missing required parameter: iss (FHIR server URL)');
      setIsInitializing(false);
      return;
    }

    const redirectUri = `${Config.BASE_URL}/auth/smart/callback`;

    initializeSmartAuth(iss, Config.CLIENT_ID, redirectUri, Config.SMART_SCOPES, launch ?? undefined)
      .then((authUrl) => {
        // Redirect to authorization server
        window.location.href = authUrl;
      })
      .catch((err) => {
        console.error('SMART auth initialization failed:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to initialize SMART authorization. Please check your configuration.'
        );
        setIsInitializing(false);
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Authorization Error</CardTitle>
            <CardDescription>There was a problem initializing SMART authorization</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>SMART on FHIR Authorization</CardTitle>
          <CardDescription>
            {isInitializing
              ? 'Initializing authorization flow...'
              : 'Redirecting to authorization server...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-center text-sm text-muted-foreground">
              {isInitializing
                ? 'Please wait while we connect to the FHIR server'
                : 'You will be redirected shortly'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
