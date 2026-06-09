import { expect, test } from "bun:test";
import { renderReadme } from "./readme";
import { twoSumQuestion } from "./test-utils";

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
