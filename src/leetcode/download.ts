import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { fetchQuestion } from "./client"
import { writeFile } from "./file-system"
import { problemFolderName, problemSlugFromInput, solutionFileName } from "./paths"
import { renderReadme } from "./readme"
import { renderSolution } from "./solution"
import type { DownloadInput, DownloadOptions, LeetCodeQuestion } from "./types"

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

function findSnippet(question: LeetCodeQuestion, language: string) {
  const snippet = question.codeSnippets.find((candidate) => candidate.langSlug === language)

  if (!snippet) {
    const available = question.codeSnippets.map((candidate) => candidate.langSlug).join(", ")
    throw new Error(`No ${language} snippet found for ${question.title}. Available: ${available}`)
  }

  return snippet
}
