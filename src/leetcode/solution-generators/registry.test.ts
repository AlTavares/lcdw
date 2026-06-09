import { expect, test } from "bun:test";
import { getRegisteredSolutionGenerators } from "./registry";

test("registers dedicated solution generators", () => {
  expect(getRegisteredSolutionGenerators()).toEqual(["swift"]);
});
