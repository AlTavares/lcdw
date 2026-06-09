import type { LeetCodeQuestion } from "./types"

export function renderReadme(question: LeetCodeQuestion) {
  const topics = question.topicTags.map((tag) => tag.name).join(", ")
  const hints = renderHints(question.hints)

  return [
    `# ${question.questionFrontendId}. ${question.title}`,
    "",
    `- Difficulty: ${question.difficulty}`,
    `- URL: https://leetcode.com/problems/${question.titleSlug}/`,
    topics ? `- Topics: ${topics}` : undefined,
    "",
    question.content.trim(),
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

function renderHints(hints: string[]) {
  return hints
    .map((hint, index) => {
      return [
        "<details>",
        `<summary>Hint ${index + 1}</summary>`,
        "",
        hint.trim(),
        "",
        "</details>",
      ].join("\n")
    })
    .join("\n\n")
}
