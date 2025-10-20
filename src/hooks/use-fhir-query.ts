import type {
  AllergyIntolerance,
  Bundle,
  Condition,
  Device,
  Encounter,
  Immunization,
  MedicationRequest,
  Observation,
  Patient,
  Resource,
} from '@medplum/fhirtypes';
import { type UseQueryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { buildFhirSearchUrl } from '@/lib/fhir-utils';
import { fetchFhirResource } from '@/lib/smart-auth';
import type { TokenData } from '@/types';

interface UseFhirQueryOptions {
  resourceType: string;
  params?: Record<string, string | number | boolean | undefined>;
  enabled?: boolean;
  staleTime?: number;
}

export function useFhirQuery<T extends Resource>(
  fhirBaseUrl: string | null,
  accessToken: string | null,
  options: UseFhirQueryOptions
): UseQueryResult<Bundle<T>, Error> {
  const { resourceType, params = {}, enabled = true, staleTime } = options;

  return useQuery<Bundle<T>, Error>({
    queryKey: ['fhir', resourceType, params],
    queryFn: async () => {
      if (!(fhirBaseUrl && accessToken)) {
        throw new Error('Missing FHIR base URL or access token');
      }

      const url = buildFhirSearchUrl(fhirBaseUrl, resourceType, params);
      return fetchFhirResource<Bundle<T>>(url, accessToken);
    },
    enabled: enabled && Boolean(fhirBaseUrl) && Boolean(accessToken),
    staleTime,
  });
}

export function useFhirResourceQuery<T extends Resource>(
  fhirBaseUrl: string | null,
  accessToken: string | null,
  resourceType: string,
  resourceId: string | null | undefined,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<T, Error> {
  return useQuery<T, Error>({
    queryKey: ['fhir', resourceType, resourceId],
    queryFn: async () => {
      if (!(fhirBaseUrl && accessToken && resourceId)) {
        throw new Error('Missing required parameters');
      }

      const url = `${fhirBaseUrl}/${resourceType}/${resourceId}`;
      return fetchFhirResource<T>(url, accessToken);
    },
    enabled: Boolean(fhirBaseUrl) && Boolean(accessToken) && Boolean(resourceId),
    ...options,
  });
}

// Specific hooks for common FHIR resources
export function usePatientQuery(fhirBaseUrl: string | null, token: TokenData | null) {
  return useFhirResourceQuery<Patient>(
    fhirBaseUrl,
    token?.access_token ?? null,
    'Patient',
    token?.patient
  );
}

export function useEncounterQuery(fhirBaseUrl: string | null, token: TokenData | null) {
  return useFhirResourceQuery<Encounter>(
    fhirBaseUrl,
    token?.access_token ?? null,
    'Encounter',
    token?.encounter
  );
}

export function useObservationsQuery(
  fhirBaseUrl: string | null,
  token: TokenData | null,
  category?: string
) {
  const params: Record<string, string | undefined> = {
    patient: token?.patient,
    _count: '100',
    _sort: '-date',
  };

  if (category) {
    params.category = category;
  }

  return useFhirQuery<Observation>(fhirBaseUrl, token?.access_token ?? null, {
    resourceType: 'Observation',
    params,
    enabled: Boolean(token?.patient),
  });
}

export function useMedicationRequestsQuery(fhirBaseUrl: string | null, token: TokenData | null) {
  return useFhirQuery<MedicationRequest>(fhirBaseUrl, token?.access_token ?? null, {
    resourceType: 'MedicationRequest',
    params: {
      patient: token?.patient,
      _count: '100',
      _sort: '-authoredon',
    },
    enabled: Boolean(token?.patient),
  });
}

export function useConditionsQuery(fhirBaseUrl: string | null, token: TokenData | null) {
  return useFhirQuery<Condition>(fhirBaseUrl, token?.access_token ?? null, {
    resourceType: 'Condition',
    params: {
      patient: token?.patient,
      _count: '100',
    },
    enabled: Boolean(token?.patient),
  });
}

export function useAllergiesQuery(fhirBaseUrl: string | null, token: TokenData | null) {
  return useFhirQuery<AllergyIntolerance>(fhirBaseUrl, token?.access_token ?? null, {
    resourceType: 'AllergyIntolerance',
    params: {
      patient: token?.patient,
      _count: '100',
    },
    enabled: Boolean(token?.patient),
  });
}

export function useImmunizationsQuery(fhirBaseUrl: string | null, token: TokenData | null) {
  return useFhirQuery<Immunization>(fhirBaseUrl, token?.access_token ?? null, {
    resourceType: 'Immunization',
    params: {
      patient: token?.patient,
      _count: '100',
      _sort: '-date',
    },
    enabled: Boolean(token?.patient),
  });
}

export function useDevicesQuery(fhirBaseUrl: string | null, token: TokenData | null) {
  return useFhirQuery<Device>(fhirBaseUrl, token?.access_token ?? null, {
    resourceType: 'Device',
    params: {
      patient: token?.patient,
      _count: '100',
    },
    enabled: Boolean(token?.patient),
  });
}
