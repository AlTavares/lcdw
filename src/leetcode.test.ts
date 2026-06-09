import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import {
  downloadProblem,
  getRegisteredSolutionGenerators,
  parseSwiftSignature,
  problemFolderName,
  problemSlugFromInput,
  renderReadme,
  renderSolution,
  renderSwiftSolution,
  solutionFileName,
  SUPPORTED_LANGUAGE_SLUGS,
  type LeetCodeQuestion,
} from "./leetcode";

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tmpDirs.length = 0;
});

test("extracts a title slug from a LeetCode URL or slug", () => {
  expect(problemSlugFromInput("two-sum")).toBe("two-sum");
  expect(problemSlugFromInput("https://leetcode.com/problems/two-sum/description/")).toBe("two-sum");
  expect(problemSlugFromInput("/problems/two-sum/")).toBe("two-sum");
});

test("formats the problem folder name", () => {
  expect(problemFolderName(twoSumQuestion)).toBe("0001_TwoSum");
});

test("includes LeetCode algorithm, database, data, and shell language slugs", () => {
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("cpp");
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("swift");
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("mysql");
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("pythondata");
  expect(SUPPORTED_LANGUAGE_SLUGS).toContain("bash");
});

test("maps languages to solution filenames", () => {
  expect(solutionFileName("swift")).toBe("Solution.swift");
  expect(solutionFileName("typescript")).toBe("Solution.ts");
  expect(solutionFileName("csharp")).toBe("Solution.cs");
  expect(solutionFileName("pythondata")).toBe("Solution.py");
  expect(solutionFileName("mysql")).toBe("Solution.sql");
});

test("registers dedicated solution generators", () => {
  expect(getRegisteredSolutionGenerators()).toEqual(["swift"]);
});

test("parses a Swift method signature", () => {
  expect(parseSwiftSignature(twoSumSwiftSnippet)).toEqual({
    methodName: "twoSum",
    returnType: "[Int]",
    params: [
      { externalName: "_", typeName: "[Int]" },
      { externalName: "_", typeName: "Int" },
    ],
  });
});

test("renders README markdown with metadata and examples", () => {
  const readme = renderReadme(twoSumQuestion);

  expect(readme).toContain("# 1. Two Sum");
  expect(readme).toContain("- Difficulty: Easy");
  expect(readme).toContain("https://leetcode.com/problems/two-sum/");
  expect(readme).toContain("<code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code>");
  expect(readme).toContain("```text\n[2,7,11,15]\n9\n```");
  expect(readme).toContain("<details>\n<summary>Hint 1</summary>");
  expect(readme).toContain("Use a <code>hash map</code>.");
});

test("renders a Swift solution file with sample assertions", () => {
  const solution = renderSwiftSolution(twoSumQuestion, twoSumSwiftSnippet);

  expect(solution).toContain("class Solution");
  expect(solution).toContain("expect(solution.twoSum([2,7,11,15], 9), \"[0,1]\")");
  expect(solution).toContain('print("All sample tests passed")');
});

test("renders non-Swift snippets with commented sample testcases", () => {
  const solution = renderSolution(twoSumQuestion, twoSumTypeScriptSnippet, "typescript");

  expect(solution).toContain("function twoSum");
  expect(solution).toContain("// Sample testcases:");
  expect(solution).toContain("// [2,7,11,15]");
});

test("downloads and writes the expected file structure", async () => {
  const cwd = await mkdtemp("/tmp/lcdw-test-");
  tmpDirs.push(cwd);

  const fetcher = (async () =>
    new Response(
      JSON.stringify({
        data: {
          question: twoSumQuestion,
        },
      }),
      { status: 200 },
    )) as unknown as typeof fetch;

  const result = await downloadProblem(
    {
      problem: "two-sum",
      language: "swift",
      output: "LeetCode",
      overwrite: false,
    },
    { cwd, fetcher },
  );

  const directory = join(cwd, "LeetCode", "0001_TwoSum");
  expect(result.directory).toBe(join("LeetCode", "0001_TwoSum"));
  expect(await Bun.file(join(directory, "README.md")).exists()).toBe(true);
  expect(await Bun.file(join(directory, "Solution.swift")).exists()).toBe(true);
});

const twoSumSwiftSnippet = `class Solution {
    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {

    }
}`;

const twoSumTypeScriptSnippet = `function twoSum(nums: number[], target: number): number[] {

};`;

const twoSumQuestion: LeetCodeQuestion = {
  questionId: "1",
  questionFrontendId: "1",
  title: "Two Sum",
  titleSlug: "two-sum",
  difficulty: "Easy",
  isPaidOnly: false,
  content: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to target.</p>
<p><strong>Example 1:</strong></p>
<pre><strong>Input:</strong> nums = [2,7,11,15], target = 9
<strong>Output:</strong> [0,1]
<strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
</pre>
<p><strong>Constraints:</strong></p>
<ul><li><code>2 &lt;= nums.length &lt;= 10<sup>4</sup></code></li></ul>`,
  exampleTestcases: `[2,7,11,15]
9`,
  codeSnippets: [
    {
      lang: "Swift",
      langSlug: "swift",
      code: twoSumSwiftSnippet,
    },
    {
      lang: "TypeScript",
      langSlug: "typescript",
      code: twoSumTypeScriptSnippet,
    },
  ],
  topicTags: [{ name: "Array" }, { name: "Hash Table" }],
  hints: ["Use a <code>hash map</code>."],
};
