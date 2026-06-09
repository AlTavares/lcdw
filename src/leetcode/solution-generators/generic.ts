import { LINE_COMMENTS } from "../languages"
import type { GenerateSolutionInput, SolutionGenerator } from "./types"

export const genericSolutionGenerator: SolutionGenerator = {
  generate({ question, snippet, language }) {
    return [
      snippet.trim(),
      "",
      renderSampleComment(question.exampleTestcases, LINE_COMMENTS[language]),
    ]
      .filter(Boolean)
      .join("\n")
  },
}

function renderSampleComment(exampleTestcases: string, comment: string) {
  const rawSamples = exampleTestcases.trim()

  if (!rawSamples) {
    return ""
  }

  const lines = [
    "Sample testcases:",
    ...rawSamples.split(/\r?\n/),
  ]

  return lines.map((line) => `${comment} ${line}`).join("\n")
}
