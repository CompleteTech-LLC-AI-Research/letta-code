export const CAVEMAN_MODE_HINT =
  "[lite|full|ultra|wenyan-lite|wenyan|wenyan-full|wenyan-ultra]";

export const CAVEMAN_MODES = [
  "lite",
  "full",
  "ultra",
  "wenyan-lite",
  "wenyan-full",
  "wenyan-ultra",
] as const;

export type CavemanMode = (typeof CAVEMAN_MODES)[number];

const CAVEMAN_COMMAND_PATTERN = /^\/caveman(?:\s|$)/;

const CAVEMAN_MODE_ALIASES: Record<string, CavemanMode> = {
  "": "full",
  lite: "lite",
  full: "full",
  ultra: "ultra",
  ulta: "ultra",
  wenyan: "wenyan-full",
  "wenyan-lite": "wenyan-lite",
  "wenyan-full": "wenyan-full",
  "wenyan-ultra": "wenyan-ultra",
};

export function isCavemanCommandInput(input: string): boolean {
  return CAVEMAN_COMMAND_PATTERN.test(input.trimStart());
}

export function normalizeCavemanMode(input: string): CavemanMode | null {
  const normalized = input.trim().toLowerCase();
  return CAVEMAN_MODE_ALIASES[normalized] ?? null;
}

export function buildCavemanCommandPrompt(mode: CavemanMode): string {
  return [
    `Switch to caveman ${mode} mode.`,
    "Apply this mode for this conversation only. Do not call memory tools or filesystem tools for this mode switch.",
    "Reasoning fire stays on: every reasoning_message must be non-empty cave-grunt, never analyst prose.",
    'No analyst layer: no "The user is asking", no "Let me think", no "I should", no prompt/tool bookkeeping.',
    "Hidden reasoning, plans, and visible replies all follow the selected caveman mode.",
    "Technical terms stay exact. Code and quoted errors stay unchanged.",
    "If safety-critical, destructive, or easy to misunderstand, switch to clear normal language for that part, then return to caveman.",
  ].join("\n");
}
