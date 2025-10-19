/**
 * Comprehensive FHIR R4 Type Definitions
 * These types ensure strict type safety across the application
 */

// Base FHIR Types
export interface FhirResource {
  resourceType: string;
  id?: string;
  meta?: FhirMeta;
  implicitRules?: string;
  language?: string;
}

export interface FhirMeta {
  versionId?: string;
  lastUpdated?: string;
  source?: string;
  profile?: string[];
  security?: FhirCoding[];
  tag?: FhirCoding[];
}

export interface FhirCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

export interface FhirReference {
  reference?: string;
  type?: string;
  identifier?: FhirIdentifier;
  display?: string;
}

export interface FhirIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
  type?: FhirCodeableConcept;
  system?: string;
  value?: string;
  period?: FhirPeriod;
  assigner?: FhirReference;
}

export interface FhirPeriod {
  start?: string;
  end?: string;
}

export interface FhirQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FhirHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  period?: FhirPeriod;
}

export interface FhirContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value?: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  rank?: number;
  period?: FhirPeriod;
}

export interface FhirAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  type?: 'postal' | 'physical' | 'both';
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: FhirPeriod;
}

// Bundle Type
export interface FhirBundle<T extends FhirResource = FhirResource> extends FhirResource {
  resourceType: 'Bundle';
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';
  timestamp?: string;
  total?: number;
  link?: FhirBundleLink[];
  entry?: FhirBundleEntry<T>[];
  signature?: unknown;
}

export interface FhirBundleLink {
  relation: string;
  url: string;
}

export interface FhirBundleEntry<T extends FhirResource = FhirResource> {
  link?: FhirBundleLink[];
  fullUrl?: string;
  resource?: T;
  search?: {
    mode?: 'match' | 'include' | 'outcome';
    score?: number;
  };
  request?: {
    method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    ifNoneMatch?: string;
    ifModifiedSince?: string;
    ifMatch?: string;
    ifNoneExist?: string;
  };
  response?: {
    status: string;
    location?: string;
    etag?: string;
    lastModified?: string;
    outcome?: FhirResource;
  };
}

// Patient Resource
export interface FhirPatient extends FhirResource {
  resourceType: 'Patient';
  identifier?: FhirIdentifier[];
  active?: boolean;
  name?: FhirHumanName[];
  telecom?: FhirContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  deceasedBoolean?: boolean;
  deceasedDateTime?: string;
  address?: FhirAddress[];
  maritalStatus?: FhirCodeableConcept;
  multipleBirthBoolean?: boolean;
  multipleBirthInteger?: number;
  photo?: unknown[];
  contact?: FhirPatientContact[];
  communication?: FhirPatientCommunication[];
  generalPractitioner?: FhirReference[];
  managingOrganization?: FhirReference;
  link?: FhirPatientLink[];
}

export interface FhirPatientContact {
  relationship?: FhirCodeableConcept[];
  name?: FhirHumanName;
  telecom?: FhirContactPoint[];
  address?: FhirAddress;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  organization?: FhirReference;
  period?: FhirPeriod;
}

export interface FhirPatientCommunication {
  language: FhirCodeableConcept;
  preferred?: boolean;
}

export interface FhirPatientLink {
  other: FhirReference;
  type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
}

// Observation Resource
export interface FhirObservation extends FhirResource {
  resourceType: 'Observation';
  identifier?: FhirIdentifier[];
  basedOn?: FhirReference[];
  partOf?: FhirReference[];
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject?: FhirReference;
  focus?: FhirReference[];
  encounter?: FhirReference;
  effectiveDateTime?: string;
  effectivePeriod?: FhirPeriod;
  effectiveTiming?: unknown;
  effectiveInstant?: string;
  issued?: string;
  performer?: FhirReference[];
  valueQuantity?: FhirQuantity;
  valueCodeableConcept?: FhirCodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
  };
  valueRatio?: unknown;
  valueSampledData?: unknown;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: FhirPeriod;
  dataAbsentReason?: FhirCodeableConcept;
  interpretation?: FhirCodeableConcept[];
  note?: FhirAnnotation[];
  bodySite?: FhirCodeableConcept;
  method?: FhirCodeableConcept;
  specimen?: FhirReference;
  device?: FhirReference;
  referenceRange?: FhirObservationReferenceRange[];
  hasMember?: FhirReference[];
  derivedFrom?: FhirReference[];
  component?: FhirObservationComponent[];
}

