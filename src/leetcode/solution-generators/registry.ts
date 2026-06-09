import type { SupportedLanguage } from "../languages"
import type { LeetCodeQuestion } from "../types"
import { genericSolutionGenerator } from "./generic"
import { swiftSolutionGenerator } from "./swift"
import type { SolutionGenerator } from "./types"

const registeredGenerators = [swiftSolutionGenerator] satisfies SolutionGenerator[]

const generatorsByLanguage = new Map(
  registeredGenerators
    .filter((generator): generator is SolutionGenerator & { language: SupportedLanguage } => Boolean(generator.language))
    .map((generator) => [generator.language, generator]),
)

export function renderSolution(question: LeetCodeQuestion, snippet: string, language: SupportedLanguage) {
  const generator = generatorsByLanguage.get(language) ?? genericSolutionGenerator

  return generator.generate({
    question,
    snippet,
    language,
  })
}

export function getRegisteredSolutionGenerators() {
  return [...generatorsByLanguage.keys()]
}
