export class FhirError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "FhirError";
    this.statusCode = statusCode;
  }
}
import type { TokenData } from "../../auth/contexts/TokenContext";
import type { Bundle, Encounter, Patient } from "fhir/r4";
import { useFhirQueryWithRefresh } from "./useFhirDataWithRefresh";

/**
 * Parses FHIR error responses from the server
 */
async function parseFhirError(
  response: Response,
  errorText: string,
  operationType: string
): Promise<FhirError> {
  let errorMessage = `${operationType} failed: ${response.statusText}`;
  try {
    const errorData = JSON.parse(errorText);
    if (errorData.issue?.[0]?.diagnostics) {
      errorMessage = `FHIR Error: ${errorData.issue[0].diagnostics}`;
    } else if (errorData.error) {
      errorMessage = `Error: ${errorData.error}`;
      if (errorData.error_description) {
        errorMessage += ` - ${errorData.error_description}`;
      }
    }
  } catch {
    errorMessage += ` - ${errorText}`;
  }
  return new FhirError(errorMessage, response.status);
}

interface FhirFetchOptions {
  resourceType: string;
  params?: Record<string, string>;
  id?: string;
}

/**
 * Generic function to fetch FHIR resources
 */
async function fetchFhirResource<T>(
  iss: string,
  accessToken: string,
  options: FhirFetchOptions
): Promise<T> {
  const { resourceType, params, id } = options;
  
  let url = `${iss}/${resourceType}`;
  if (id) {
    url += `/${id}`;
  } else if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw await parseFhirError(
      response,
      errorText,
      `Fetch ${resourceType}`
    );
  }

  return response.json();
}

async function fetchR4PatientData(
  iss: string,
  accessToken: string,
  tokenData: TokenData
): Promise<Patient> {
  if (!tokenData?.patient) {
    throw new Error("No patient ID available in token");
  }
  return fetchFhirResource<Patient>(iss, accessToken, {
    resourceType: "Patient",
    id: tokenData.patient
  });
}

async function fetchR4EncounterData(
  iss: string,
  accessToken: string,
  encounterId: string
): Promise<Encounter> {
  return fetchFhirResource<Encounter>(iss, accessToken, {
    resourceType: "Encounter",
    id: encounterId
  });
}

async function fetchR4ObservationsData(
  iss: string,
  accessToken: string,
  patientId: string
): Promise<Bundle> {
  return fetchFhirResource<Bundle>(iss, accessToken, {
    resourceType: "Observation",
    params: {
      patient: patientId,
      category: "laboratory",
      _count: "100",
      _sort: "-date",
    }
  });
}

async function fetchR4MedicationData(
  iss: string,
  accessToken: string,
  patientId: string
): Promise<Bundle> {
  return fetchFhirResource<Bundle>(iss, accessToken, {
    resourceType: "MedicationRequest",
    params: {
      patient: patientId,
      _count: "100",
      _sort: "-date",
    }
  });
}

async function fetchR4ConditionData(
  iss: string,
  accessToken: string,
  patientId: string
): Promise<Bundle> {
  return fetchFhirResource<Bundle>(iss, accessToken, {
    resourceType: "Condition",
    params: {
      patient: patientId,
      _count: "100",
      _sort: "-onset-date",
    }
  });
}

async function fetchR4AllergyIntoleranceData(
  iss: string,
  accessToken: string,
  patientId: string
): Promise<Bundle> {
  return fetchFhirResource<Bundle>(iss, accessToken, {
    resourceType: "AllergyIntolerance",
    params: {
      patient: patientId,
      _count: "100",
    }
  });
}

async function fetchR4ImmunizationData(
  iss: string,
  accessToken: string,
  patientId: string
): Promise<Bundle> {
  return fetchFhirResource<Bundle>(iss, accessToken, {
    resourceType: "Immunization",
    params: {
      patient: patientId,
      _count: "100",
      _sort: "-date",
    }
  });
}

async function fetchR4DeviceData(
  iss: string,
  accessToken: string,
  patientId: string
): Promise<Bundle> {
  return fetchFhirResource<Bundle>(iss, accessToken, {
    resourceType: "Device",
    params: {
      patient: patientId,
      _count: "100",
    }
  });
}