export interface FhirAnnotation {
  authorReference?: FhirReference;
  authorString?: string;
  time?: string;
  text: string;
}

export interface FhirObservationReferenceRange {
  low?: FhirQuantity;
  high?: FhirQuantity;
  type?: FhirCodeableConcept;
  appliesTo?: FhirCodeableConcept[];
  age?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
  };
  text?: string;
}

export interface FhirObservationComponent {
  code: FhirCodeableConcept;
  valueQuantity?: FhirQuantity;
  valueCodeableConcept?: FhirCodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
  };
  valueRatio?: unknown;
  valueSampledData?: unknown;
  valueTime?: string;
  valueDateTime?: string;
  valuePeriod?: FhirPeriod;
  dataAbsentReason?: FhirCodeableConcept;
  interpretation?: FhirCodeableConcept[];
  referenceRange?: FhirObservationReferenceRange[];
}

// Condition Resource
export interface FhirCondition extends FhirResource {
  resourceType: 'Condition';
  identifier?: FhirIdentifier[];
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  severity?: FhirCodeableConcept;
  code?: FhirCodeableConcept;
  bodySite?: FhirCodeableConcept[];
  subject: FhirReference;
  encounter?: FhirReference;
  onsetDateTime?: string;
  onsetAge?: FhirQuantity;
  onsetPeriod?: FhirPeriod;
  onsetRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
  };
  onsetString?: string;
  abatementDateTime?: string;
  abatementAge?: FhirQuantity;
  abatementPeriod?: FhirPeriod;
  abatementRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
  };
  abatementString?: string;
  recordedDate?: string;
  recorder?: FhirReference;
  asserter?: FhirReference;
  stage?: FhirConditionStage[];
  evidence?: FhirConditionEvidence[];
  note?: FhirAnnotation[];
}

export interface FhirConditionStage {
  summary?: FhirCodeableConcept;
  assessment?: FhirReference[];
  type?: FhirCodeableConcept;
}

export interface FhirConditionEvidence {
  code?: FhirCodeableConcept[];
  detail?: FhirReference[];
}

// MedicationRequest Resource
export interface FhirMedicationRequest extends FhirResource {
  resourceType: 'MedicationRequest';
  identifier?: FhirIdentifier[];
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  statusReason?: FhirCodeableConcept;
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  category?: FhirCodeableConcept[];
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';
  doNotPerform?: boolean;
  reportedBoolean?: boolean;
  reportedReference?: FhirReference;
  medicationCodeableConcept?: FhirCodeableConcept;
  medicationReference?: FhirReference;
  subject: FhirReference;
  encounter?: FhirReference;
  supportingInformation?: FhirReference[];
  authoredOn?: string;
  requester?: FhirReference;
  performer?: FhirReference;
  performerType?: FhirCodeableConcept;
  recorder?: FhirReference;
  reasonCode?: FhirCodeableConcept[];
  reasonReference?: FhirReference[];
  instantiatesCanonical?: string[];
  instantiatesUri?: string[];
  basedOn?: FhirReference[];
  groupIdentifier?: FhirIdentifier;
  courseOfTherapyType?: FhirCodeableConcept;
  insurance?: FhirReference[];
  note?: FhirAnnotation[];
  dosageInstruction?: FhirDosage[];
  dispenseRequest?: FhirMedicationRequestDispenseRequest;
  substitution?: FhirMedicationRequestSubstitution;
  priorPrescription?: FhirReference;
  detectedIssue?: FhirReference[];
  eventHistory?: FhirReference[];
}

export interface FhirDosage {
  sequence?: number;
  text?: string;
  additionalInstruction?: FhirCodeableConcept[];
  patientInstruction?: string;
  timing?: unknown;
  asNeededBoolean?: boolean;
  asNeededCodeableConcept?: FhirCodeableConcept;
  site?: FhirCodeableConcept;
  route?: FhirCodeableConcept;
  method?: FhirCodeableConcept;
  doseAndRate?: FhirDosageDoseAndRate[];
  maxDosePerPeriod?: unknown;
  maxDosePerAdministration?: FhirQuantity;
  maxDosePerLifetime?: FhirQuantity;
}

