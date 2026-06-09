import type { LeetCodeQuestion } from "./types"

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

export async function fetchQuestion(titleSlug: string, fetcher: typeof fetch = fetch) {
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
