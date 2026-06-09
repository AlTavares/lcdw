import type { SupportedLanguage } from "./languages"

export type CodeSnippet = {
  lang: string
  langSlug: string
  code: string
}

export type TopicTag = {
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

export type DownloadOptions = {
  cwd?: string
  fetcher?: typeof fetch
}
