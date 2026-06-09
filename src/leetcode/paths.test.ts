import { expect, test } from "bun:test";
import { problemSlugFromInput, problemFolderName, solutionFileName } from "./paths";
import { twoSumQuestion } from "./test-utils";

test("extracts a title slug from a LeetCode URL or slug", () => {
  expect(problemSlugFromInput("two-sum")).toBe("two-sum");
  expect(problemSlugFromInput("https://leetcode.com/problems/two-sum/description/")).toBe("two-sum");
  expect(problemSlugFromInput("/problems/two-sum/")).toBe("two-sum");
});

test("formats the problem folder name", () => {
  expect(problemFolderName(twoSumQuestion)).toBe("0001_TwoSum");
});

test("maps languages to solution filenames", () => {
  expect(solutionFileName("swift")).toBe("Solution.swift");
  expect(solutionFileName("typescript")).toBe("Solution.ts");
  expect(solutionFileName("csharp")).toBe("Solution.cs");
  expect(solutionFileName("pythondata")).toBe("Solution.py");
  expect(solutionFileName("mysql")).toBe("Solution.sql");
});
