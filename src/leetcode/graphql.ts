export const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

type GraphQLPayload<TData> = {
  data?: TData
  errors?: Array<{ message?: string }>
}

export async function requestGraphQL<TData>(
  operationName: string,
  query: string,
  variables: Record<string, unknown>,
  fetcher: typeof fetch = fetch,
) {
  const titleSlug = typeof variables.titleSlug === "string" ? variables.titleSlug : ""
  const response = await fetcher(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://leetcode.com",
      referer: titleSlug ? `https://leetcode.com/problems/${titleSlug}/` : "https://leetcode.com/",
      "user-agent": "lcdw/0.1.0",
    },
    body: JSON.stringify({
      operationName,
      variables,
      query,
    }),
  })

  if (!response.ok) {
    throw new Error(`LeetCode request failed with HTTP ${response.status}.`)
  }

  return (await response.json()) as GraphQLPayload<TData>
}

export function graphQLErrorMessage(errors: Array<{ message?: string }> | undefined) {
  return errors?.map((error) => error.message).filter(Boolean).join("; ")
}
