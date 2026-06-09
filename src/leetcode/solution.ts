import { LINE_COMMENTS, type SupportedLanguage } from "./languages"
import { renderSwiftSolution } from "./swift"
import type { LeetCodeQuestion } from "./types"

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