async function fetchR4VitalSignsData(
  iss: string,
  accessToken: string,
  patientId: string
): Promise<Bundle> {
  return fetchFhirResource<Bundle>(iss, accessToken, {
    resourceType: "Observation",
    params: {
      patient: patientId,
      category: "vital-signs",
      _count: "100",
      _sort: "-date",
    }
  });
}

export function useR4PatientData(
  iss: string | null,
  accessToken: string,
  tokenData: TokenData | null
) {
  return useFhirQueryWithRefresh<Patient>({
    queryKey: ["r4PatientData", iss, accessToken, tokenData?.patient],
    queryFn: () => {
      if (!iss || !accessToken || !tokenData) {
        return Promise.reject(
          new Error("Missing required parameters for fetching patient data.")
        );
      }
      return fetchR4PatientData(iss, accessToken, tokenData);
    },
    enabled: !!iss && !!accessToken && !!tokenData?.patient,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useR4EncounterData(
  iss: string | null,
  accessToken: string,
  encounterId: string | undefined
) {
  return useFhirQueryWithRefresh<Encounter>({
    queryKey: ["r4EncounterData", iss, accessToken, encounterId],
    queryFn: () => {
      if (!iss || !accessToken || !encounterId) {
        return Promise.reject(
          new Error("Missing required parameters for fetching encounter data.")
        );
      }
      return fetchR4EncounterData(iss, accessToken, encounterId);
    },
    enabled: !!iss && !!accessToken && !!encounterId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useR4ObservationsData(
  iss: string | null,
  accessToken: string,
  patientId: string | undefined
) {
  return useFhirQueryWithRefresh<Bundle>({
    queryKey: ["r4ObservationsData", iss, accessToken, patientId],
    queryFn: () => {
      if (!iss || !accessToken || !patientId) {
        return Promise.reject(
          new Error(
            "Missing required parameters for fetching observations data."
          )
        );
      }
      return fetchR4ObservationsData(iss, accessToken, patientId);
    },
    enabled: !!iss && !!accessToken && !!patientId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useR4MedicationData(
  iss: string | null,
  accessToken: string,
  patientId: string | undefined
) {
  return useFhirQueryWithRefresh<Bundle>({
    queryKey: ["r4MedicationData", iss, accessToken, patientId],
    queryFn: () => fetchR4MedicationData(iss!, accessToken, patientId!),
    enabled: !!iss && !!accessToken && !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useR4ConditionData(
  iss: string | null,
  accessToken: string,
  patientId: string | undefined
) {
  return useFhirQueryWithRefresh<Bundle>({
    queryKey: ["r4ConditionData", iss, accessToken, patientId],
    queryFn: () => fetchR4ConditionData(iss!, accessToken, patientId!),
    enabled: !!iss && !!accessToken && !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useR4AllergyIntoleranceData(
  iss: string | null,
  accessToken: string,
  patientId: string | undefined
) {
  return useFhirQueryWithRefresh<Bundle>({
    queryKey: ["r4AllergyIntoleranceData", iss, accessToken, patientId],
    queryFn: () => fetchR4AllergyIntoleranceData(iss!, accessToken, patientId!),
    enabled: !!iss && !!accessToken && !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useR4ImmunizationData(
  iss: string | null,
  accessToken: string,
  patientId: string | undefined
) {
  return useFhirQueryWithRefresh<Bundle>({
    queryKey: ["r4ImmunizationData", iss, accessToken, patientId],
    queryFn: () => fetchR4ImmunizationData(iss!, accessToken, patientId!),
    enabled: !!iss && !!accessToken && !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useR4DeviceData(
  iss: string | null,
  accessToken: string,
  patientId: string | undefined
) {
  return useFhirQueryWithRefresh<Bundle>({
    queryKey: ["r4DeviceData", iss, accessToken, patientId],
    queryFn: () => fetchR4DeviceData(iss!, accessToken, patientId!),
    enabled: !!iss && !!accessToken && !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useR4VitalSignsData(
  iss: string | null,
  accessToken: string,
  patientId: string | undefined
) {
  return useFhirQueryWithRefresh<Bundle>({
    queryKey: ["r4VitalSignsData", iss, accessToken, patientId],
    queryFn: () => fetchR4VitalSignsData(iss!, accessToken, patientId!),
    enabled: !!iss && !!accessToken && !!patientId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
