import { expect, test } from "bun:test";
import { SUPPORTED_LANGUAGE_SLUGS } from "./languages";

test("includes LeetCode algorithm, database, data, and shell language slugs", () => {
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("cpp");
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("swift");
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("mysql");
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("pythondata");
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("bash");
});
