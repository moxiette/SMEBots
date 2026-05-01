// Browser-side wrapper around the Anthropic SDK.
//
// In moxiette.com this lived in app/api/generate/route.ts (server-side) so
// the Anthropic key could be a secret env var. On GitHub Pages there's no
// server, so the call happens directly from the browser using the user's
// own key (see lib/key-store.ts). The Anthropic SDK supports this via
// dangerouslyAllowBrowser:true.
//
// Returns the parsed deliverables JSON plus _meta diagnostics so the
// existing UnifiedOutputViewer keeps working unchanged.

import Anthropic from "@anthropic-ai/sdk";
import type { BotConfig } from "./bot-configs";

export type DetailLevel = "high_level" | "balanced" | "super_detailed";
export type StyleChoice = "minimalist" | "professional" | "creative";

export interface GenerateInput {
  config: BotConfig;
  apiKey: string;
  programName: string;
  goal: string;
  guidedAnswers: Record<string, string>;
  optionalContext?: string;
  detailLevel: DetailLevel;
  styleChoice: StyleChoice;
  selectedOutputs: string[]; // tab IDs
}

export interface GenerateResult {
  // The bot's structured deliverables, keyed by contentKey.
  [k: string]: unknown;
  summary?: Record<string, unknown>;
  _meta: {
    model: string;
    input_tokens?: number;
    output_tokens?: number;
    stop_reason?: string | null;
    truncated: boolean;
    missing_outputs: string[];
    selected_outputs: string[];
  };
}

const MODEL_HAIKU = "claude-haiku-4-5";
const MODEL_SONNET = "claude-sonnet-4-5";

const DETAIL_INSTRUCTIONS: Record<DetailLevel, string> = {
  high_level:
    "Keep deliverables HIGH-LEVEL and concise. Aim for executive-summary brevity. Strip nonessential rows from tables. Skip optional sections. Every sentence must earn its place.",
  balanced:
    "Standard depth. Detailed enough to be actionable, light enough to read in one sitting. Default professional length.",
  super_detailed:
    "Maximize comprehensiveness. Include every reasonable subsection, table row, edge case, and dependency. Aim for ~50 percent more length than the default. No shortcuts.",
};

const STYLE_INSTRUCTIONS: Record<StyleChoice, string> = {
  minimalist:
    "Use minimalist visual style. Lots of whitespace. Short sentences. Sparse tables. Avoid decorative emoji. Modern and clean.",
  professional:
    "Use standard professional business style. Tables, clear section headings, consistent terminology. Suitable for executive distribution.",
  creative:
    "Use a creative, energetic style with personality. Engaging prose. Storytelling cadence (problem, twist, resolution) where appropriate.",
};

function buildUserMessage(input: GenerateInput, selectedTabLabels: string[]): string {
  const sections: string[] = [];

  if (input.programName) {
    sections.push(`Project / Program / Product Name: ${input.programName}`);
  }
  if (input.goal) {
    sections.push(`Goal (1-2 sentences from user):\n${input.goal}`);
  }

  const answers = Object.entries(input.guidedAnswers).filter(
    ([, v]) => v && v.trim()
  );
  if (answers.length > 0) {
    sections.push(`--- GUIDED INTAKE ANSWERS ---`);
    for (const [k, v] of answers) sections.push(`${k}: ${v}`);
    sections.push(`--- END GUIDED ANSWERS ---`);
  }

  if (input.optionalContext && input.optionalContext.trim()) {
    sections.push(
      `--- ADDITIONAL CONTEXT FROM USER ---\n${input.optionalContext}\n--- END ADDITIONAL CONTEXT ---`
    );
  }

  sections.push(
    `--- OUTPUT PREFERENCES ---\nDetail Level: ${input.detailLevel}\n${DETAIL_INSTRUCTIONS[input.detailLevel]}\n\nStyle: ${input.styleChoice}\n${STYLE_INSTRUCTIONS[input.styleChoice]}\n--- END PREFERENCES ---`
  );

  sections.push(
    `--- REQUESTED DELIVERABLES ---\nThe user has selected only the following deliverables. Generate ONLY these. Do not generate any others.\n${selectedTabLabels.map((l) => `- ${l}`).join("\n")}\n--- END REQUESTED DELIVERABLES ---`
  );

  sections.push(
    `\nGenerate the requested deliverables now using the submit_deliverables tool. Honor the OUTPUT PREFERENCES throughout. Be concise where possible to fit within token limits. If a deliverable is not requested, set its field to an empty string.`
  );

  return sections.join("\n\n");
}

