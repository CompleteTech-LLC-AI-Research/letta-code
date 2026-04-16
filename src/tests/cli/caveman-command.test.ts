import { describe, expect, test } from "bun:test";
import {
  buildCavemanCommandPrompt,
  isCavemanCommandInput,
  normalizeCavemanMode,
} from "../../cli/commands/caveman";
import { commands, executeCommand } from "../../cli/commands/registry";

describe("/caveman command", () => {
  test("matches slash-first caveman commands with trailing whitespace separators", () => {
    expect(isCavemanCommandInput("/caveman")).toBe(true);
    expect(isCavemanCommandInput("/caveman ultra")).toBe(true);
    expect(isCavemanCommandInput("/caveman\tultra")).toBe(true);
    expect(isCavemanCommandInput("\t/caveman\nultra")).toBe(false);
    expect(isCavemanCommandInput("/cavemanultra")).toBe(false);
    expect(isCavemanCommandInput("/caveman-mode ultra")).toBe(false);
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

  test("builds a mode-switch prompt that preserves reasoning messages", () => {
    const prompt = buildCavemanCommandPrompt("ultra");

    expect(prompt).toContain("Switch to cave-code ultra mode.");
    expect(prompt).toContain("abbreviate common technical nouns");
    expect(prompt).toContain("Inline obj prop -> new ref -> re-render");
    expect(prompt).toContain("Apply this mode for this conversation only");
    expect(prompt).toContain("Do not call memory tools");
    expect(prompt).toContain("every reasoning_message must be non-empty");
    expect(prompt).toContain("never analyst prose");
  });

  test("includes concrete per-mode rules in each mode-switch prompt", () => {
    expect(buildCavemanCommandPrompt("lite")).toContain(
      "keep articles and complete professional sentences",
    );
    expect(buildCavemanCommandPrompt("full")).toContain(
      "classic cave-code compression",
    );
    expect(buildCavemanCommandPrompt("wenyan-lite")).toContain(
      "semi-classical Chinese register",
    );
    expect(buildCavemanCommandPrompt("wenyan-full")).toContain("文言文");
    expect(buildCavemanCommandPrompt("wenyan-ultra")).toContain(
      "maximum compression",
    );
  });

  test("registers /caveman as a built-in slash command", async () => {
    expect(commands["/caveman"]).toMatchObject({
      desc: "Switch cave-code mode",
    });

    await expect(executeCommand("/caveman ultra")).resolves.toMatchObject({
      success: true,
      output:
        "Interactive-only command: /caveman ultra is handled by the CLI message loop.",
    });
    await expect(executeCommand("/caveman nonsense")).resolves.toMatchObject({
      success: true,
      output:
        "Usage: /caveman [lite|full|ultra|wenyan-lite|wenyan-full|wenyan-ultra]",
    });
  });
});
