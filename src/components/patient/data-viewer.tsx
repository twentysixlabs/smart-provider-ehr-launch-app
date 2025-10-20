'use client';

import { AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAllergiesQuery,
  useConditionsQuery,
  useDevicesQuery,
  useEncounterQuery,
  useImmunizationsQuery,
  useMedicationRequestsQuery,
  useObservationsQuery,
  usePatientQuery,
} from '@/hooks/use-fhir-query';
import { useTokenExpiry } from '@/hooks/use-token-expiry';
import { useTokenRefresh } from '@/hooks/use-token-refresh';
import { useTokenStore } from '@/stores/token-store';
import type { TokenData } from '@/types';

interface DataViewerProps {
  fhirBaseUrl: string | null;
  token: TokenData | null;
}

export function DataViewer({ fhirBaseUrl, token }: DataViewerProps) {
  const expiryInfo = useTokenExpiry(token);
  const { refresh, isRefreshing, error: refreshError, isSuccess } = useTokenRefresh();

  const {
    data: patient,
    isLoading: loadingPatient,
    error: patientError,
  } = usePatientQuery(fhirBaseUrl, token);

  const {
    data: encounter,
    isLoading: loadingEncounter,
    error: encounterError,
  } = useEncounterQuery(fhirBaseUrl, token);

  const {
    data: observations,
    isLoading: loadingObs,
    error: obsError,
  } = useObservationsQuery(fhirBaseUrl, token);

  const {
    data: medications,
    isLoading: loadingMeds,
    error: medsError,
  } = useMedicationRequestsQuery(fhirBaseUrl, token);

  const {
    data: conditions,
    isLoading: loadingConds,
    error: condsError,
  } = useConditionsQuery(fhirBaseUrl, token);

  const {
    data: allergies,
    isLoading: loadingAllergies,
    error: allergiesError,
  } = useAllergiesQuery(fhirBaseUrl, token);

  const {
    data: immunizations,
    isLoading: loadingImmunizations,
    error: immunizationsError,
  } = useImmunizationsQuery(fhirBaseUrl, token);

  const {
    data: devices,
    isLoading: loadingDevices,
    error: devicesError,
  } = useDevicesQuery(fhirBaseUrl, token);

  return (
    <div className="space-y-6">
      {/* Token Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Token Information
          </CardTitle>
          <CardDescription>Current access token status and expiry information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Token Status</p>
              <p className="text-lg font-semibold">
                {expiryInfo.isExpired ? (
                  <span className="text-destructive">Expired</span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">Valid</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Time Remaining</p>
              <p className="text-lg font-semibold font-mono">{expiryInfo.timeRemaining}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patient ID</p>
              <p className="text-sm font-mono">{token?.patient || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Can Refresh</p>
              <p className="text-lg font-semibold">
                {expiryInfo.canRefresh ? (
                  <span className="text-green-600 dark:text-green-400">Yes</span>
                ) : (
                  <span className="text-muted-foreground">No</span>
                )}
              </p>
            </div>
          </div>

          {expiryInfo.canRefresh && (
            <div className="space-y-2">
              <Button
                onClick={refresh}
                disabled={isRefreshing}
                className="w-full gap-2"
                variant={expiryInfo.isExpired ? 'default' : 'outline'}
              >
                {isRefreshing ? (
                  <>
                    <Spinner size="sm" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh Token
                  </>
                )}
              </Button>

              {refreshError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{refreshError.message}</AlertDescription>
                </Alert>
              )}

              {isSuccess && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>Token refreshed successfully!</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FHIR Data Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>FHIR Resource Data</CardTitle>
          <CardDescription>View raw FHIR resource data returned from the API</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="encounter">Encounter</TabsTrigger>
              <TabsTrigger value="observations">Labs</TabsTrigger>
              <TabsTrigger value="medications">Meds</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="allergies">Allergies</TabsTrigger>
              <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <ResourceDataDisplay
                data={patient}
                isLoading={loadingPatient}
                error={patientError}
                resourceType="Patient"
              />
            </TabsContent>

            <TabsContent value="encounter">
              <ResourceDataDisplay
                data={encounter}
                isLoading={loadingEncounter}
                error={encounterError}
                resourceType="Encounter"
              />
            </TabsContent>

            <TabsContent value="observations">
              <ResourceDataDisplay
                data={observations}
                isLoading={loadingObs}
                error={obsError}
                resourceType="Observation Bundle"
              />
            </TabsContent>

            <TabsContent value="medications">
              <ResourceDataDisplay
                data={medications}
                isLoading={loadingMeds}
                error={medsError}
                resourceType="MedicationRequest Bundle"
              />
            </TabsContent>

            <TabsContent value="conditions">
              <ResourceDataDisplay
                data={conditions}
                isLoading={loadingConds}
                error={condsError}
                resourceType="Condition Bundle"
              />
            </TabsContent>

            <TabsContent value="allergies">
              <ResourceDataDisplay
                data={allergies}
                isLoading={loadingAllergies}
                error={allergiesError}
                resourceType="AllergyIntolerance Bundle"
              />
            </TabsContent>

            <TabsContent value="immunizations">
              <ResourceDataDisplay
                data={immunizations}
                isLoading={loadingImmunizations}
                error={immunizationsError}
                resourceType="Immunization Bundle"
              />
            </TabsContent>

            <TabsContent value="devices">
              <ResourceDataDisplay
                data={devices}
                isLoading={loadingDevices}
                error={devicesError}
                resourceType="Device Bundle"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ResourceDataDisplay({
  data,
  isLoading,
  error,
  resourceType,
}: {
  data: unknown;
  isLoading: boolean;
  error: Error | null;
  resourceType: string;
}) {
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
        <AlertDescription>
          Error loading {resourceType}: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">No {resourceType} data available</div>
    );
  }

  return (
    <pre className="overflow-auto rounded-lg bg-muted p-4 text-xs">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}