// Per-output token budgets sized for realistic content depth.
function scaleTokensForSelection(
  selectedCount: number,
  detailLevel: DetailLevel
): number {
  const perOutput =
    detailLevel === "super_detailed"
      ? 2200
      : detailLevel === "high_level"
      ? 1200
      : 1700;
  const overhead = 500;
  // Ceilings tuned for realistic browser-side latency.
  const ceiling = detailLevel === "super_detailed" ? 9000 : 7000;
  return Math.min(ceiling, perOutput * Math.max(1, selectedCount) + overhead);
}

function pickModel(detailLevel: DetailLevel): string {
  // Sonnet for max-depth requests; Haiku for everything else (faster, cheaper).
  return detailLevel === "super_detailed" ? MODEL_SONNET : MODEL_HAIKU;
}

export async function generateDeliverables(
  input: GenerateInput
): Promise<GenerateResult> {
  const selectedTabs = input.config.outputTabs.filter((t) =>
    input.selectedOutputs.includes(t.id)
  );
  if (selectedTabs.length === 0) {
    throw new Error("Please select at least one deliverable to generate.");
  }
  const selectedContentKeys = selectedTabs.map((t) => t.contentKey);
  const selectedTabLabels = selectedTabs.map((t) => t.label);

  const userMessage = buildUserMessage(input, selectedTabLabels);
  const model = pickModel(input.detailLevel);
  const maxTokens = scaleTokensForSelection(selectedTabs.length, input.detailLevel);

  const client = new Anthropic({
    apiKey: input.apiKey,
    dangerouslyAllowBrowser: true,
  });

  // Restrict the schema's required fields to what the user actually picked.
  // Other fields are still in `properties` so the model can recognize them.
  const filteredSchema = {
    type: "object" as const,
    properties: input.config.outputSchema.properties,
    required: [...selectedContentKeys, "summary"],
  };

  const tool = {
    name: "submit_deliverables",
    description: `Submit the requested deliverables for the user's ${input.config.name} request. Only include the deliverables explicitly requested.`,
    input_schema: filteredSchema as unknown as Anthropic.Messages.Tool.InputSchema,
  };

  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: input.config.systemPrompt,
    tools: [tool as unknown as Anthropic.Messages.Tool],
    tool_choice: { type: "tool", name: "submit_deliverables" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUseBlock = message.content.find(
    (b) => b.type === "tool_use" && b.name === "submit_deliverables"
  );
  if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
    throw new Error(
      "AI did not return structured output. Try selecting fewer deliverables, or use High-level detail."
    );
  }

  const result = toolUseBlock.input as Record<string, unknown>;

  // Detect missing/empty selected outputs so the UI can show a truncation banner.
  const missingOutputs: string[] = [];
  for (const tab of selectedTabs) {
    const v = result[tab.contentKey];
    if (typeof v !== "string" || v.trim().length < 30) {
      missingOutputs.push(tab.id);
    }
  }
  const truncated =
    message.stop_reason === "max_tokens" || missingOutputs.length > 0;

  return {
    ...result,
    _meta: {
      model,
      input_tokens: message.usage?.input_tokens,
      output_tokens: message.usage?.output_tokens,
      stop_reason: message.stop_reason,
      truncated,
      missing_outputs: missingOutputs,
      selected_outputs: input.selectedOutputs,
    },
  };
}

// Map common Anthropic error shapes to friendly messages.
export function classifyAnthropicError(err: unknown): string {
  const e = err as { status?: number; message?: string; error?: { message?: string } };
  const status = e?.status;
  const baseMessage = e?.error?.message || e?.message || "Unknown error.";

  if (status === 401) {
    return "Your Anthropic API key was rejected. Open the API Key settings in the top-right and paste a fresh key from console.anthropic.com.";
  }
  if (status === 429) {
    return "Anthropic is rate-limiting your key. Wait a minute and try again, or check your account's usage limits.";
  }
  if (status === 400 && /context_length|too long|max_tokens/i.test(baseMessage)) {
    return "Your input was too long. Try shortening your goal, optional context, or removing uploaded files, then regenerate.";
  }
  if (status === 529 || status === 503) {
    return "Anthropic is temporarily overloaded. Please try again in a moment.";
  }
  return `Anthropic API error: ${baseMessage}`;
}
