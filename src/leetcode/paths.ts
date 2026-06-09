import { LANGUAGE_EXTENSIONS, type SupportedLanguage } from "./languages"
import type { LeetCodeQuestion } from "./types"

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
