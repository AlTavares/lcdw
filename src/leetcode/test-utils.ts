import type { LeetCodeQuestion } from "./types";

export const twoSumSwiftSnippet = `class Solution {
    func twoSum(_ nums: [Int], _ target: Int) -> [Int] {

    }
}`;

export const twoSumTypeScriptSnippet = `function twoSum(nums: number[], target: number): number[] {

};`;

export const twoSumQuestion: LeetCodeQuestion = {
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
