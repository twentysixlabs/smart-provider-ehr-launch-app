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
    interpretation?: string;
    isAbnormal?: boolean;
  }[];
}

function isValueOutOfRange(value: string | number, normalRange?: string): boolean {
  if (!normalRange || value === "N/A") return false;
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return false;
  
  const dashMatch = normalRange.match(/^([\d.]+)-([\d.]+)$/);
  if (dashMatch) {
    const [, min, max] = dashMatch;
    return numValue < parseFloat(min) || numValue > parseFloat(max);
  }
  
  const lessMatch = normalRange.match(/^<=?([\d.]+)$/);
  if (lessMatch) {
    const [, max] = lessMatch;
    const isLessOrEqual = normalRange.startsWith('<=');
    return isLessOrEqual ? numValue > parseFloat(max) : numValue >= parseFloat(max);
  }
  
  const greaterMatch = normalRange.match(/^>=?([\d.]+)$/);
  if (greaterMatch) {
    const [, min] = greaterMatch;
    const isGreaterOrEqual = normalRange.startsWith('>=');
    return isGreaterOrEqual ? numValue < parseFloat(min) : numValue <= parseFloat(min);
  }
  
  return false;
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
    
    const loincCoding = observation.code?.coding?.find(c => c.system === "http://loinc.org");
    const code = loincCoding?.code || observation.code?.coding?.[0]?.code || "unknown";

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

    const interpretationText = observation.interpretation?.[0]?.text || 
                             observation.interpretation?.[0]?.coding?.[0]?.display || "";
    const isAbnormal = interpretationText.toLowerCase().includes('high') || 
                      interpretationText.toLowerCase().includes('low') ||
                      interpretationText.toLowerCase().includes('abnormal') ||
                      observation.interpretation?.[0]?.coding?.some(c => 
                        ['H', 'L', 'HH', 'LL', 'A', 'AA'].includes(c.code || '')
                      ) || false;
    
    labResult.results.push({
      date: effectiveDate,
      value: value,
      status: observation.status || "unknown",
      interpretation: interpretationText,
      isAbnormal: isAbnormal || isValueOutOfRange(value, labResult.normalRange),
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

  const displayDates = sortedDates;

  return (
    <>
      {sortedDates.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Showing all {sortedDates.length} test dates. 
          Date range: {new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString()} - {new Date(sortedDates[0]).toLocaleDateString()}
        </div>
      )}
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="relative min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-white py-3.5 pr-3 pl-4 text-left text-sm font-semibold whitespace-nowrap text-gray-900 sm:pl-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                  >
                    Lab Test
                  </th>
                  <th
                    scope="col"
                    className="sticky left-[120px] z-10 bg-white px-2 py-3.5 text-left text-sm font-semibold whitespace-nowrap text-gray-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
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
                    <td className="sticky left-0 z-10 bg-white py-2 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      {lab.name}
                    </td>
                    <td className="sticky left-[120px] z-10 bg-white px-2 py-2 text-sm whitespace-nowrap text-gray-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
                            <span className={result.isAbnormal ? "text-red-600 font-medium" : ""}>
                              {result.value}
                              {lab.unit && (
                                <span className={result.isAbnormal ? "text-red-500 ml-1" : "text-gray-500 ml-1"}>
                                  {lab.unit}
                                </span>
                              )}
                              {result.isAbnormal && result.interpretation && (
                                <span className="block text-xs text-red-500 mt-1">
                                  {result.interpretation}
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