export interface FhirDosageDoseAndRate {
  type?: FhirCodeableConcept;
  doseRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
  };
  doseQuantity?: FhirQuantity;
  rateRatio?: unknown;
  rateRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
  };
  rateQuantity?: FhirQuantity;
}

export interface FhirMedicationRequestDispenseRequest {
  initialFill?: {
    quantity?: FhirQuantity;
    duration?: unknown;
  };
  dispenseInterval?: unknown;
  validityPeriod?: FhirPeriod;
  numberOfRepeatsAllowed?: number;
  quantity?: FhirQuantity;
  expectedSupplyDuration?: unknown;
  performer?: FhirReference;
}

export interface FhirMedicationRequestSubstitution {
  allowedBoolean?: boolean;
  allowedCodeableConcept?: FhirCodeableConcept;
  reason?: FhirCodeableConcept;
}

// AllergyIntolerance Resource
export interface FhirAllergyIntolerance extends FhirResource {
  resourceType: 'AllergyIntolerance';
  identifier?: FhirIdentifier[];
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  type?: 'allergy' | 'intolerance';
  category?: Array<'food' | 'medication' | 'environment' | 'biologic'>;
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code?: FhirCodeableConcept;
  patient: FhirReference;
  encounter?: FhirReference;
  onsetDateTime?: string;
  onsetAge?: FhirQuantity;
  onsetPeriod?: FhirPeriod;
  onsetRange?: {
    low?: FhirQuantity;
    high?: FhirQuantity;
  };
  onsetString?: string;
  recordedDate?: string;
  recorder?: FhirReference;
  asserter?: FhirReference;
  lastOccurrence?: string;
  note?: FhirAnnotation[];
  reaction?: FhirAllergyIntoleranceReaction[];
}

export interface FhirAllergyIntoleranceReaction {
  substance?: FhirCodeableConcept;
  manifestation: FhirCodeableConcept[];
  description?: string;
  onset?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  exposureRoute?: FhirCodeableConcept;
  note?: FhirAnnotation[];
}

// Encounter Resource
export interface FhirEncounter extends FhirResource {
  resourceType: 'Encounter';
  identifier?: FhirIdentifier[];
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
  statusHistory?: FhirEncounterStatusHistory[];
  class: FhirCoding;
  classHistory?: FhirEncounterClassHistory[];
  type?: FhirCodeableConcept[];
  serviceType?: FhirCodeableConcept;
  priority?: FhirCodeableConcept;
  subject?: FhirReference;
  episodeOfCare?: FhirReference[];
  basedOn?: FhirReference[];
  participant?: FhirEncounterParticipant[];
  appointment?: FhirReference[];
  period?: FhirPeriod;
  length?: unknown;
  reasonCode?: FhirCodeableConcept[];
  reasonReference?: FhirReference[];
  diagnosis?: FhirEncounterDiagnosis[];
  account?: FhirReference[];
  hospitalization?: FhirEncounterHospitalization;
  location?: FhirEncounterLocation[];
  serviceProvider?: FhirReference;
  partOf?: FhirReference;
}

export interface FhirEncounterStatusHistory {
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
  period: FhirPeriod;
}

export interface FhirEncounterClassHistory {
  class: FhirCoding;
  period: FhirPeriod;
}

export interface FhirEncounterParticipant {
  type?: FhirCodeableConcept[];
  period?: FhirPeriod;
  individual?: FhirReference;
}

export interface FhirEncounterDiagnosis {
  condition: FhirReference;
  use?: FhirCodeableConcept;
  rank?: number;
}

export interface FhirEncounterHospitalization {
  preAdmissionIdentifier?: FhirIdentifier;
  origin?: FhirReference;
  admitSource?: FhirCodeableConcept;
  reAdmission?: FhirCodeableConcept;
  dietPreference?: FhirCodeableConcept[];
  specialCourtesy?: FhirCodeableConcept[];
  specialArrangement?: FhirCodeableConcept[];
  destination?: FhirReference;
  dischargeDisposition?: FhirCodeableConcept;
}

