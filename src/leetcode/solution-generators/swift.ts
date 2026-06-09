import { htmlToPlainText } from "../html"
import type { LeetCodeQuestion } from "../types"
import type { SolutionGenerator } from "./types"

type SwiftSignature = {
  methodName: string
  returnType: string
  params: Array<{
    externalName: string
    internalName: string
    typeName: string
  }>
}

export const swiftSolutionGenerator: SolutionGenerator = {
  language: "swift",
  generate({ question, snippet }) {
    return renderSwiftSolution(question, snippet)
  },
}

export function renderSwiftSolution(question: LeetCodeQuestion, snippet: string) {
  const signature = parseSwiftSignature(snippet)
  const testCases = signature ? buildSwiftTestCases(question, signature) : []
  const rawSamples = question.exampleTestcases.trim()

  if (signature && testCases.length > 0) {
    return renderSwiftTableTestTemplate({
      snippet,
      signature,
      testCases,
    })
  } else {
    return renderSwiftFallbackTemplate({
      snippet,
      rawSamples,
    })
  }
}

function renderSwiftTableTestTemplate(input: {
  snippet: string
  signature: SwiftSignature
  testCases: string[]
}) {
  const testInputLabels = swiftTestInputLabels(input.signature)

  return `import Foundation

${input.snippet.trim()}

// MARK: - Sample Tests

func canonical(_ value: Any) -> String {
    String(describing: value).replacingOccurrences(of: " ", with: "")
}

func expect(_ actual: Any, _ expected: String, file: StaticString = #filePath, line: UInt = #line) {
    let normalizedExpected = expected.replacingOccurrences(of: " ", with: "")
    assert(canonical(actual) == normalizedExpected, "Expected \\(expected), got \\(actual)", file: file, line: line)
}

let solution = Solution()
let testCases = [
${input.testCases.map((testCase) => `    ${testCase},`).join("\n")}
]

for testCase in testCases {
    expect(solution.${input.signature.methodName}(${swiftMethodCallArguments(input.signature, testInputLabels)}), testCase.expected)
}
print("All sample tests passed")
`
}

function renderSwiftFallbackTemplate(input: {
  snippet: string
  rawSamples: string
}) {
  return `import Foundation

${input.snippet.trim()}

// MARK: - Sample Tests

let solution = Solution()

let rawSampleInput = """
${input.rawSamples}
"""

print("Add assertions for the sample input above after implementing the solution.")
`
}

export function parseSwiftSignature(snippet: string): SwiftSignature | null {
  const match = snippet.match(/func\s+(\w+)\s*\(([\s\S]*?)\)\s*(?:->\s*([^{\n]+))?/)

  if (!match?.[1]) {
    return null
  }

  const params = splitTopLevel(match[2] ?? "")
    .map((param) => param.trim())
    .filter(Boolean)
    .map((param) => {
      const [labelPart, typePart] = param.split(":")
      const labels = labelPart?.trim().split(/\s+/).filter(Boolean) ?? []
      const externalName = labels.length > 1 ? labels[0] ?? "_" : labels[0] ?? "_"
      const internalName = labels.at(-1) ?? `input${labels.length + 1}`

      return {
        externalName,
        internalName,
        typeName: typePart?.trim().replace(/=.*$/, "").trim() ?? "",
      }
    })

  return {
    methodName: match[1],
    returnType: match[3]?.trim() ?? "Void",
    params,
  }
}

function buildSwiftTestCases(question: LeetCodeQuestion, signature: SwiftSignature) {
  if (!isExecutableSwiftSignature(signature)) {
    return []
  }

  const inputs = question.exampleTestcases
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const outputs = extractExampleOutputs(question.content)
  const testCases: string[] = []
  const inputLabels = swiftTestInputLabels(signature)

  for (let index = 0; index < outputs.length; index += 1) {
    const start = index * signature.params.length
    const args = inputs.slice(start, start + signature.params.length)

    if (args.length !== signature.params.length) {
      break
    }

    const inputsTuple = args
      .map((arg, argIndex) => `${inputLabels[argIndex]}: ${literalToSwift(arg)}`)
      .join(", ")

    const expected = expectedOutputForSwift(signature.returnType, outputs[index] ?? "")
    testCases.push(`(${inputsTuple}, expected: ${swiftStringLiteral(expected)})`)
  }

  return testCases
}

function swiftTestInputLabels(signature: SwiftSignature) {
  return signature.params.map((param, index) => param.internalName || param.externalName || `input${index + 1}`)
}

function swiftMethodCallArguments(signature: SwiftSignature, testInputLabels: string[]) {
  return signature.params
    .map((param, index) => {
      const value = `testCase.${testInputLabels[index]}`

      if (param.externalName === "_") {
        return value
      }

      return `${param.externalName}: ${value}`
    })
    .join(", ")
}

function extractExampleOutputs(content: string) {
  const lines = htmlToPlainText(content)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const outputs: string[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ""

    if (line === "Output:" && lines[index + 1]) {
      outputs.push(cleanOutput(lines[index + 1] ?? ""))
      continue
    }

    const match = line.match(/^Output:\s*(.+)$/)
    if (match?.[1]) {
      outputs.push(cleanOutput(match[1]))
    }
  }

  return outputs
}

function cleanOutput(output: string) {
  return output.replace(/\s*Explanation:.*$/i, "").trim()
}

function expectedOutputForSwift(returnType: string, output: string) {
  if (returnType.replace(/\s/g, "") === "String") {
    try {
      const parsed = JSON.parse(output) as unknown

      if (typeof parsed === "string") {
        return parsed
      }
    } catch {
      return output
    }
  }

  return output
}

function literalToSwift(value: string) {
  return value.replace(/\bnull\b/g, "nil")
}

function swiftStringLiteral(value: string) {
  return JSON.stringify(value)
}

function isExecutableSwiftSignature(signature: SwiftSignature) {
  const supportedTypes = [...signature.params.map((param) => param.typeName), signature.returnType]

  return supportedTypes.every((type) => /^[\[\]\sA-Za-z0-9:?]+$/.test(type) && !/(ListNode|TreeNode|Node)/.test(type))
}

function splitTopLevel(value: string) {
  const parts: string[] = []
  let depth = 0
  let current = ""

  for (const char of value) {
    if (char === "[" || char === "(" || char === "<") {
      depth += 1
    }

    if (char === "]" || char === ")" || char === ">") {
      depth -= 1
    }

    if (char === "," && depth === 0) {
      parts.push(current)
      current = ""
      continue
    }

    current += char
  }

  if (current.trim()) {
    parts.push(current)
  }

  return parts
}
