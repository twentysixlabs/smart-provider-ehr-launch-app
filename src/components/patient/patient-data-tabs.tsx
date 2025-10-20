'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TokenData } from '@/types';
import { DataViewer } from './data-viewer';
import { PatientOverview } from './patient-overview';

interface PatientDataTabsProps {
  fhirBaseUrl: string | null;
  token: TokenData | null;
}

export function PatientDataTabs({ fhirBaseUrl, token }: PatientDataTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="data-viewer">Data Viewer</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-6">
        <PatientOverview fhirBaseUrl={fhirBaseUrl} token={token} />
      </TabsContent>
      <TabsContent value="data-viewer" className="space-y-6">
        <DataViewer fhirBaseUrl={fhirBaseUrl} token={token} />
      </TabsContent>
    </Tabs>
  );
}
