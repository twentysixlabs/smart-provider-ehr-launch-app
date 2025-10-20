'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Something went wrong
          </CardTitle>
          <CardDescription>An unexpected error occurred in the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4">
            <p className="text-sm font-mono text-destructive break-words">{error.message}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => reset()} className="flex-1">
              Try again
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
              className="flex-1"
            >
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
