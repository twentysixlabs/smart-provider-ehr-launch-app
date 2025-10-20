'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import configData from '@/config/config.json';
import { handleOAuthCallback } from '@/lib/smart-auth';
import { useTokenStore } from '@/stores/token-store';
import type { AppConfig } from '@/types';

const Config = configData as AppConfig;

export default function SmartCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setToken = useTokenStore((state) => state.setToken);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      setError(errorDescription || errorParam);
      setIsProcessing(false);
      return;
    }

    if (!(code && state)) {
      setError('Missing authorization code or state parameter');
      setIsProcessing(false);
      return;
    }

    handleOAuthCallback(code, state, Config.CLIENT_ID)
      .then((tokenData) => {
        setToken(tokenData);
        setSuccess(true);
        setIsProcessing(false);

        // Redirect to patient data page after a brief delay
        setTimeout(() => {
          router.push('/patient');
        }, 1500);
      })
      .catch((err) => {
        console.error('OAuth callback failed:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to complete authorization. Please try again.'
        );
        setIsProcessing(false);
      });
  }, [searchParams, router, setToken]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Authorization Failed</CardTitle>
            <CardDescription>There was a problem completing the authorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Authorization Successful
            </CardTitle>
            <CardDescription>You have been successfully authorized</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Redirecting to patient data...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Processing Authorization</CardTitle>
          <CardDescription>
            {isProcessing ? 'Exchanging authorization code for tokens...' : 'Please wait...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" />
            <p className="text-center text-sm text-muted-foreground">
              This should only take a moment
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
