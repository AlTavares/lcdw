import { mkdir } from "node:fs/promises"
import { join } from "node:path"

export const SUPPORTED_LANGUAGE_SLUGS = [
  "cpp",
  "java",
  "python3",
  "python",
  "javascript",
  "typescript",
  "csharp",
  "c",
  "golang",
  "kotlin",
  "swift",
  "rust",
  "ruby",
  "php",
  "dart",
  "scala",
  "elixir",
  "erlang",
  "racket",
  "mysql",
  "mssql",
  "postgresql",
  "oraclesql",
  "pythondata",
  "bash",
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGE_SLUGS)[number]

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  cpp: "C++",
  java: "Java",
  python3: "Python3",
  python: "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
  csharp: "C#",
  c: "C",
  golang: "Go",
  kotlin: "Kotlin",
  swift: "Swift",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  dart: "Dart",
  scala: "Scala",
  elixir: "Elixir",
  erlang: "Erlang",
  racket: "Racket",
  mysql: "MySQL",
  mssql: "MS SQL Server",
  postgresql: "PostgreSQL",
  oraclesql: "Oracle",
  pythondata: "Pandas",
  bash: "Bash",
}

const LANGUAGE_EXTENSIONS: Record<SupportedLanguage, string> = {
  cpp: "cpp",
  java: "java",
  python3: "py",
  python: "py",
  javascript: "js",
  typescript: "ts",
  csharp: "cs",
  c: "c",
  golang: "go",
  kotlin: "kt",
  swift: "swift",
  rust: "rs",
  ruby: "rb",
  php: "php",
  dart: "dart",
  scala: "scala",
  elixir: "exs",
  erlang: "erl",
  racket: "rkt",
  mysql: "sql",
  mssql: "sql",
  postgresql: "sql",
  oraclesql: "sql",
  pythondata: "py",
  bash: "sh",
}

const LINE_COMMENTS: Record<SupportedLanguage, string> = {
  cpp: "//",
  java: "//",
  python3: "#",
  python: "#",
  javascript: "//",
  typescript: "//",
  csharp: "//",
  c: "//",
  golang: "//",
  kotlin: "//",
  swift: "//",
  rust: "//",
  ruby: "#",
  php: "#",
  dart: "//",
  scala: "//",
  elixir: "#",
  erlang: "%",
  racket: ";",
  mysql: "--",
  mssql: "--",
  postgresql: "--",
  oraclesql: "--",
  pythondata: "#",
  bash: "#",
}

type CodeSnippet = {
  lang: string
  langSlug: string
  code: string
}

type TopicTag = {
  name: string
}

export type LeetCodeQuestion = {
  questionId: string
  questionFrontendId: string
  title: string
  titleSlug: string
  content: string
  difficulty: string
  exampleTestcases: string
  codeSnippets: CodeSnippet[]
  topicTags: TopicTag[]
  hints: string[]
  isPaidOnly: boolean
}

export type DownloadInput = {
  problem: string
  language: SupportedLanguage
  output: string
  overwrite: boolean
}

type DownloadOptions = {
  cwd?: string
  fetcher?: typeof fetch
}

type GraphQLResponse = {
  data?: {
    question?: LeetCodeQuestion | null
  }
  errors?: Array<{ message?: string }>
}

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

const QUESTION_QUERY = `
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    content
    difficulty
    exampleTestcases
    isPaidOnly
    codeSnippets {
      lang
      langSlug
      code
    }
    topicTags {
      name
    }
    hints
  }
}
`

export async function downloadProblem(input: DownloadInput, options: DownloadOptions = {}) {
  const cwd = options.cwd ?? process.cwd()
  const slug = problemSlugFromInput(input.problem)
  const question = await fetchQuestion(slug, options.fetcher ?? fetch)

  if (question.isPaidOnly) {
    throw new Error(`${question.title} is marked as paid-only by LeetCode.`)
  }

  const snippet = findSnippet(question, input.language)
  const folder = problemFolderName(question)
  const problemDir = join(cwd, input.output, folder)
  const readmePath = join(problemDir, "README.md")
  const solutionPath = join(problemDir, solutionFileName(input.language))

  await mkdir(problemDir, { recursive: true })
  await writeFile(readmePath, renderReadme(question), input.overwrite)
  await writeFile(solutionPath, renderSolution(question, snippet.code, input.language), input.overwrite)

  return {
    problem: `${question.questionFrontendId}. ${question.title}`,
    directory: join(input.output, folder),
    files: [readmePath, solutionPath],
  }
}

