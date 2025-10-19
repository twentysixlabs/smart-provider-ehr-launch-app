'use client';

import {
  useObservationsQuery,
  useMedicationRequestsQuery,
  useConditionsQuery,
  useAllergiesQuery,
  useImmunizationsQuery,
  useDevicesQuery,
  useEncounterQuery,
} from '@/hooks/use-fhir-query';
import type { TokenData } from '@/types';
import { DataCard } from './data-card';
import { LabsTable } from './labs-table';
import {
  Heart,
  Pill,
  Stethoscope,
  AlertCircle,
  Syringe,
  Smartphone,
  Shield,
  Activity,
} from 'lucide-react';
import { motion } from 'motion/react';

interface PatientOverviewProps {
  fhirBaseUrl: string | null;
  token: TokenData | null;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function PatientOverview({ fhirBaseUrl, token }: PatientOverviewProps) {
  const { data: vitalSigns, isLoading: loadingVitals, error: vitalsError } = useObservationsQuery(
    fhirBaseUrl,
    token,
    'vital-signs'
  );

  const { data: observations, isLoading: loadingObs, error: obsError } = useObservationsQuery(
    fhirBaseUrl,
    token,
    'laboratory'
  );

  const { data: medications, isLoading: loadingMeds, error: medsError } = useMedicationRequestsQuery(
    fhirBaseUrl,
    token
  );

  const { data: conditions, isLoading: loadingConds, error: condsError } = useConditionsQuery(
    fhirBaseUrl,
    token
  );

  const { data: allergies, isLoading: loadingAllergies, error: allergiesError } = useAllergiesQuery(
    fhirBaseUrl,
    token
  );

  const { data: immunizations, isLoading: loadingImmunizations, error: immunizationsError } = useImmunizationsQuery(
    fhirBaseUrl,
    token
  );

  const { data: devices, isLoading: loadingDevices, error: devicesError } = useDevicesQuery(
    fhirBaseUrl,
    token
  );

  const { data: encounter, isLoading: loadingEncounter, error: encounterError } = useEncounterQuery(
    fhirBaseUrl,
    token
  );

  return (
    <div className="space-y-6">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <DataCard
            title="Vital Signs"
            icon={<Heart className="h-5 w-5" />}
            count={vitalSigns?.total ?? vitalSigns?.entry?.length}
            isLoading={loadingVitals}
            error={vitalsError}
            resourceType="vital-signs"
            data={vitalSigns}
          />
        </motion.div>

        <motion.div variants={item}>
          <DataCard
            title="Medications"
            icon={<Pill className="h-5 w-5" />}
            count={medications?.total ?? medications?.entry?.length}
            isLoading={loadingMeds}
            error={medsError}
            resourceType="medications"
            data={medications}
          />
        </motion.div>

        <motion.div variants={item}>
          <DataCard
            title="Conditions"
            icon={<Stethoscope className="h-5 w-5" />}
            count={conditions?.total ?? conditions?.entry?.length}
            isLoading={loadingConds}
            error={condsError}
            resourceType="conditions"
            data={conditions}
          />
        </motion.div>

        <motion.div variants={item}>
          <DataCard
            title="Allergies"
            icon={<AlertCircle className="h-5 w-5" />}
            count={allergies?.total ?? allergies?.entry?.length}
            isLoading={loadingAllergies}
            error={allergiesError}
            resourceType="allergies"
            data={allergies}
          />
        </motion.div>

        <motion.div variants={item}>
          <DataCard
            title="Immunizations"
            icon={<Syringe className="h-5 w-5" />}
            count={immunizations?.total ?? immunizations?.entry?.length}
            isLoading={loadingImmunizations}
            error={immunizationsError}
            resourceType="immunizations"
            data={immunizations}
          />
        </motion.div>

        <motion.div variants={item}>
          <DataCard
            title="Medical Devices"
            icon={<Smartphone className="h-5 w-5" />}
            count={devices?.total ?? devices?.entry?.length}
            isLoading={loadingDevices}
            error={devicesError}
            resourceType="devices"
            data={devices}
          />
        </motion.div>

        <motion.div variants={item}>
          <DataCard
            title="Encounter"
            icon={<Shield className="h-5 w-5" />}
            count={encounter ? 1 : undefined}
            isLoading={loadingEncounter}
            error={encounterError}
            resourceType="encounter"
            encounter={encounter ?? undefined}
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="divide-y divide-border overflow-hidden rounded-lg border bg-card shadow-sm"
      >
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold leading-6">Lab Results</h3>
            {!loadingObs && observations?.total !== undefined && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {observations.total}
              </span>
            )}
          </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <LabsTable
            observations={observations ?? null}
            isLoading={loadingObs}
            error={obsError}
          />
        </div>
      </motion.div>
    </div>
  );
}
