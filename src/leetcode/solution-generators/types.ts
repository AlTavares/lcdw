import type { SupportedLanguage } from "../languages"
import type { LeetCodeQuestion } from "../types"

export type GenerateSolutionInput = {
  question: LeetCodeQuestion
  snippet: string
  language: SupportedLanguage
}

export type SolutionGenerator = {
  language?: SupportedLanguage
  generate(input: GenerateSolutionInput): string
}
