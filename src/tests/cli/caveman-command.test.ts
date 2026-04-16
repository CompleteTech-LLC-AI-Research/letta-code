import { describe, expect, test } from "bun:test";
import {
  buildCavemanCommandPrompt,
  normalizeCavemanMode,
} from "../../cli/commands/caveman";
import { commands, executeCommand } from "../../cli/commands/registry";

describe("/caveman command", () => {
  test("normalizes supported caveman modes", () => {
    expect(normalizeCavemanMode("")).toBe("full");
    expect(normalizeCavemanMode("lite")).toBe("lite");
    expect(normalizeCavemanMode("full")).toBe("full");
    expect(normalizeCavemanMode("ultra")).toBe("ultra");
    expect(normalizeCavemanMode("ulta")).toBe("ultra");
    expect(normalizeCavemanMode("wenyan")).toBe("wenyan-full");
    expect(normalizeCavemanMode("wenyan-lite")).toBe("wenyan-lite");
    expect(normalizeCavemanMode("wenyan-full")).toBe("wenyan-full");
    expect(normalizeCavemanMode("wenyan-ultra")).toBe("wenyan-ultra");
    expect(normalizeCavemanMode("verbose")).toBeNull();
  });

  test("builds a mode-switch prompt that preserves reasoning messages", () => {
    const prompt = buildCavemanCommandPrompt("ultra");

    expect(prompt).toContain("Switch to caveman ultra mode.");
    expect(prompt).toContain("Apply this mode for this conversation only");
    expect(prompt).toContain("Do not call memory tools");
    expect(prompt).toContain("every reasoning_message must be non-empty");
    expect(prompt).toContain("never analyst prose");
  });

  test("registers /caveman as a built-in slash command", async () => {
    expect(commands["/caveman"]).toMatchObject({
      desc: "Switch cave_code caveman mode",
    });

    await expect(executeCommand("/caveman ultra")).resolves.toMatchObject({
      success: true,
      output: "Switching cave_code to ultra mode...",
    });
    await expect(executeCommand("/caveman nonsense")).resolves.toMatchObject({
      success: true,
      output:
        "Usage: /caveman [lite|full|ultra|wenyan-lite|wenyan|wenyan-full|wenyan-ultra]",
    });
  });
});