export interface FhirEncounterLocation {
  location: FhirReference;
  status?: 'planned' | 'active' | 'reserved' | 'completed';
  physicalType?: FhirCodeableConcept;
  period?: FhirPeriod;
}

// Immunization Resource
export interface FhirImmunization extends FhirResource {
  resourceType: 'Immunization';
  identifier?: FhirIdentifier[];
  status: 'completed' | 'entered-in-error' | 'not-done';
  statusReason?: FhirCodeableConcept;
  vaccineCode: FhirCodeableConcept;
  patient: FhirReference;
  encounter?: FhirReference;
  occurrenceDateTime?: string;
  occurrenceString?: string;
  recorded?: string;
  primarySource?: boolean;
  reportOrigin?: FhirCodeableConcept;
  location?: FhirReference;
  manufacturer?: FhirReference;
  lotNumber?: string;
  expirationDate?: string;
  site?: FhirCodeableConcept;
  route?: FhirCodeableConcept;
  doseQuantity?: FhirQuantity;
  performer?: FhirImmunizationPerformer[];
  note?: FhirAnnotation[];
  reasonCode?: FhirCodeableConcept[];
  reasonReference?: FhirReference[];
  isSubpotent?: boolean;
  subpotentReason?: FhirCodeableConcept[];
  education?: FhirImmunizationEducation[];
  programEligibility?: FhirCodeableConcept[];
  fundingSource?: FhirCodeableConcept;
  reaction?: FhirImmunizationReaction[];
  protocolApplied?: FhirImmunizationProtocolApplied[];
}

export interface FhirImmunizationPerformer {
  function?: FhirCodeableConcept;
  actor: FhirReference;
}

export interface FhirImmunizationEducation {
  documentType?: string;
  reference?: string;
  publicationDate?: string;
  presentationDate?: string;
}

export interface FhirImmunizationReaction {
  date?: string;
  detail?: FhirReference;
  reported?: boolean;
}

export interface FhirImmunizationProtocolApplied {
  series?: string;
  authority?: FhirReference;
  targetDisease?: FhirCodeableConcept[];
  doseNumberPositiveInt?: number;
  doseNumberString?: string;
  seriesDosesPositiveInt?: number;
  seriesDosesString?: string;
}

// Device Resource
export interface FhirDevice extends FhirResource {
  resourceType: 'Device';
  identifier?: FhirIdentifier[];
  definition?: FhirReference;
  udiCarrier?: FhirDeviceUdiCarrier[];
  status?: 'active' | 'inactive' | 'entered-in-error' | 'unknown';
  statusReason?: FhirCodeableConcept[];
  distinctIdentifier?: string;
  manufacturer?: string;
  manufactureDate?: string;
  expirationDate?: string;
  lotNumber?: string;
  serialNumber?: string;
  deviceName?: FhirDeviceName[];
  modelNumber?: string;
  partNumber?: string;
  type?: FhirCodeableConcept;
  specialization?: FhirDeviceSpecialization[];
  version?: FhirDeviceVersion[];
  property?: FhirDeviceProperty[];
  patient?: FhirReference;
  owner?: FhirReference;
  contact?: FhirContactPoint[];
  location?: FhirReference;
  url?: string;
  note?: FhirAnnotation[];
  safety?: FhirCodeableConcept[];
  parent?: FhirReference;
}

export interface FhirDeviceUdiCarrier {
  deviceIdentifier?: string;
  issuer?: string;
  jurisdiction?: string;
  carrierAIDC?: string;
  carrierHRF?: string;
  entryType?: 'barcode' | 'rfid' | 'manual' | 'card' | 'self-reported' | 'unknown';
}

export interface FhirDeviceName {
  name: string;
  type: 'udi-label-name' | 'user-friendly-name' | 'patient-reported-name' | 'manufacturer-name' | 'model-name' | 'other';
}

export interface FhirDeviceSpecialization {
  systemType: FhirCodeableConcept;
  version?: string;
}

export interface FhirDeviceVersion {
  type?: FhirCodeableConcept;
  component?: FhirIdentifier;
  value: string;
}

