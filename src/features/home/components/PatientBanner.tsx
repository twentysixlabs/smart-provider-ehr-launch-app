/// <reference types="@types/fhir/r4" />

import { MapPin } from "lucide-react";
import { useR4EncounterData } from "../../fhir/hooks/useFhirData";
import { useToken } from "../../auth";
import { storage } from "../../../core/storage";
import Config from "../../../config.json";

type Patient = fhir4.Patient;

interface PatientBannerProps {
  patient?: Patient;
  isLoading?: boolean;
}

function getFHIRBaseUrl(): string | null {
  return storage.getItem(Config.STORAGE_KEYS.FHIR_BASE_URL);
}

export function PatientBanner({ patient, isLoading }: PatientBannerProps) {
  const { token } = useToken();
  const fhirURL = getFHIRBaseUrl();

  const { data: encounterData } = useR4EncounterData(
    fhirURL,
    token?.access_token || "",
    token?.encounter
  );

  if (isLoading || !patient) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div>
          <div className="flex items-center space-x-4 mb-1">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <span className="text-gray-500">|</span>
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-5 text-sm">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <span className="text-gray-400">•</span>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <span className="text-gray-400">•</span>
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
            <span className="text-gray-400">•</span>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentLocation = encounterData?.location?.find(
    (loc) => loc.status === "active" || !loc.status
  )?.location?.display;

  const primaryName = patient.name?.[0];
  const displayName =
    primaryName?.text ||
    `${primaryName?.given?.join(" ") || ""} ${
      primaryName?.family || ""
    }`.trim() ||
    "Unknown Patient";

  const mrn =
    patient.identifier?.find(
      (id) =>
        id.type?.coding?.[0]?.code === "MR" ||
        id.system?.includes("mrn") ||
        id.type?.text?.toLowerCase().includes("medical record")
    )?.value ||
    patient.id ||
    "Unknown MRN";

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const age = patient.birthDate ? calculateAge(patient.birthDate) : null;

  const formattedDob = patient.birthDate
    ? new Date(patient.birthDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  const formattedGender = patient.gender
    ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
    : null;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div>
        <div className="flex items-center space-x-4 mb-1">
          <h3 className="font-semibold text-gray-900 text-lg">{displayName}</h3>
          <span className="text-gray-500">|</span>
          <span className="text-gray-700 font-medium">MRN: {mrn}</span>
        </div>
        <div className="flex items-center space-x-5 text-sm text-gray-600">
          {formattedGender && (
            <>
              <span>{formattedGender}</span>
              {(age !== null || formattedDob) && <span>•</span>}
            </>
          )}
          {age !== null && (
            <>
              <span>{age} years old</span>
              {formattedDob && <span>•</span>}
            </>
          )}
          {formattedDob && (
            <>
              <span>Born {formattedDob}</span>
              {currentLocation && <span>•</span>}
            </>
          )}
          {currentLocation && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentLocation}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
