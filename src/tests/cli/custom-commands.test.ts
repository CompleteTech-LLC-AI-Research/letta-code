import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  discoverCustomCommands,
  substituteArguments,
} from "../../cli/commands/custom";

describe("custom slash commands", () => {
  test("discovers markdown commands from .commands and substitutes arguments", async () => {
    const testRoot = await mkdtemp(join(tmpdir(), "letta-commands-test-"));
    try {
      const commandsDir = join(testRoot, ".commands");
      await mkdir(commandsDir, { recursive: true });
      await writeFile(
        join(commandsDir, "caveman.md"),
        [
          "---",
          "description: Switch caveman intensity",
          "argument-hint: [mode]",
          "---",
          "",
          "Switch to caveman $ARGUMENTS mode.",
        ].join("\n"),
      );

      const commands = await discoverCustomCommands(commandsDir);
      const caveman = commands.find(
        (command) => command.id === "caveman" && command.source === "project",
      );

      expect(caveman).toMatchObject({
        description: "Switch caveman intensity",
        argumentHint: "[mode]",
        content: "Switch to caveman $ARGUMENTS mode.",
      });
      expect(substituteArguments(caveman?.content ?? "", "ultra")).toBe(
        "Switch to caveman ultra mode.",
      );
    } finally {
      await rm(testRoot, { recursive: true, force: true });
    }
  });
});
