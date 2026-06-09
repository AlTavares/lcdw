import { os } from "@orpc/server";
import { z } from "zod/v4";
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGE_SLUGS, downloadProblem } from "./leetcode";

const downloadInput = z.object({
  problem: z
    .string()
    .min(1)
    .meta({
      positional: true,
      title: "problem",
      description: "LeetCode title slug or URL, e.g. two-sum",
    }),
  language: z
    .enum(SUPPORTED_LANGUAGE_SLUGS)
    .meta({
      alias: "l",
      description: `Solution snippet language to download. Supported: ${SUPPORTED_LANGUAGE_SLUGS.map((slug) => `${slug} (${LANGUAGE_LABELS[slug]})`).join(", ")}.`,
    }),
  output: z
    .string()
    .default("LeetCode")
    .meta({
      alias: "o",
      description: "Directory where problem folders are written.",
    }),
  overwrite: z
    .boolean()
    .default(false)
    .meta({
      description: "Replace README.md and Solution.* if they already exist.",
    }),
});

export const router = os.router({
  download: os
    .meta({
      default: true,
      description: "Download a LeetCode problem into README.md and a language-specific Solution file.",
      examples: [
        "lcdw two-sum --language swift",
        "lcdw two-sum --language typescript",
        "lcdw https://leetcode.com/problems/two-sum/ --language swift",
      ],
    })
    .input(downloadInput)
    .handler(async ({ input }) => downloadProblem(input)),
});
