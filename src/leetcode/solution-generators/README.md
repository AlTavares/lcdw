# Solution Generators

Add a dedicated generator when a language needs custom template code around the LeetCode snippet.

1. Create a file in this folder, for example `typescript.ts`.
2. Export a `SolutionGenerator`.
3. Register it in `registry.ts`.

```ts
import type { SolutionGenerator } from "./types"

export const typescriptSolutionGenerator: SolutionGenerator = {
  language: "typescript",
  generate({ question, snippet }) {
    return [
      snippet.trim(),
      "",
      `// ${question.title}`,
    ].join("\n")
  },
}
```

Languages without a dedicated generator use `genericSolutionGenerator`, which appends the raw sample testcases as comments.