export interface FhirDeviceProperty {
  type: FhirCodeableConcept;
  valueQuantity?: FhirQuantity[];
  valueCode?: FhirCodeableConcept[];
}

// SMART on FHIR Capability Statement
export interface FhirCapabilityStatement extends FhirResource {
  resourceType: 'CapabilityStatement';
  url?: string;
  version?: string;
  name?: string;
  title?: string;
  status: 'draft' | 'active' | 'retired' | 'unknown';
  experimental?: boolean;
  date: string;
  publisher?: string;
  contact?: unknown[];
  description?: string;
  useContext?: unknown[];
  jurisdiction?: FhirCodeableConcept[];
  purpose?: string;
  copyright?: string;
  kind: 'instance' | 'capability' | 'requirements';
  instantiates?: string[];
  imports?: string[];
  software?: {
    name: string;
    version?: string;
    releaseDate?: string;
  };
  implementation?: {
    description: string;
    url?: string;
  };
  fhirVersion: string;
  format: string[];
  patchFormat?: string[];
  implementationGuide?: string[];
  rest?: FhirCapabilityStatementRest[];
}

export interface FhirCapabilityStatementRest {
  mode: 'client' | 'server';
  documentation?: string;
  security?: {
    cors?: boolean;
    service?: FhirCodeableConcept[];
    description?: string;
    extension?: Array<{
      url: string;
      extension?: Array<{
        url: string;
        valueUri?: string;
        valueCode?: string;
      }>;
    }>;
  };
  resource?: FhirCapabilityStatementResource[];
  interaction?: Array<{
    code: 'transaction' | 'batch' | 'search-system' | 'history-system';
    documentation?: string;
  }>;
  searchParam?: unknown[];
  operation?: unknown[];
  compartment?: string[];
}

export interface FhirCapabilityStatementResource {
  type: string;
  profile?: string;
  supportedProfile?: string[];
  documentation?: string;
  interaction?: Array<{
    code: 'read' | 'vread' | 'update' | 'patch' | 'delete' | 'history-instance' | 'history-type' | 'create' | 'search-type';
    documentation?: string;
  }>;
  versioning?: 'no-version' | 'versioned' | 'versioned-update';
  readHistory?: boolean;
  updateCreate?: boolean;
  conditionalCreate?: boolean;
  conditionalRead?: 'not-supported' | 'modified-since' | 'not-match' | 'full-support';
  conditionalUpdate?: boolean;
  conditionalDelete?: 'not-supported' | 'single' | 'multiple';
  referencePolicy?: Array<'literal' | 'logical' | 'resolves' | 'enforced' | 'local'>;
  searchInclude?: string[];
  searchRevInclude?: string[];
  searchParam?: unknown[];
  operation?: unknown[];
}

// Helper type for any FHIR resource
export type AnyFhirResource =
  | FhirPatient
  | FhirObservation
  | FhirCondition
  | FhirMedicationRequest
  | FhirAllergyIntolerance
  | FhirEncounter
  | FhirImmunization
  | FhirDevice
  | FhirCapabilityStatement
  | FhirResource;

// Type guards
export function isFhirPatient(resource: FhirResource): resource is FhirPatient {
  return resource.resourceType === 'Patient';
}

export function isFhirObservation(resource: FhirResource): resource is FhirObservation {
  return resource.resourceType === 'Observation';
}

export function isFhirCondition(resource: FhirResource): resource is FhirCondition {
  return resource.resourceType === 'Condition';
}

export function isFhirMedicationRequest(resource: FhirResource): resource is FhirMedicationRequest {
  return resource.resourceType === 'MedicationRequest';
}

export function isFhirAllergyIntolerance(resource: FhirResource): resource is FhirAllergyIntolerance {
  return resource.resourceType === 'AllergyIntolerance';
}

export function isFhirEncounter(resource: FhirResource): resource is FhirEncounter {
  return resource.resourceType === 'Encounter';
}

export function isFhirImmunization(resource: FhirResource): resource is FhirImmunization {
  return resource.resourceType === 'Immunization';
}

export function isFhirDevice(resource: FhirResource): resource is FhirDevice {
  return resource.resourceType === 'Device';
}
