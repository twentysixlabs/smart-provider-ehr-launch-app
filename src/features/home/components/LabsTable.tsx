import type { Bundle, Observation } from "fhir/r4";

interface LabsTableProps {
  observationsData: Bundle | null;
  isLoading: boolean;
  error: unknown;
}

interface LabResult {
  name: string;
  code: string;
  normalRange?: string;
  unit?: string;
  results: {
    date: Date;
    value: string | number;
    status: string;
  }[];
}

export function LabsTable({
  observationsData,
  isLoading,
  error,
}: LabsTableProps) {
  if (isLoading) {
    return <div className="text-gray-600">Loading lab results...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">
        + Error loading lab results:{" "}
        {error instanceof Error ? error.message : "Unknown error occurred"}
      </div>
    );
  }

  if (
    !observationsData ||
    !observationsData.entry ||
    observationsData.entry.length === 0
  ) {
    return <div className="text-gray-500">No lab results available</div>;
  }

  const labsByCode = new Map<string, LabResult>();

  observationsData.entry.forEach((entry) => {
    const observation = entry.resource as Observation;

    if (!observation || observation.resourceType !== "Observation") return;

    const displayName =
      observation.code?.text ||
      observation.code?.coding?.[0]?.display ||
      "Unknown Lab";
    const code = observation.code?.coding?.[0]?.code || "unknown";

    let value: string | number = "N/A";
    let unit = "";

    if (observation.valueQuantity) {
      value = observation.valueQuantity.value || "N/A";
      unit = observation.valueQuantity.unit || "";
    } else if (observation.valueString) {
      value = observation.valueString;
    } else if (observation.valueCodeableConcept?.text) {
      value = observation.valueCodeableConcept.text;
    }

    const effectiveDate = observation.effectiveDateTime
      ? new Date(observation.effectiveDateTime)
      : new Date();

    if (!labsByCode.has(code)) {
      labsByCode.set(code, {
        name: displayName,
        code: code,
        unit: unit,
        normalRange: observation.referenceRange?.[0]?.text,
        results: [],
      });
    }

    const labResult = labsByCode.get(code);
    if (!labResult) {
      return;
    }
    
    if (!labResult.unit && unit) {
      labResult.unit = unit;
    }

    labResult.results.push({
      date: effectiveDate,
      value: value,
      status: observation.status || "unknown",
    });
  });

  const labs = Array.from(labsByCode.values());
  labs.forEach((lab) => {
    lab.results.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  const allDates = new Set<string>();
  labs.forEach((lab) => {
    lab.results.forEach((result) => {
      allDates.add(result.date.toISOString().split("T")[0]);
    });
  });

  const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a));

  const displayDates = sortedDates.slice(0, 7);

  return (
    <>
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="relative min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold whitespace-nowrap text-gray-900 sm:pl-0"
                  >
                    Lab Test
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap text-gray-900"
                  >
                    Normal Range
                  </th>
                  {displayDates.map((date) => (
                    <th
                      key={date}
                      scope="col"
                      className="px-2 py-3.5 text-center text-sm font-semibold whitespace-nowrap text-gray-900"
                    >
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {labs.map((lab) => (
                  <tr key={lab.code}>
                    <td className="py-2 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">
                      {lab.name}
                    </td>
                    <td className="px-2 py-2 text-sm whitespace-nowrap text-gray-500">
                      {lab.normalRange || "—"}
                    </td>
                    {displayDates.map((date) => {
                      const result = lab.results.find(
                        (r) => r.date.toISOString().split("T")[0] === date
                      );
                      return (
                        <td
                          key={date}
                          className="px-2 py-2 text-sm text-center whitespace-nowrap text-gray-900"
                        >
                          {result ? (
                            <span>
                              {result.value}
                              {lab.unit && (
                                <span className="text-gray-500 ml-1">
                                  {lab.unit}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
