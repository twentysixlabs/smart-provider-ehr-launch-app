/// <reference types="@types/fhir/r4" />

type Patient = fhir4.Patient;

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  const primaryName = patient.name?.[0];
  const displayName = primaryName?.text || 
    `${primaryName?.given?.join(" ") || ""} ${primaryName?.family || ""}`.trim() ||
    "Unknown Patient";
  
  const primaryAddress = patient.address?.[0];
  const primaryPhone = patient.telecom?.find(t => t.system === "phone");
  const primaryEmail = patient.telecom?.find(t => t.system === "email");
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
        <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
      </div>
      
      <div className="space-y-3">
        {patient.birthDate && (
          <div>
            <span className="text-sm font-medium text-gray-600">Birth Date: </span>
            <span className="text-sm text-gray-900">
              {new Date(patient.birthDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {patient.gender && (
          <div>
            <span className="text-sm font-medium text-gray-600">Gender: </span>
            <span className="text-sm text-gray-900 capitalize">{patient.gender}</span>
          </div>
        )}
        
        {primaryPhone && (
          <div>
            <span className="text-sm font-medium text-gray-600">Phone: </span>
            <span className="text-sm text-gray-900">{primaryPhone.value}</span>
          </div>
        )}
        
        {primaryEmail && (
          <div>
            <span className="text-sm font-medium text-gray-600">Email: </span>
            <span className="text-sm text-gray-900">{primaryEmail.value}</span>
          </div>
        )}
        
        {primaryAddress && (
          <div>
            <span className="text-sm font-medium text-gray-600">Address: </span>
            <div className="text-sm text-gray-900">
              {primaryAddress.line?.join(", ")}
              {primaryAddress.city && `, ${primaryAddress.city}`}
              {primaryAddress.state && `, ${primaryAddress.state}`}
              {primaryAddress.postalCode && ` ${primaryAddress.postalCode}`}
            </div>
          </div>
        )}
        
        {patient.identifier && patient.identifier.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-600">Identifiers: </span>
            <div className="text-sm text-gray-900">
              {patient.identifier.map((id, index) => (
                <div key={index} className="ml-2">
                  {id.system && <span className="text-gray-500">{id.system}: </span>}
                  {id.value}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <details className="mt-4">
        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
          View Raw FHIR Data
        </summary>
        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
          {JSON.stringify(patient, null, 2)}
        </pre>
      </details>
    </div>
  );
}