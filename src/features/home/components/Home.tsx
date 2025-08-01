import { useToken } from "../../auth";
import { useTokenExpiryDisplay } from "../hooks/useTokenExpiryDisplay";
import { useTokenRefresh } from "../hooks/useTokenRefresh";
import {
  useR4PatientData,
  useR4EncounterData,
  useR4ObservationsData,
  useR4MedicationData,
  useR4ConditionData,
  useR4AllergyIntoleranceData,
  useR4ImmunizationData,
  useR4DeviceData,
  useR4VitalSignsData,
} from "../../fhir/hooks/useFhirData";
import type { StorageRepository } from "../../../core/storage";
import { storage } from "../../../core/storage";
import Config from "../../../config.json";
import { PatientBanner } from "./PatientBanner";
import { Tabs } from "../../../components/Tabs";
import { FhirDataViewer } from "./FhirDataViewer";
import { LabsTable } from "./LabsTable";
import { DataCard } from "./DataCard";
import {
  Activity,
  Heart,
  Pill,
  Shield,
  Syringe,
  Stethoscope,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { extractBloodPressureComponents } from "../../../utils/fhirUtils";

function getFHIRBaseUrl(storage: StorageRepository): string | null {
  return storage.getItem(Config.STORAGE_KEYS.FHIR_BASE_URL);
}

export function Home() {
  const fhirURL = getFHIRBaseUrl(storage);
  const { token } = useToken();
  const expiryInfo = useTokenExpiryDisplay(token);
  const { refreshToken, refreshError, isRefreshing, isSuccess } =
    useTokenRefresh();
  const {
    data: patientData,
    isLoading,
    error,
  } = useR4PatientData(fhirURL, token?.access_token || "", token);

  const {
    data: encounterData,
    isLoading: isLoadingEncounter,
    error: encounterError,
  } = useR4EncounterData(fhirURL, token?.access_token || "", token?.encounter);

  const {
    data: observationsData,
    isLoading: isLoadingObservations,
    error: observationsError,
  } = useR4ObservationsData(fhirURL, token?.access_token || "", token?.patient);

  const {
    data: medicationData,
    isLoading: isLoadingMedications,
    error: medicationError,
  } = useR4MedicationData(fhirURL, token?.access_token || "", token?.patient);

  const {
    data: conditionData,
    isLoading: isLoadingConditions,
    error: conditionError,
  } = useR4ConditionData(fhirURL, token?.access_token || "", token?.patient);

  const {
    data: allergyData,
    isLoading: isLoadingAllergies,
    error: allergyError,
  } = useR4AllergyIntoleranceData(
    fhirURL,
    token?.access_token || "",
    token?.patient
  );

  const {
    data: immunizationData,
    isLoading: isLoadingImmunizations,
    error: immunizationError,
  } = useR4ImmunizationData(fhirURL, token?.access_token || "", token?.patient);

  const {
    data: deviceData,
    isLoading: isLoadingDevices,
    error: deviceError,
  } = useR4DeviceData(fhirURL, token?.access_token || "", token?.patient);

  const {
    data: vitalSignsData,
    isLoading: isLoadingVitalSigns,
    error: vitalSignsError,
  } = useR4VitalSignsData(fhirURL, token?.access_token || "", token?.patient);

  return (
    <div>
      <PatientBanner patient={patientData} isLoading={isLoading} />

      <div className="container mx-auto px-8 py-8">
        <p>
          Welcome to the SMART on FHIR Provider EHR Launch example application!
        </p>
      </div>

      <div className="container mx-auto px-8">
        <Tabs
          tabs={[
            {
              id: "overview",
              label: "Overview",
              content: (
                <div className="space-y-6">
                  {!patientData && (
                    <div className="mt-4">
                      {isLoading && (
                        <div className="text-gray-600">
                          Loading patient data...
                        </div>
                      )}

                      {error && (
                        <div className="text-red-600">
                          Error loading patient data: {(error as Error).message}
                        </div>
                      )}

                      {!isLoading && !error && !patientData && (
                        <div className="text-gray-500">
                          No patient data available. Make sure you have a valid
                          token and patient context.
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <DataCard
                      title="Vital Signs"
                      icon={<Heart className="h-5 w-5" />}
                      count={vitalSignsData?.total}
                      isLoading={isLoadingVitalSigns}
                      error={vitalSignsError}
                    >
                      {vitalSignsData?.entry &&
                        vitalSignsData.entry.length > 0 && (
                          <div className="space-y-2">
                            {vitalSignsData.entry
                              .slice(0, 5)
                              .map((entry, index) => {
                                const resource = entry.resource as any;
                                
                                const bloodPressure = extractBloodPressureComponents(resource);
                                if (bloodPressure) {
                                  return (
                                    <div key={index} className="text-sm">
                                      <span className="font-medium">
                                        {bloodPressure.display}:
                                      </span>{" "}
                                      <span className="text-gray-600">
                                        {bloodPressure.systolic}/{bloodPressure.diastolic} {bloodPressure.unit}
                                      </span>
                                    </div>
                                  );
                                }

                                if ((resource as any)?.valueQuantity) {
                                  return (
                                    <div key={index} className="text-sm">
                                      <span className="font-medium">
                                        {(resource as any).code?.text || "Unknown"}:
                                      </span>{" "}
                                      <span className="text-gray-600">
                                        {(resource as any).valueQuantity.value}{" "}
                                        {(resource as any).valueQuantity.unit}
                                      </span>
                                    </div>
                                  );
                                }

                                return null;
                              })}
                            {vitalSignsData.entry.length > 5 && (
                              <p className="text-xs text-gray-500">
                                +{vitalSignsData.entry.length - 5} more
                              </p>
                            )}
                          </div>
                        )}
                    </DataCard>

                    <DataCard
                      title="Medications"
                      icon={<Pill className="h-5 w-5" />}
                      count={medicationData?.total}
                      isLoading={isLoadingMedications}
                      error={medicationError}
                    >
                      {medicationData?.entry &&
                        medicationData.entry.length > 0 && (
                          <div className="space-y-2">
                            {medicationData.entry
                              .slice(0, 3)
                              .map((entry, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {(entry.resource as any)?.medicationCodeableConcept
                                      ?.text ||
                                      (entry.resource as any)?.medicationReference
                                        ?.display ||
                                      "Unknown medication"}
                                  </span>
                                </div>
                              ))}
                            {medicationData.entry.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{medicationData.entry.length - 3} more
                              </p>
                            )}
                          </div>
                        )}
                    </DataCard>

                    <DataCard
                      title="Conditions"
                      icon={<Stethoscope className="h-5 w-5" />}
                      count={conditionData?.total}
                      isLoading={isLoadingConditions}
                      error={conditionError}
                    >
                      {conditionData?.entry &&
                        conditionData.entry.length > 0 && (
                          <div className="space-y-2">
                            {conditionData.entry
                              .slice(0, 3)
                              .map((entry, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {(entry.resource as any)?.code?.text ||
                                      "Unknown condition"}
                                  </span>
                                </div>
                              ))}
                            {conditionData.entry.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{conditionData.entry.length - 3} more
                              </p>
                            )}
                          </div>
                        )}
                    </DataCard>

                    <DataCard
                      title="Allergies"
                      icon={<AlertCircle className="h-5 w-5" />}
                      count={allergyData?.total}
                      isLoading={isLoadingAllergies}
                      error={allergyError}
                    >
                      {allergyData?.entry && allergyData.entry.length > 0 && (
                        <div className="space-y-2">
                          {allergyData.entry
                            .slice(0, 3)
                            .map((entry, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">
                                  {(entry.resource as any)?.code?.text ||
                                    "Unknown allergy"}
                                </span>
                                {(entry.resource as any)?.reaction?.[0]?.severity && (
                                  <span className="ml-2 text-xs text-red-600">
                                    ({(entry.resource as any).reaction[0].severity})
                                  </span>
                                )}
                              </div>
                            ))}
                          {allergyData.entry.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{allergyData.entry.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </DataCard>

                    <DataCard
                      title="Immunizations"
                      icon={<Syringe className="h-5 w-5" />}
                      count={immunizationData?.total}
                      isLoading={isLoadingImmunizations}
                      error={immunizationError}
                    >
                      {immunizationData?.entry &&
                        immunizationData.entry.length > 0 && (
                          <div className="space-y-2">
                            {immunizationData.entry
                              .slice(0, 3)
                              .map((entry, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">
                                    {(entry.resource as any)?.vaccineCode?.text ||
                                      "Unknown vaccine"}
                                  </span>
                                </div>
                              ))}
                            {immunizationData.entry.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{immunizationData.entry.length - 3} more
                              </p>
                            )}
                          </div>
                        )}
                    </DataCard>

                    <DataCard
                      title="Medical Devices"
                      icon={<Smartphone className="h-5 w-5" />}
                      count={deviceData?.total}
                      isLoading={isLoadingDevices}
                      error={deviceError}
                    >
                      {deviceData?.entry && deviceData.entry.length > 0 && (
                        <div className="space-y-2">
                          {deviceData.entry
                            .slice(0, 3)
                            .map((entry, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">
                                  {(entry.resource as any)?.deviceName?.[0]?.name ||
                                    (entry.resource as any)?.type?.text ||
                                    "Unknown device"}
                                </span>
                              </div>
                            ))}
                          {deviceData.entry.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{deviceData.entry.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </DataCard>

                    <DataCard
                      title="Encounters"
                      icon={<Shield className="h-5 w-5" />}
                      count={encounterData ? 1 : undefined}
                      isLoading={isLoadingEncounter}
                      error={encounterError}
                    >
                      {encounterData && (
                        <div className="text-sm">
                          <p className="font-medium">
                            {encounterData.class?.display || "Unknown type"}
                          </p>
                          <p className="text-gray-600">
                            {encounterData.status || "Unknown status"}
                          </p>
                          {encounterData.location?.[0]?.location?.display && (
                            <p className="text-gray-600">
                              {encounterData.location[0].location.display}
                            </p>
                          )}
                        </div>
                      )}
                    </DataCard>
                  </div>

                  <div className="mt-6">
                    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm">
                      <div className="px-4 py-5 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <Activity className="h-5 w-5 text-gray-400" />
                          <h3 className="text-base font-semibold leading-6 text-gray-900">
                            Lab Results
                          </h3>
                          {!isLoadingObservations &&
                            observationsData?.total !== undefined && (
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                {observationsData.total}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        <LabsTable
                          observationsData={observationsData || null}
                          isLoading={isLoadingObservations}
                          error={observationsError}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              id: "fhir-data",
              label: "Data Viewer",
              content: (
                <FhirDataViewer
                  patientData={patientData}
                  tokenData={token}
                  isLoadingPatient={isLoading}
                  patientError={error}
                  encounterData={encounterData}
                  isLoadingEncounter={isLoadingEncounter}
                  encounterError={encounterError}
                  observationsData={observationsData}
                  isLoadingObservations={isLoadingObservations}
                  observationsError={observationsError}
                  medicationData={medicationData}
                  isLoadingMedications={isLoadingMedications}
                  medicationError={medicationError}
                  conditionData={conditionData}
                  isLoadingConditions={isLoadingConditions}
                  conditionError={conditionError}
                  allergyData={allergyData}
                  isLoadingAllergies={isLoadingAllergies}
                  allergyError={allergyError}
                  immunizationData={immunizationData}
                  isLoadingImmunizations={isLoadingImmunizations}
                  immunizationError={immunizationError}
                  deviceData={deviceData}
                  isLoadingDevices={isLoadingDevices}
                  deviceError={deviceError}
                  vitalSignsData={vitalSignsData}
                  isLoadingVitalSigns={isLoadingVitalSigns}
                  vitalSignsError={vitalSignsError}
                  expiryInfo={expiryInfo}
                  onRefreshToken={refreshToken}
                  isRefreshing={isRefreshing}
                  refreshError={refreshError}
                  refreshSuccess={isSuccess}
                />
              ),
            },
          ]}
          defaultActiveTab="overview"
        />
      </div>
    </div>
  );
}
