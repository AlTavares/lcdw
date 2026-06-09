import { graphQLErrorMessage, requestGraphQL } from "./graphql"
import type { LeetCodeQuestion } from "./types"

type GraphQLResponse = {
  question?: LeetCodeQuestion | null
}

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

export async function fetchQuestion(titleSlug: string, fetcher: typeof fetch = fetch) {
  const payload = await requestGraphQL<GraphQLResponse>("questionData", QUESTION_QUERY, { titleSlug }, fetcher)
  const question = payload.data?.question

  if (!question) {
    const detail = graphQLErrorMessage(payload.errors)
    throw new Error(detail || `LeetCode problem not found: ${titleSlug}`)
  }

  return question
}
