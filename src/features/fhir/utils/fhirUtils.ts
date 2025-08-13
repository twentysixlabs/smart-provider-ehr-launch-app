export interface BloodPressureData {
  systolic: number;
  diastolic: number;
  unit: string;
  display: string;
}

export function roundToTwoDecimalsOrInteger(num: number): number {
  // Add a tiny epsilon to handle floating point precision issues
  // e.g., 2.155 * 100 = 215.49999999999997 in JavaScript
  const EPSILON = 1e-10;
  const roundedNum = Math.round((num + EPSILON) * 100) / 100;
  
  if (roundedNum % 1 === 0) {
    return Math.trunc(roundedNum);
  } else {
    return roundedNum;
  }
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
    systolic: roundToTwoDecimalsOrInteger(systolic.valueQuantity.value),
    diastolic: roundToTwoDecimalsOrInteger(diastolic.valueQuantity.value),
    unit: systolic.valueQuantity?.unit || "mmHg",
    display: resource.code?.text || "Blood Pressure"
  };
}