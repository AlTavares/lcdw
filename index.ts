#!/usr/bin/env bun

import { createCli } from "trpc-cli";
import { router } from "./src/router";

export { router };

if (import.meta.main) {
  await createCli({
    router,
    name: "lcdw",
    description: "Download LeetCode problems into runnable local solution files.",
    version: "0.1.0",
  }).run();
}
