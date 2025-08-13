import { describe, it, expect } from "vitest";
import urlJoin, { concatPath } from "./urlUtils";

describe("urlJoin", () => {
  describe("should join URL parts correctly", () => {
    it("joins simple paths", () => {
      expect(urlJoin("http://example.com", "path")).toBe("http://example.com/path");
      expect(urlJoin("http://example.com/", "path")).toBe("http://example.com/path");
      expect(urlJoin("http://example.com", "/path")).toBe("http://example.com/path");
      expect(urlJoin("http://example.com/", "/path")).toBe("http://example.com/path");
    });

    it("joins multiple path segments", () => {
      expect(urlJoin("http://example.com", "path", "to", "resource")).toBe(
        "http://example.com/path/to/resource"
      );
      expect(urlJoin("http://example.com/", "/path/", "/to/", "/resource")).toBe(
        "http://example.com/path/to/resource"
      );
    });

    it("preserves trailing slashes on final segment", () => {
      expect(urlJoin("http://example.com", "path/")).toBe("http://example.com/path/");
      expect(urlJoin("http://example.com", "path", "to/")).toBe(
        "http://example.com/path/to/"
      );
    });

    it("handles query parameters", () => {
      expect(urlJoin("http://example.com", "path?foo=bar")).toBe(
        "http://example.com/path?foo=bar"
      );
      expect(urlJoin("http://example.com/path", "?foo=bar")).toBe(
        "http://example.com/path?foo=bar"
      );
      expect(urlJoin("http://example.com/path/", "?foo=bar")).toBe(
        "http://example.com/path?foo=bar"
      );
    });

    it("handles multiple query parameters", () => {
      expect(urlJoin("http://example.com", "path?foo=bar", "?baz=qux")).toBe(
        "http://example.com/path?foo=bar&baz=qux"
      );
    });

    it("handles hash fragments", () => {
      expect(urlJoin("http://example.com", "path#section")).toBe(
        "http://example.com/path#section"
      );
      expect(urlJoin("http://example.com/path", "#section")).toBe(
        "http://example.com/path#section"
      );
      expect(urlJoin("http://example.com/path/", "#section")).toBe(
        "http://example.com/path#section"
      );
    });
  });

  describe("should handle different protocols", () => {
    it("handles https protocol", () => {
      expect(urlJoin("https://example.com", "path")).toBe("https://example.com/path");
    });

    it("handles file protocol with three slashes", () => {
      expect(urlJoin("file:///", "path", "to", "file")).toBe("file:///path/to/file");
      expect(urlJoin("file://", "/path/to/file")).toBe("file:///path/to/file");
    });

    it("handles protocol-relative URLs", () => {
      expect(urlJoin("//example.com", "path")).toBe("//example.com/path");
    });

    it("handles custom protocols", () => {
      expect(urlJoin("custom://example", "path")).toBe("custom://example/path");
    });
  });

  describe("should handle edge cases", () => {
    it("handles empty strings", () => {
      expect(urlJoin("http://example.com", "", "path")).toBe("http://example.com/path");
      expect(urlJoin("", "http://example.com", "path")).toBe("http://example.com/path");
    });

    it("handles single argument", () => {
      expect(urlJoin("http://example.com")).toBe("http://example.com");
      expect(urlJoin("http://example.com/")).toBe("http://example.com/");
    });

    it("handles no arguments", () => {
      expect(urlJoin()).toBe("");
    });

    it("handles only slashes", () => {
      expect(urlJoin("/", "/", "/")).toBe("/");
      expect(urlJoin("http://example.com", "/", "/", "path")).toBe(
        "http://example.com/path"
      );
    });

    it("handles relative paths", () => {
      expect(urlJoin("path", "to", "resource")).toBe("path/to/resource");
      expect(urlJoin("/path", "to", "resource")).toBe("/path/to/resource");
    });

    it("handles protocol without domain", () => {
      expect(urlJoin("http://", "example.com", "path")).toBe("http://example.com/path");
    });
  });

  describe("should handle malformed input gracefully", () => {
    it("throws TypeError for non-string arguments", () => {
      // @ts-expect-error Testing runtime type checking
      expect(() => urlJoin(123)).toThrow(TypeError);
      // @ts-expect-error Testing runtime type checking
      expect(() => urlJoin("http://example.com", null)).toThrow(TypeError);
      // @ts-expect-error Testing runtime type checking
      expect(() => urlJoin("http://example.com", undefined, "path")).toThrow(TypeError);
    });

    it("handles double slashes in paths", () => {
      expect(urlJoin("http://example.com", "//path//to//resource")).toBe(
        "http://example.com/path/to/resource"
      );
    });

    it("handles mixed slashes", () => {
      expect(urlJoin("http://example.com/", "/path/", "/to/", "/resource/")).toBe(
        "http://example.com/path/to/resource/"
      );
    });
  });
});

describe("concatPath", () => {
  it("should be an alias for urlJoin", () => {
    expect(concatPath("http://example.com", "path")).toBe("http://example.com/path");
    expect(concatPath("path", "to", "resource")).toBe("path/to/resource");
    expect(concatPath("http://example.com", "path", "?foo=bar")).toBe(
      "http://example.com/path?foo=bar"
    );
  });
});