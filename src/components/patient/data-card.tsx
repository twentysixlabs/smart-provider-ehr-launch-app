'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import {
  extractBloodPressureComponents,
  roundToTwoDecimalsOrInteger,
} from '@/lib/fhir-utils';
import type { Bundle, Encounter, Resource, Observation } from '@medplum/fhirtypes';

type FhirBundle<T extends Resource> = Bundle<T>;
type FhirEncounter = Encounter;
type FhirResource = Resource;

interface DataCardProps {
  title: string;
  icon: React.ReactNode;
  count: number | undefined;
  isLoading: boolean;
  error: Error | null;
  resourceType?: string;
  data?: FhirBundle<FhirResource> | null;
  encounter?: FhirEncounter;
}

export function DataCard({
  title,
  icon,
  count,
  isLoading,
  error,
  resourceType,
  data,
  encounter,
}: DataCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Spinner size="sm" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error.message}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <div className="text-2xl font-bold">{count ?? 'N/A'}</div>
            {data && <DataPreview resourceType={resourceType} data={data} />}
            {encounter && <EncounterPreview encounter={encounter} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DataPreview({
  resourceType,
  data,
}: {
  resourceType?: string;
  data: FhirBundle<FhirResource>;
}) {
  if (!data.entry || data.entry.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available</p>;
  }

  const previewCount = 3;
  const entries = data.entry.slice(0, previewCount);

  return (
    <div className="space-y-1.5">
      {entries.map((entry, index) => {
        const resource = entry.resource;
        if (!resource) return null;

        return (
          <div key={index} className="text-sm">
            <ResourcePreview resource={resource} resourceType={resourceType} />
          </div>
        );
      })}
      {data.entry.length > previewCount && (
        <p className="text-xs text-muted-foreground">+{data.entry.length - previewCount} more</p>
      )}
    </div>
  );
}

function ResourcePreview({
  resource,
  resourceType,
}: {
  resource: FhirResource;
  resourceType?: string;
}) {
  const content = getResourcePreviewContent(resource, resourceType);
  return <div className="truncate">{content}</div>;
}

function getResourcePreviewContent(resource: FhirResource, resourceType?: string): React.ReactNode {
  if (resourceType === 'vital-signs' && resource.resourceType === 'Observation') {
    const obs = resource as Observation;

    const bp = extractBloodPressureComponents(obs);
    if (bp) {
      return (
        <>
          <span className="font-medium">{bp.display}:</span>{' '}
          <span className="text-muted-foreground">
            {bp.systolic}/{bp.diastolic} {bp.unit}
          </span>
        </>
      );
    }

    if (obs.valueQuantity) {
      return (
        <>
          <span className="font-medium">{obs.code?.text || 'Unknown'}:</span>{' '}
          <span className="text-muted-foreground">
            {roundToTwoDecimalsOrInteger(obs.valueQuantity.value ?? 0)} {obs.valueQuantity.unit}
          </span>
        </>
      );
    }
  }

  if (resourceType === 'medications' && resource.resourceType === 'MedicationRequest') {
    const med = resource as Resource & {
      medicationCodeableConcept?: { text?: string };
      medicationReference?: { display?: string };
    };
    return (
      <span className="font-medium">
        {med.medicationCodeableConcept?.text ||
          med.medicationReference?.display ||
          'Unknown medication'}
      </span>
    );
  }

  if (resourceType === 'conditions' && resource.resourceType === 'Condition') {
    const cond = resource as FhirResource & {
      code?: { text?: string };
    };
    return <span className="font-medium">{cond.code?.text || 'Unknown condition'}</span>;
  }

  if (resourceType === 'allergies' && resource.resourceType === 'AllergyIntolerance') {
    const allergy = resource as FhirResource & {
      code?: { text?: string };
      reaction?: Array<{ severity?: string }>;
    };
    return (
      <>
        <span className="font-medium">{allergy.code?.text || 'Unknown allergy'}</span>
        {allergy.reaction?.[0]?.severity && (
          <span className="ml-2 text-xs text-destructive">({allergy.reaction[0].severity})</span>
        )}
      </>
    );
  }

  if (resourceType === 'immunizations' && resource.resourceType === 'Immunization') {
    const imm = resource as FhirResource & {
      vaccineCode?: { text?: string };
    };
    return <span className="font-medium">{imm.vaccineCode?.text || 'Unknown vaccine'}</span>;
  }

  if (resourceType === 'devices' && resource.resourceType === 'Device') {
    const device = resource as Resource & {
      deviceName?: Array<{ name?: string }>;
      type?: { text?: string };
    };
    return (
      <span className="font-medium">
        {device.deviceName?.[0]?.name || device.type?.text || 'Unknown device'}
      </span>
    );
  }

  return <span className="text-muted-foreground">No preview available</span>;
}

function EncounterPreview({ encounter }: { encounter: Encounter }) {
  const classDisplay = encounter.class?.display || 'Unknown type';

  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium">{classDisplay}</p>
      <p className="text-muted-foreground">{encounter.status || 'Unknown status'}</p>
      {encounter.location?.[0]?.location?.display && (
        <p className="text-muted-foreground">{encounter.location[0].location.display}</p>
      )}
    </div>
  );
}
