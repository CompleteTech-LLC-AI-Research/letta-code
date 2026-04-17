import { describe, expect, test } from "bun:test";
import {
  buildCavemanCommandPrompt,
  isCavemanCommandInput,
  normalizeCavemanMode,
  suppressPreparedClientTools,
} from "../../cli/commands/caveman";
import { commands, executeCommand } from "../../cli/commands/registry";
import type { PreparedToolExecutionContext } from "../../tools/manager";

describe("/caveman command", () => {
  test("matches slash-first caveman commands with trailing whitespace separators", () => {
    expect(isCavemanCommandInput("/caveman")).toBe(true);
    expect(isCavemanCommandInput("/caveman ultra")).toBe(true);
    expect(isCavemanCommandInput("/caveman\tultra")).toBe(true);
    expect(isCavemanCommandInput(" /caveman ultra")).toBe(false);
    expect(isCavemanCommandInput("/cavemanultra")).toBe(false);
  });

  test("normalizes supported cave-code modes", () => {
    expect(normalizeCavemanMode("")).toBe("full");
    expect(normalizeCavemanMode("lite")).toBe("lite");
    expect(normalizeCavemanMode("full")).toBe("full");
    expect(normalizeCavemanMode("ultra")).toBe("ultra");
    expect(normalizeCavemanMode("ulta")).toBe("ultra");
    expect(normalizeCavemanMode("wenyan")).toBe("wenyan-full");
    expect(normalizeCavemanMode("wenyan-lite")).toBe("wenyan-lite");
    expect(normalizeCavemanMode("wenyan-full")).toBe("wenyan-full");
    expect(normalizeCavemanMode("wenyan-ultra")).toBe("wenyan-ultra");
    expect(normalizeCavemanMode("wenyan-ulta")).toBe("wenyan-ultra");
    expect(normalizeCavemanMode("verbose")).toBeNull();
  });

  test("builds a mode-switch prompt without tool use", () => {
    const prompt = buildCavemanCommandPrompt("ultra");

    expect(prompt).toContain("Switch to cave-code ultra mode.");
    expect(prompt).toContain("abbreviate common technical nouns");
    expect(prompt).toContain("Do not call any tools");
    expect(prompt).toContain("for this conversation only");
  });

  test("registers /caveman as a built-in slash command", async () => {
    expect(commands["/caveman"]).toMatchObject({
      desc: "Switch cave-code mode",
    });

    await expect(executeCommand("/caveman ultra")).resolves.toEqual({
      success: false,
      output:
        "/caveman ultra must be used inside the interactive CLI; mode was not applied.",
    });
    await expect(executeCommand("/caveman nonsense")).resolves.toEqual({
      success: false,
      output:
        "Usage: /caveman [lite|full|ultra|wenyan-lite|wenyan-full|wenyan-ultra]",
    });
  });

  test("suppresses advertised client tools while preserving execution context", () => {
    const preparedToolContext: PreparedToolExecutionContext = {
      contextId: "ctx-1",
      loadedToolNames: ["Bash"],
      clientTools: [
        {
          name: "Bash",
          description: "Run a shell command",
          parameters: { type: "object" },
        },
      ],
    };

    expect(suppressPreparedClientTools(preparedToolContext)).toEqual({
      contextId: "ctx-1",
      loadedToolNames: ["Bash"],
      clientTools: [],
    });
  });
});
