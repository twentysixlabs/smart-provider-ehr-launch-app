import { describe, it, expect } from "vitest";
import { roundToTwoDecimalsOrInteger, extractBloodPressureComponents } from "./fhirUtils";

describe("roundToTwoDecimalsOrInteger", () => {
  describe("should return integers when no decimal part is needed", () => {
    it("returns integer for whole numbers", () => {
      expect(roundToTwoDecimalsOrInteger(10.0)).toBe(10);
      expect(roundToTwoDecimalsOrInteger(100)).toBe(100);
      expect(roundToTwoDecimalsOrInteger(0)).toBe(0);
    });

    it("returns integer when rounding results in whole number", () => {
      expect(roundToTwoDecimalsOrInteger(9.999)).toBe(10);
      expect(roundToTwoDecimalsOrInteger(10.001)).toBe(10);
    });
  });

  describe("should round to two decimal places", () => {
    it("rounds down when third decimal < 5", () => {
      expect(roundToTwoDecimalsOrInteger(10.123)).toBe(10.12);
      expect(roundToTwoDecimalsOrInteger(5.124)).toBe(5.12);
    });

    it("rounds up when third decimal >= 5", () => {
      expect(roundToTwoDecimalsOrInteger(10.126)).toBe(10.13);
      expect(roundToTwoDecimalsOrInteger(5.125)).toBe(5.13);
      expect(roundToTwoDecimalsOrInteger(3.456)).toBe(3.46);
    });

    it("preserves two decimal places when exact", () => {
      expect(roundToTwoDecimalsOrInteger(10.12)).toBe(10.12);
      expect(roundToTwoDecimalsOrInteger(5.01)).toBe(5.01);
    });
  });

  describe("should handle negative numbers", () => {
    it("returns negative integers when appropriate", () => {
      expect(roundToTwoDecimalsOrInteger(-10.0)).toBe(-10);
      expect(roundToTwoDecimalsOrInteger(-5)).toBe(-5);
    });

    it("rounds negative numbers correctly", () => {
      expect(roundToTwoDecimalsOrInteger(-5.567)).toBe(-5.57);
      expect(roundToTwoDecimalsOrInteger(-10.123)).toBe(-10.12);
      expect(roundToTwoDecimalsOrInteger(-10.126)).toBe(-10.13);
    });
  });

  describe("edge cases", () => {
    it("handles very small numbers", () => {
      expect(roundToTwoDecimalsOrInteger(0.001)).toBe(0);
      expect(roundToTwoDecimalsOrInteger(0.004)).toBe(0);
      expect(roundToTwoDecimalsOrInteger(0.005)).toBe(0.01);
    });

    it("handles very large numbers", () => {
      expect(roundToTwoDecimalsOrInteger(999999.999)).toBe(1000000);
      expect(roundToTwoDecimalsOrInteger(123456.789)).toBe(123456.79);
    });

    it("handles floating point precision issues", () => {
      
      expect(roundToTwoDecimalsOrInteger(2.145)).toBe(2.15);
      expect(roundToTwoDecimalsOrInteger(2.155)).toBe(2.16);
      expect(roundToTwoDecimalsOrInteger(1.005)).toBe(1.01);
      expect(roundToTwoDecimalsOrInteger(1.015)).toBe(1.02);
      expect(roundToTwoDecimalsOrInteger(0.545)).toBe(0.55);
      expect(roundToTwoDecimalsOrInteger(10.995)).toBe(11);
    });
  });
});

