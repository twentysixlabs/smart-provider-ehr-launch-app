export interface BloodPressureData {
  systolic: number;
  diastolic: number;
  unit: string;
  display: string;
}

export function extractBloodPressureComponents(resource: any): BloodPressureData | null {
  if (!resource?.component || resource.component.length === 0) {
    return null;
  }

  const findComponent = (components: any[], searchTerms: string[]) => {
    return components.find((c: any) => {
      const codeText = c.code?.text?.toLowerCase() || '';
      const hasTextMatch = searchTerms.some(term => codeText.includes(term));
      const hasCodingMatch = c.code?.coding?.some((coding: any) => 
        searchTerms.some(term => coding.display?.toLowerCase().includes(term))
      );
      return hasTextMatch || hasCodingMatch;
    });
  };

  const systolic = findComponent(resource.component, ['systolic']);
  const diastolic = findComponent(resource.component, ['diastolic']);

  if (!systolic || !diastolic || !systolic.valueQuantity?.value || !diastolic.valueQuantity?.value) {
    return null;
  }

  return {
    systolic: systolic.valueQuantity.value,
    diastolic: diastolic.valueQuantity.value,
    unit: systolic.valueQuantity?.unit || "mmHg",
    display: resource.code?.text || "Blood Pressure"
  };
}