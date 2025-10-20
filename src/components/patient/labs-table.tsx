'use client';

import type { Bundle, Observation } from '@medplum/fhirtypes';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { formatCodeableConcept, formatObservationValue } from '@/lib/fhir-utils';
import { formatDateShort } from '@/lib/utils';

interface LabsTableProps {
  observations: Bundle<Observation> | null;
  isLoading: boolean;
  error: Error | null;
}

export function LabsTable({ observations, isLoading, error }: LabsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading lab results: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!(observations && observations.entry) || observations.entry.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No lab results available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Test</th>
            <th className="px-4 py-3 text-left font-medium">Value</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {observations.entry.map((entry, index) => {
            const obs = entry.resource;
            if (!obs) return null;

            return (
              <tr key={index} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium">{formatCodeableConcept(obs.code)}</span>
                  {obs.interpretation && obs.interpretation.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({formatCodeableConcept(obs.interpretation[0])})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono">
                  {formatObservationValue(obs)}
                  {obs.referenceRange && obs.referenceRange.length > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Ref: {obs.referenceRange[0].low?.value ?? '?'} -{' '}
                      {obs.referenceRange[0].high?.value ?? '?'})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(
                      obs.status
                    )}`}
                  >
                    {obs.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateShort(obs.effectiveDateTime)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'final':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'preliminary':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'amended':
    case 'corrected':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'cancelled':
    case 'entered-in-error':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
}