describe("extractBloodPressureComponents", () => {
  describe("should extract valid blood pressure data", () => {
    it("extracts systolic and diastolic from standard FHIR BP resource", () => {
      const resource = {
        code: { text: "Blood Pressure" },
        component: [
          {
            code: { text: "Systolic Blood Pressure" },
            valueQuantity: { value: 120, unit: "mmHg" }
          },
          {
            code: { text: "Diastolic Blood Pressure" },
            valueQuantity: { value: 80, unit: "mmHg" }
          }
        ]
      };
      
      const result = extractBloodPressureComponents(resource);
      expect(result).toEqual({
        systolic: 120,
        diastolic: 80,
        unit: "mmHg",
        display: "Blood Pressure"
      });
    });

    it("finds components using coding display", () => {
      const resource = {
        code: { text: "BP" },
        component: [
          {
            code: { 
              coding: [{ display: "Systolic pressure" }]
            },
            valueQuantity: { value: 130.5, unit: "mmHg" }
          },
          {
            code: { 
              coding: [{ display: "Diastolic pressure" }]
            },
            valueQuantity: { value: 85.3, unit: "mmHg" }
          }
        ]
      };
      
      const result = extractBloodPressureComponents(resource);
      expect(result).toEqual({
        systolic: 130.5,
        diastolic: 85.3,
        unit: "mmHg",
        display: "BP"
      });
    });

    it("handles case-insensitive matching", () => {
      const resource = {
        component: [
          {
            code: { text: "SYSTOLIC" },
            valueQuantity: { value: 110, unit: "mmHg" }
          },
          {
            code: { text: "DIASTOLIC" },
            valueQuantity: { value: 70, unit: "mmHg" }
          }
        ]
      };
      
      const result = extractBloodPressureComponents(resource);
      expect(result?.systolic).toBe(110);
      expect(result?.diastolic).toBe(70);
    });

    it("applies rounding to extracted values", () => {
      const resource = {
        component: [
          {
            code: { text: "Systolic" },
            valueQuantity: { value: 120.567, unit: "mmHg" }
          },
          {
            code: { text: "Diastolic" },
            valueQuantity: { value: 80.123, unit: "mmHg" }
          }
        ]
      };
      
      const result = extractBloodPressureComponents(resource);
      expect(result?.systolic).toBe(120.57);
      expect(result?.diastolic).toBe(80.12);
    });
  });

  describe("should return null for invalid data", () => {
    it("returns null when resource is null or undefined", () => {
      expect(extractBloodPressureComponents(null)).toBeNull();
      expect(extractBloodPressureComponents(undefined)).toBeNull();
    });

    it("returns null when no components exist", () => {
      expect(extractBloodPressureComponents({})).toBeNull();
      expect(extractBloodPressureComponents({ component: [] })).toBeNull();
    });

    it("returns null when systolic is missing", () => {
      const resource = {
        component: [
          {
            code: { text: "Diastolic" },
            valueQuantity: { value: 80, unit: "mmHg" }
          }
        ]
      };
      
      expect(extractBloodPressureComponents(resource)).toBeNull();
    });

    it("returns null when diastolic is missing", () => {
      const resource = {
        component: [
          {
            code: { text: "Systolic" },
            valueQuantity: { value: 120, unit: "mmHg" }
          }
        ]
      };
      
      expect(extractBloodPressureComponents(resource)).toBeNull();
    });

    it("returns null when values are missing", () => {
      const resource = {
        component: [
          {
            code: { text: "Systolic" },
            valueQuantity: { unit: "mmHg" }
          },
          {
            code: { text: "Diastolic" },
            valueQuantity: { value: 80, unit: "mmHg" }
          }
        ]
      };
      
      expect(extractBloodPressureComponents(resource)).toBeNull();
    });

    it("returns null for non-blood-pressure components", () => {
      const resource = {
        component: [
          {
            code: { text: "Heart Rate" },
            valueQuantity: { value: 72, unit: "bpm" }
          },
          {
            code: { text: "Temperature" },
            valueQuantity: { value: 98.6, unit: "F" }
          }
        ]
      };
      
      expect(extractBloodPressureComponents(resource)).toBeNull();
    });
  });

  describe("should handle default values", () => {
    it("uses default unit when not specified", () => {
      const resource = {
        component: [
          {
            code: { text: "Systolic" },
            valueQuantity: { value: 120 }
          },
          {
            code: { text: "Diastolic" },
            valueQuantity: { value: 80 }
          }
        ]
      };
      
      const result = extractBloodPressureComponents(resource);
      expect(result?.unit).toBe("mmHg");
    });

    it("uses default display when code.text is missing", () => {
      const resource = {
        component: [
          {
            code: { text: "Systolic" },
            valueQuantity: { value: 120, unit: "mmHg" }
          },
          {
            code: { text: "Diastolic" },
            valueQuantity: { value: 80, unit: "mmHg" }
          }
        ]
      };
      
      const result = extractBloodPressureComponents(resource);
      expect(result?.display).toBe("Blood Pressure");
    });
  });
});