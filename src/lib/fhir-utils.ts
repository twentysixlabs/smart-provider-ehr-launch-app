import type {
  CodeableConcept,
  HumanName,
  Observation,
  ObservationComponent,
  Patient,
} from '@medplum/fhirtypes';

/**
 * Format a FHIR patient name
 */
export function formatPatientName(patient: Patient | null | undefined): string {
  if (!patient?.name || patient.name.length === 0) {
    return 'Unknown Patient';
  }

  const name = patient.name[0];
  return formatHumanName(name);
}

/**
 * Format a FHIR HumanName
 */
export function formatHumanName(name: HumanName | undefined): string {
  if (!name) return 'Unknown';

  if (name.text) {
    return name.text;
  }

  const parts: string[] = [];

  if (name.prefix && name.prefix.length > 0) {
    parts.push(name.prefix.join(' '));
  }

  if (name.given && name.given.length > 0) {
    parts.push(name.given.join(' '));
  }

  if (name.family) {
    parts.push(name.family);
  }

  if (name.suffix && name.suffix.length > 0) {
    parts.push(name.suffix.join(' '));
  }

  return parts.length > 0 ? parts.join(' ') : 'Unknown';
}

/**
 * Format a FHIR CodeableConcept
 */
export function formatCodeableConcept(concept: CodeableConcept | undefined): string {
  if (!concept) return 'Unknown';

  if (concept.text) {
    return concept.text;
  }

  if (concept.coding && concept.coding.length > 0) {
    const coding = concept.coding[0];
    return coding?.display || coding?.code || 'Unknown';
  }

  return 'Unknown';
}

/**
 * Get patient age from birth date
 */
export function getPatientAge(patient: Patient | null | undefined): string {
  if (!patient?.birthDate) {
    return 'Unknown';
  }

  try {
    const birthDate = new Date(patient.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return `${age}`;
  } catch {
    return 'Unknown';
  }
}

/**
 * Format patient gender
 */
export function formatGender(gender: string | undefined): string {
  if (!gender) return 'Unknown';

  const genderMap: Record<string, string> = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
    unknown: 'Unknown',
  };

  return genderMap[gender.toLowerCase()] || gender;
}

/**
 * Extract blood pressure components from an observation
 */
export interface BloodPressureComponents {
  systolic: string;
  diastolic: string;
  unit: string;
  display: string;
}

export function extractBloodPressureComponents(
  observation: Observation | undefined
): BloodPressureComponents | null {
  if (!observation?.component || observation.component.length === 0) {
    return null;
  }

  // Check if this is a blood pressure observation
  const isBP =
    observation.code?.coding?.some(
      (coding) =>
        coding.code === '85354-9' || // Blood pressure panel
        coding.code === '55284-4' || // Blood pressure systolic and diastolic
        coding.display?.toLowerCase().includes('blood pressure')
    ) || observation.code?.text?.toLowerCase().includes('blood pressure');

  if (!isBP) {
    return null;
  }

  let systolic: ObservationComponent | undefined;
  let diastolic: ObservationComponent | undefined;

  for (const component of observation.component) {
    const coding = component.code?.coding?.[0];
    if (!coding) continue;

    // Systolic codes
    if (coding.code === '8480-6' || coding.display?.toLowerCase().includes('systolic')) {
      systolic = component;
    }
    // Diastolic codes
    else if (coding.code === '8462-4' || coding.display?.toLowerCase().includes('diastolic')) {
      diastolic = component;
    }
  }

  if (systolic?.valueQuantity && diastolic?.valueQuantity) {
    return {
      systolic: roundToTwoDecimalsOrInteger(systolic.valueQuantity.value ?? 0).toString(),
      diastolic: roundToTwoDecimalsOrInteger(diastolic.valueQuantity.value ?? 0).toString(),
      unit: systolic.valueQuantity.unit || 'mmHg',
      display: observation.code?.text || 'Blood Pressure',
    };
  }

  return null;
}

/**
 * Round a number to two decimal places or return an integer
 */
export function roundToTwoDecimalsOrInteger(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return rounded % 1 === 0 ? Math.round(rounded) : rounded;
}

/**
 * Build FHIR search URL with parameters
 */
export function buildFhirSearchUrl(
  baseUrl: string,
  resourceType: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(`${baseUrl}/${resourceType}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  }

  return url.toString();
}

/**
 * Check if a FHIR resource is valid
 */
export function isFhirResourceValid(resource: unknown): boolean {
  if (!resource || typeof resource !== 'object') {
    return false;
  }

  const fhirResource = resource as { resourceType?: string };
  return Boolean(fhirResource.resourceType);
}

/**
 * Extract resource ID from a FHIR reference
 */
export function extractResourceId(reference: string | undefined): string | null {
  if (!reference) return null;

  // Reference format: ResourceType/id or relative URL
  const match = reference.match(/([A-Za-z]+)\/([^/]+)$/);
  return match?.[2] ?? null;
}

/**
 * Format observation value for display
 */
export function formatObservationValue(observation: Observation | undefined): string {
  if (!observation) return 'N/A';

  if (observation.valueQuantity) {
    const value = roundToTwoDecimalsOrInteger(observation.valueQuantity.value ?? 0);
    const unit = observation.valueQuantity.unit || '';
    return `${value} ${unit}`.trim();
  }

  if (observation.valueString) {
    return observation.valueString;
  }

  if (observation.valueCodeableConcept) {
    return formatCodeableConcept(observation.valueCodeableConcept);
  }

  if (observation.valueBoolean !== undefined) {
    return observation.valueBoolean ? 'Yes' : 'No';
  }

  if (observation.valueInteger !== undefined) {
    return observation.valueInteger.toString();
  }

  return 'N/A';
}
