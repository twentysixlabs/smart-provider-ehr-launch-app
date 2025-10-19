/**
 * FHIR R4 Type Definitions from @medplum/fhirtypes
 * 
 * Re-export commonly used FHIR types for convenience
 */

export type {
  // Base types
  Resource,
  DomainResource,
  Extension,
  Narrative,
  Meta,
  
  // Data types
  Identifier,
  HumanName,
  ContactPoint,
  Address,
  CodeableConcept,
  Coding,
  Period,
  Quantity,
  Reference,
  Annotation,
  Range,
  Ratio,
  
  // Resources
  Patient,
  Observation,
  Condition,
  MedicationRequest,
  AllergyIntolerance,
  Encounter,
  Immunization,
  Device,
  Bundle,
  BundleEntry,
  BundleLink,
  CapabilityStatement,
  
  // Specific subtypes
  ObservationComponent,
  ObservationReferenceRange,
  EncounterLocation,
  EncounterParticipant,
  EncounterDiagnosis,
  AllergyIntoleranceReaction,
  ConditionStage,
  ConditionEvidence,
  ImmunizationPerformer,
  ImmunizationReaction,
  DeviceUdiCarrier,
  DeviceName,
  MedicationRequestDispenseRequest,
  MedicationRequestSubstitution,
  Dosage,
} from '@medplum/fhirtypes';

// Re-export for legacy compatibility
import type { Patient, Observation, Condition, MedicationRequest, AllergyIntolerance, Encounter, Immunization, Device, Resource } from '@medplum/fhirtypes';

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
