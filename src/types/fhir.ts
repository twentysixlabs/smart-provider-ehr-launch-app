/**
 * FHIR R4 Type Definitions from @medplum/fhirtypes
 *
 * Re-export commonly used FHIR types for convenience
 */

export type {
  Address,
  AllergyIntolerance,
  AllergyIntoleranceReaction,
  Annotation,
  Bundle,
  BundleEntry,
  BundleLink,
  CapabilityStatement,
  CodeableConcept,
  Coding,
  Condition,
  ConditionEvidence,
  ConditionStage,
  ContactPoint,
  Device,
  DeviceName,
  DeviceUdiCarrier,
  DomainResource,
  Dosage,
  Encounter,
  EncounterDiagnosis,
  EncounterLocation,
  EncounterParticipant,
  Extension,
  HumanName,
  // Data types
  Identifier,
  Immunization,
  ImmunizationPerformer,
  ImmunizationReaction,
  MedicationRequest,
  MedicationRequestDispenseRequest,
  MedicationRequestSubstitution,
  Meta,
  Narrative,
  Observation,
  // Specific subtypes
  ObservationComponent,
  ObservationReferenceRange,
  // Resources
  Patient,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
  // Base types
  Resource,
} from '@medplum/fhirtypes';

// Re-export for legacy compatibility
import type {
  AllergyIntolerance,
  Condition,
  Device,
  Encounter,
  Immunization,
  MedicationRequest,
  Observation,
  Patient,
  Resource,
} from '@medplum/fhirtypes';

export type FhirPatient = Patient;
export type FhirObservation = Observation;
export type FhirCondition = Condition;
export type FhirMedicationRequest = MedicationRequest;
export type FhirAllergyIntolerance = AllergyIntolerance;
export type FhirEncounter = Encounter;
export type FhirImmunization = Immunization;
export type FhirDevice = Device;
export type FhirResource = Resource;

// Type guards
export function isFhirPatient(resource: Resource): resource is Patient {
  return resource.resourceType === 'Patient';
}

export function isFhirObservation(resource: Resource): resource is Observation {
  return resource.resourceType === 'Observation';
}

export function isFhirCondition(resource: Resource): resource is Condition {
  return resource.resourceType === 'Condition';
}

export function isFhirMedicationRequest(resource: Resource): resource is MedicationRequest {
  return resource.resourceType === 'MedicationRequest';
}

export function isFhirAllergyIntolerance(resource: Resource): resource is AllergyIntolerance {
  return resource.resourceType === 'AllergyIntolerance';
}

export function isFhirEncounter(resource: Resource): resource is Encounter {
  return resource.resourceType === 'Encounter';
}

export function isFhirImmunization(resource: Resource): resource is Immunization {
  return resource.resourceType === 'Immunization';
}

export function isFhirDevice(resource: Resource): resource is Device {
  return resource.resourceType === 'Device';
}
