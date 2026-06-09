import { afterEach, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { downloadProblem } from "./download";
import { twoSumQuestion } from "./test-utils";

const tmpDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tmpDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tmpDirs.length = 0;
});

test("downloads and writes the expected file structure", async () => {
  const cwd = await mkdtemp(join(process.cwd(), ".tmp-lcdw-test-"));
  tmpDirs.push(cwd);

  const fetcher = (async () =>
    new Response(
      JSON.stringify({
        data: {
          question: twoSumQuestion,
        },
      }),
      { status: 200 },
    )) as unknown as typeof fetch;

  const result = await downloadProblem(
    {
      problem: "two-sum",
      language: "swift",
      output: "LeetCode",
      overwrite: false,
    },
    { cwd, fetcher },
  );

  const directory = join(cwd, "LeetCode", "0001_TwoSum");
  expect(result.directory).toBe(join("LeetCode", "0001_TwoSum"));
  expect(await Bun.file(join(directory, "README.md")).exists()).toBe(true);
  expect(await Bun.file(join(directory, "Solution.swift")).exists()).toBe(true);
});
