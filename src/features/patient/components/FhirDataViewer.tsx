import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Bundle, Encounter, Patient } from "fhir/r4";
import type { TokenData } from "../../auth/contexts/TokenContext";

interface FhirDataViewerProps {
  patientData: Patient | undefined;
  tokenData: TokenData | null;
  isLoadingPatient: boolean;
  patientError: Error | null;
  encounterData: Encounter | undefined;
  isLoadingEncounter: boolean;
  encounterError: Error | null;
  observationsData: Bundle | undefined;
  isLoadingObservations: boolean;
  observationsError: Error | null;
  medicationData: Bundle | undefined;
  isLoadingMedications: boolean;
  medicationError: Error | null;
  conditionData: Bundle | undefined;
  isLoadingConditions: boolean;
  conditionError: Error | null;
  allergyData: Bundle | undefined;
  isLoadingAllergies: boolean;
  allergyError: Error | null;
  immunizationData: Bundle | undefined;
  isLoadingImmunizations: boolean;
  immunizationError: Error | null;
  deviceData: Bundle | undefined;
  isLoadingDevices: boolean;
  deviceError: Error | null;
  vitalSignsData: Bundle | undefined;
  isLoadingVitalSigns: boolean;
  vitalSignsError: Error | null;
  expiryInfo: { message: string; expired: boolean } | null;
  onRefreshToken: () => void;
  isRefreshing: boolean;
  refreshError: string | null;
  refreshSuccess: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  data: unknown;
  isLoading?: boolean;
  error?: Error | null;
}

function CollapsibleSection({
  title,
  data,
  isLoading,
  error,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg"
      >
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <span className="text-sm text-gray-500">
          {isLoading
            ? "Loading..."
            : error
            ? "Error"
            : data
            ? "Available"
            : "No data"}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 bg-white rounded-b-lg">
          {isLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-600">Error: {error.message}</div>
          ) : data ? (
            <pre className="text-xs overflow-auto bg-gray-50 p-3 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <div className="text-gray-500">No data available</div>
          )}
        </div>
      )}
    </div>
  );
}

export function FhirDataViewer({
  patientData,
  tokenData,
  isLoadingPatient,
  patientError,
  encounterData,
  isLoadingEncounter,
  encounterError,
  observationsData,
  isLoadingObservations,
  observationsError,
  medicationData,
  isLoadingMedications,
  medicationError,
  conditionData,
  isLoadingConditions,
  conditionError,
  allergyData,
  isLoadingAllergies,
  allergyError,
  immunizationData,
  isLoadingImmunizations,
  immunizationError,
  deviceData,
  isLoadingDevices,
  deviceError,
  vitalSignsData,
  isLoadingVitalSigns,
  vitalSignsError,
  expiryInfo,
  onRefreshToken,
  isRefreshing,
  refreshError,
  refreshSuccess,
}: FhirDataViewerProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (refreshSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [refreshSuccess]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Data Explorer
        </h2>
        <p className="text-sm text-gray-600">
          View token information and raw FHIR JSON responses from the APIs.
          Click on any section to expand.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-medium text-gray-900">Token Data</h3>
        {expiryInfo && (
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              expiryInfo.expired
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {expiryInfo.message}
          </span>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <CollapsibleSection title="Access Token Data" data={tokenData} />

        {tokenData?.refresh_token && (
          <div className="flex items-center gap-4">
            <button
              onClick={onRefreshToken}
              disabled={isRefreshing}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isRefreshing ? "Refreshing..." : "Refresh Token Now"}
            </button>
          </div>
        )}

        {refreshError && <p className="text-red-500">Error: {refreshError}</p>}

        {showSuccess && (
          <p className="text-green-600">Token refreshed successfully!</p>
        )}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Raw API Responses
      </h3>

      <div className="space-y-4">
        <CollapsibleSection
          title="Patient Resource"
          data={patientData}
          isLoading={isLoadingPatient}
          error={patientError}
        />

        <CollapsibleSection
          title="Encounter Resource"
          data={encounterData}
          isLoading={isLoadingEncounter}
          error={encounterError}
        />

        <CollapsibleSection
          title={`Laboratory Results ${
            observationsData?.total ? `- ${observationsData.total} results` : ""
          }`}
          data={observationsData}
          isLoading={isLoadingObservations}
          error={observationsError}
        />

        <CollapsibleSection
          title={`Medications ${
            medicationData?.total ? `- ${medicationData.total} medications` : ""
          }`}
          data={medicationData}
          isLoading={isLoadingMedications}
          error={medicationError}
        />

        <CollapsibleSection
          title={`Conditions ${
            conditionData?.total ? `- ${conditionData.total} conditions` : ""
          }`}
          data={conditionData}
          isLoading={isLoadingConditions}
          error={conditionError}
        />

        <CollapsibleSection
          title={`Allergies & Intolerances ${
            allergyData?.total ? `- ${allergyData.total} entries` : ""
          }`}
          data={allergyData}
          isLoading={isLoadingAllergies}
          error={allergyError}
        />

        <CollapsibleSection
          title={"Immunizations"}
          data={immunizationData}
          isLoading={isLoadingImmunizations}
          error={immunizationError}
        />

        <CollapsibleSection
          title={`Medical Devices ${
            deviceData?.total ? `- ${deviceData.total} devices` : ""
          }`}
          data={deviceData}
          isLoading={isLoadingDevices}
          error={deviceError}
        />

        <CollapsibleSection
          title={`Vital Signs ${
            vitalSignsData?.total
              ? `- ${vitalSignsData.total} measurements`
              : ""
          }`}
          data={vitalSignsData}
          isLoading={isLoadingVitalSigns}
          error={vitalSignsError}
        />
      </div>
    </div>
  );
}
