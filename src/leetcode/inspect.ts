import { graphQLErrorMessage, requestGraphQL } from "./graphql"

type InspectOptions = {
  fetcher?: typeof fetch
}

type QuestionFieldsResponse = {
  questionNode?: QuestionType | null
  question?: QuestionType | null
}

type QuestionType = {
    name: string
    fields: Array<{
      name: string
      type: {
        kind: string
        name?: string | null
        ofType?: {
          kind: string
          name?: string | null
          ofType?: {
            kind: string
            name?: string | null
          } | null
        } | null
      }
    }>
}

const QUESTION_TYPE_QUERY = `
query inspectQuestionType {
  questionNode: __type(name: "QuestionNode") {
    name
    fields {
      name
      type {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
          }
        }
      }
    }
  }
  question: __type(name: "Question") {
    name
    fields {
      name
      type {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
          }
        }
      }
    }
  }
}
`

const QUESTION_QUERY_BLOCKS = [
  {
    name: "core",
    operationName: "inspectQuestionCore",
    query: `
query inspectQuestionCore($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId
    title
    titleSlug
    translatedTitle
    difficulty
    isPaidOnly
    status
    content
    translatedContent
    exampleTestcases
    sampleTestCase
    hints
    metaData
    stats
    similarQuestions
  }
}
`,
  },
  {
    name: "runtime",
    operationName: "inspectQuestionRuntime",
    query: `
query inspectQuestionRuntime($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    judgerAvailable
    judgeType
    enableRunCode
    enableTestMode
    enableDebugger
    envInfo
    libraryUrl
  }
}
`,
  },
  {
    name: "snippets",
    operationName: "inspectQuestionSnippets",
    query: `
query inspectQuestionSnippets($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    codeSnippets {
      lang
      langSlug
      code
    }
  }
}
`,
  },
  {
    name: "tags",
    operationName: "inspectQuestionTags",
    query: `
query inspectQuestionTags($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    topicTags {
      name
      slug
      translatedName
    }
  }
}
`,
  },
  {
    name: "solution",
    operationName: "inspectQuestionSolution",
    query: `
query inspectQuestionSolution($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    solution {
      id
      canSeeDetail
      paidOnly
      hasVideoSolution
      paidOnlyVideo
    }
  }
}
`,
  },
] as const

export async function inspectQuestion(titleSlug: string, options: InspectOptions = {}) {
  const fetcher = options.fetcher ?? fetch
  const [schema, ...blocks] = await Promise.all([
    inspectQuestionSchema(fetcher),
    ...QUESTION_QUERY_BLOCKS.map((block) =>
      inspectQuestionBlock(titleSlug, block.name, block.operationName, block.query, fetcher),
    ),
  ])

  return {
    titleSlug,
    schema,
    question: blocks.reduce<Record<string, unknown>>((merged, block) => {
      if (block.question) {
        Object.assign(merged, block.question)
      }

      return merged
    }, {}),
    blocks,
  }
}

async function inspectQuestionSchema(fetcher: typeof fetch) {
  const payload = await requestGraphQL<QuestionFieldsResponse>("inspectQuestionType", QUESTION_TYPE_QUERY, {}, fetcher)

  return {
    type: payload.data?.questionNode ?? payload.data?.question ?? null,
    errors: graphQLErrorMessage(payload.errors),
  }
}

async function inspectQuestionBlock(
  titleSlug: string,
  name: string,
  operationName: string,
  query: string,
  fetcher: typeof fetch,
) {
  const payload = await requestGraphQL<{ question?: Record<string, unknown> | null }>(
    operationName,
    query,
    { titleSlug },
    fetcher,
  )

  return {
    name,
    question: payload.data?.question ?? null,
    errors: graphQLErrorMessage(payload.errors),
  }
}