export function problemSlugFromInput(input: string) {
  const trimmed = input.trim()

  if (!trimmed) {
    throw new Error("A LeetCode problem slug or URL is required.")
  }

  try {
    const url = new URL(trimmed)
    const parts = url.pathname.split("/").filter(Boolean)
    const problemIndex = parts.indexOf("problems")
    const slug = problemIndex >= 0 ? parts[problemIndex + 1] : undefined

    if (slug) {
      return slug
    }
  } catch {
    // Not a URL. Treat it as a LeetCode title slug below.
  }

  return trimmed
    .replace(/^\/+|\/+$/g, "")
    .replace(/^problems\//, "")
    .replace(/\/$/g, "")
}

export function problemFolderName(question: Pick<LeetCodeQuestion, "questionFrontendId" | "title">) {
  const numericId = Number(question.questionFrontendId)
  const prefix = Number.isFinite(numericId)
    ? String(numericId).padStart(4, "0")
    : sanitizePathPart(question.questionFrontendId)

  return `${prefix}_${toPascalCase(question.title)}`
}

export function solutionFileName(language: SupportedLanguage) {
  return `Solution.${LANGUAGE_EXTENSIONS[language]}`
}

async function fetchQuestion(titleSlug: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://leetcode.com",
      referer: `https://leetcode.com/problems/${titleSlug}/`,
      "user-agent": "lcdw/0.1.0",
    },
    body: JSON.stringify({
      operationName: "questionData",
      variables: { titleSlug },
      query: QUESTION_QUERY,
    }),
  })

  if (!response.ok) {
    throw new Error(`LeetCode request failed with HTTP ${response.status}.`)
  }

  const payload = (await response.json()) as GraphQLResponse
  const question = payload.data?.question

  if (!question) {
    const detail = payload.errors?.map((error) => error.message).filter(Boolean).join("; ")
    throw new Error(detail || `LeetCode problem not found: ${titleSlug}`)
  }

  return question
}

export function renderReadme(question: LeetCodeQuestion) {
  const topics = question.topicTags.map((tag) => tag.name).join(", ")
  const hints = question.hints
    .map((hint, index) => `${index + 1}. ${htmlToMarkdown(hint)}`)
    .join("\n")

  return [
    `# ${question.questionFrontendId}. ${question.title}`,
    "",
    `- Difficulty: ${question.difficulty}`,
    `- URL: https://leetcode.com/problems/${question.titleSlug}/`,
    topics ? `- Topics: ${topics}` : undefined,
    "",
    htmlToMarkdown(question.content),
    "",
    "## Example Testcases",
    "",
    "```text",
    question.exampleTestcases.trim(),
    "```",
    hints ? ["", "## Hints", "", hints].join("\n") : undefined,
    "",
  ]
    .filter((part): part is string => part !== undefined)
    .join("\n")
}

export function renderSwiftSolution(question: LeetCodeQuestion, snippet: string) {
  const signature = parseSwiftSignature(snippet)
  const examples = signature ? buildSwiftSampleTests(question, signature) : []
  const rawSamples = question.exampleTestcases.trim()
  const lines = [
    "import Foundation",
    "",
    snippet.trim(),
    "",
    "// MARK: - Sample Tests",
    "",
  ]

  if (examples.length > 0) {
    lines.push(
      "func canonical(_ value: Any) -> String {",
      '    String(describing: value).replacingOccurrences(of: " ", with: "")',
      "}",
      "",
      "func expect(_ actual: Any, _ expected: String, file: StaticString = #filePath, line: UInt = #line) {",
      "    let normalizedExpected = expected.replacingOccurrences(of: \" \", with: \"\")",
      "    assert(canonical(actual) == normalizedExpected, \"Expected \\(expected), got \\(actual)\", file: file, line: line)",
      "}",
      "",
      "let solution = Solution()",
      ...examples,
      'print("All sample tests passed")',
    )
  } else {
    lines.push(
      "let solution = Solution()",
      "",
      "let rawSampleInput = \"\"\"",
      rawSamples,
      "\"\"\"",
      "",
      'print("Add assertions for the sample input above after implementing the solution.")',
    )
  }

  return `${lines.join("\n")}\n`
}

