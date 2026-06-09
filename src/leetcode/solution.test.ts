import { expect, test } from "bun:test";
import { renderSolution } from "./solution";
import { twoSumQuestion, twoSumTypeScriptSnippet } from "./test-utils";

test("renders non-Swift snippets with commented sample testcases", () => {
  const solution = renderSolution(twoSumQuestion, twoSumTypeScriptSnippet, "typescript");

  expect(solution).toContain("function twoSum");
  expect(solution).toContain("// Sample testcases:");
  expect(solution).toContain("// [2,7,11,15]");
});
