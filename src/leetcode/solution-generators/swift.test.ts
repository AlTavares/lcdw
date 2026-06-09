import { test, expect, describe } from "bun:test"
import { extractExampleOutputs, parseSwiftSignature, renderSwiftSolution } from "./swift"
import { twoSumSwiftSnippet, twoSumQuestion } from "../test-utils"

describe("extractExampleOutputs", () => {
  test("extracts single output with explanation", () => {
    const html = `
      <p><strong>Example 1:</strong></p>
      <pre><strong>Input:</strong> nums = [2,7,11,15], target = 9
      <strong>Output:</strong> [0,1]
      <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
      </pre>
    `
    expect(extractExampleOutputs(html)).toEqual(["[0,1]"])
  })

  test("extracts multiple outputs", () => {
    const html = `
      <p><strong>Example 1:</strong></p>
      <pre><strong>Input:</strong> l1 = [2,4,3], l2 = [5,6,4]
      <strong>Output:</strong> [7,0,8]
      <strong>Explanation:</strong> 342 + 465 = 807.
      </pre>

      <p><strong>Example 2:</strong></p>
      <pre><strong>Input:</strong> l1 = [0], l2 = [0]
      <strong>Output:</strong> [0]
      </pre>
    `
    expect(extractExampleOutputs(html)).toEqual(["[7,0,8]", "[0]"])
  })

  test("extracts output without explanation", () => {
    const html = `
      <p><strong>Example 1:</strong></p>
      <pre><strong>Input:</strong> x = 121
      <strong>Output:</strong> true
      </pre>
    `
    expect(extractExampleOutputs(html)).toEqual(["true"])
  })

  test("handles output on the next line", () => {
    const html = `
      <p><strong>Example 1:</strong></p>
      <pre><strong>Input:</strong> s = "abcabcbb"
      <strong>Output:</strong> 
      3
      <strong>Explanation:</strong> The answer is "abc", with the length of 3.
      </pre>
    `
    expect(extractExampleOutputs(html)).toEqual(["3"])
  })

  test("handles plain text", () => {
    const text = `
Example 1:
Input: nums = [1,2,3]
Output: [1,2,3]
Explanation: The answer is [1,2,3]
    `
    expect(extractExampleOutputs(text)).toEqual(["[1,2,3]"])
  })

  test("handles explanation on the same line", () => {
    const html = `
      <p><strong>Example 1:</strong></p>
      <pre><strong>Input:</strong> n = 2
      <strong>Output:</strong> 2 <strong>Explanation:</strong> There are two ways to climb to the top.
      1. 1 step + 1 step
      2. 2 steps
      </pre>
    `
    expect(extractExampleOutputs(html)).toEqual(["2"])
  })
})

test("parses a Swift method signature", () => {
  expect(parseSwiftSignature(twoSumSwiftSnippet)).toEqual({
    methodName: "twoSum",
    returnType: "[Int]",
    params: [
      { externalName: "_", internalName: "nums", typeName: "[Int]" },
      { externalName: "_", internalName: "target", typeName: "Int" },
    ],
  })
})

test("renders a Swift solution file with sample assertions", () => {
  const solution = renderSwiftSolution(twoSumQuestion, twoSumSwiftSnippet)

  expect(solution).toContain("class Solution")
  expect(solution).toContain("let testCases = [")
  expect(solution).toContain('(nums: [2,7,11,15], target: 9, expected: [0,1])')
})