export function renderSolution(question: LeetCodeQuestion, snippet: string, language: SupportedLanguage) {
  if (language === "swift") {
    return renderSwiftSolution(question, snippet)
  }

  return [
    snippet.trim(),
    "",
    renderSampleComment(question, language),
  ]
    .filter(Boolean)
    .join("\n")
}

type SwiftSignature = {
  methodName: string
  returnType: string
  params: Array<{
    externalName: string
    typeName: string
  }>
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

      return {
        externalName,
        typeName: typePart?.trim().replace(/=.*$/, "").trim() ?? "",
      }
    })

  return {
    methodName: match[1],
    returnType: match[3]?.trim() ?? "Void",
    params,
  }
}

function buildSwiftSampleTests(question: LeetCodeQuestion, signature: SwiftSignature) {
  if (!isExecutableSwiftSignature(signature)) {
    return []
  }

  const inputs = question.exampleTestcases
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const outputs = extractExampleOutputs(question.content)
  const examples: string[] = []

  for (let index = 0; index < outputs.length; index += 1) {
    const start = index * signature.params.length
    const args = inputs.slice(start, start + signature.params.length)

    if (args.length !== signature.params.length) {
      break
    }

    const callArgs = args.map((arg, argIndex) => {
      const param = signature.params[argIndex]
      const value = literalToSwift(arg)

      if (!param || param.externalName === "_") {
        return value
      }

      return `${param.externalName}: ${value}`
    })

    const expected = expectedOutputForSwift(signature.returnType, outputs[index] ?? "")
    examples.push(`expect(solution.${signature.methodName}(${callArgs.join(", ")}), ${swiftStringLiteral(expected)})`)
  }

  return examples
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

function renderSampleComment(question: LeetCodeQuestion, language: SupportedLanguage) {
  const rawSamples = question.exampleTestcases.trim()

  if (!rawSamples) {
    return ""
  }

  const comment = LINE_COMMENTS[language]
  const lines = [
    "Sample testcases:",
    ...rawSamples.split(/\r?\n/),
  ]

  return lines.map((line) => `${comment} ${line}`).join("\n")
}

function findSnippet(question: LeetCodeQuestion, language: SupportedLanguage) {
  const snippet = question.codeSnippets.find((candidate) => candidate.langSlug === language)

  if (!snippet) {
    const available = question.codeSnippets.map((candidate) => candidate.langSlug).join(", ")
    throw new Error(`No ${language} snippet found for ${question.title}. Available: ${available}`)
  }

  return snippet
}

async function writeFile(path: string, content: string, overwrite: boolean) {
  const file = Bun.file(path)

  if (!overwrite && (await file.exists())) {
    throw new Error(`${path} already exists. Pass --overwrite to replace it.`)
  }

  await Bun.write(path, content)
}

function htmlToMarkdown(html: string) {
  return decodeHtml(
    html
      .replace(/<sup>([\s\S]*?)<\/sup>/gi, "^$1")
      .replace(/<pre>\s*<code>([\s\S]*?)<\/code>\s*<\/pre>/gi, (_, code: string) => {
        return `\n\`\`\`text\n${stripTags(code).trim()}\n\`\`\`\n`
      })
      .replace(/<code>([\s\S]*?)<\/code>/gi, (_, code: string) => `\`${stripTags(code).trim()}\``)
      .replace(/<strong>([\s\S]*?)<\/strong>/gi, (_, text: string) => `**${text.trim()}**`)
      .replace(/<b>([\s\S]*?)<\/b>/gi, (_, text: string) => `**${text.trim()}**`)
      .replace(/<em>([\s\S]*?)<\/em>/gi, (_, text: string) => `_${text.trim()}_`)
      .replace(/<i>([\s\S]*?)<\/i>/gi, (_, text: string) => `_${text.trim()}_`)
      .replace(/<li>/gi, "- ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/?[^>]+>/g, "")
      .replace(/^[ \t]+- /gm, "- ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+\n/g, "\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  )
}

function htmlToPlainText(html: string) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|pre|div|li)>/gi, "\n")
      .replace(/<\/?[^>]+>/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  )
}

function stripTags(value: string) {
  return value.replace(/<\/?[^>]+>/g, "")
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
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

function sanitizePathPart(value: string) {
  return value.replace(/[^A-Za-z0-9]+/g, "").trim()
}

function toPascalCase(value: string) {
  return value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1)}`)
    .join("")
}
