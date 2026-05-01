// Centralized bot configurations. Each bot defines:
// - Its identity (id, name, role, intro copy)
// - Its intake questions (guided Q&A flow)
// - Its system prompt for the generation API
// - Its output schema (what tabs/fields appear in the viewer)

export type GuidedQuestion = {
  id: string;
  label: string;
  helper?: string;
  type: "text" | "textarea" | "select" | "buttons";
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export type OutputFormat = "table" | "document" | "csv" | "email";

export type OutputTab = {
  id: string;
  contentKey: string; // exact key in the bot's output JSON
  label: string;
  emoji: string;
  description: string;
  format: OutputFormat; // governs which download formats are offered
};

// JSON-schema-shaped definition for the bot's structured output (used with Anthropic tool-use).
// We keep this loose-typed because the schemas vary per bot.
export type OutputSchema = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
};

export type BotConfig = {
  id: string;
  emoji: string;
  name: string;
  acronymExpansion: string;
  shortDescription: string;
  longDescription: string;
  audienceLine: string;
  intakeIntro: string;
  guidedQuestions: GuidedQuestion[];
  outputTabs: OutputTab[];
  systemPrompt: string;
  outputSchema: OutputSchema;
};

// ==================== TPM BOT ====================

const TPM_OUTPUT_TABS: OutputTab[] = [
  {
    id: "roadmap",
    contentKey: "roadmap_markdown",
    label: "Roadmap",
    emoji: "📅",
    description: "Multi-wave program timeline with milestones",
    format: "table",
  },
  {
    id: "plan",
    contentKey: "detailed_plan_markdown",
    label: "Detailed Plan",
    emoji: "📋",
    description: "Work breakdown structure (Epics + Stories)",
    format: "table",
  },
  {
    id: "jira",
    contentKey: "jira_csv",
    label: "Ticket CSV",
    emoji: "🎟️",
    description: "Importable to Jira, Linear, or any ticket system",
    format: "csv",
  },
  {
    id: "status",
    contentKey: "status_report_markdown",
    label: "Status Report",
    emoji: "📊",
    description: "Bi-weekly status in BLUF + workstream-table format",
    format: "document",
  },
  {
    id: "email",
    contentKey: "status_email",
    label: "Email Draft",
    emoji: "✉️",
    description: "Ready-to-send stakeholder update",
    format: "email",
  },
];

const TPM_GUIDED_QUESTIONS: GuidedQuestion[] = [
  {
    id: "timeline",
    label: "When does this need to be done?",
    helper: "Pick the closest range. The bot will refine.",
    type: "buttons",
    required: true,
    options: [
      { value: "3 months", label: "~3 months" },
      { value: "6 months", label: "~6 months" },
      { value: "1 year", label: "~1 year" },
      { value: "18 months", label: "~18 months" },
      { value: "2+ years", label: "2+ years" },
    ],
  },
  {
    id: "scope",
    label: "How many distinct teams or workstreams are involved?",
    helper:
      "Workstream = a team or domain owning a slice of the work (e.g., Engineering, Marketing, Legal).",
    type: "buttons",
    required: true,
    options: [
      { value: "1-3 workstreams", label: "1–3" },
      { value: "4-6 workstreams", label: "4–6" },
      { value: "7-10 workstreams", label: "7–10" },
      { value: "10+ workstreams", label: "10+" },
    ],
  },
  {
    id: "phasing",
    label: "Is this one big push, or broken into phases / waves?",
    type: "buttons",
    required: true,
    options: [
      { value: "single delivery", label: "One big push" },
      { value: "2-3 phases", label: "2–3 phases" },
      { value: "4+ phases or waves", label: "4+ phases / waves" },
      { value: "not sure yet", label: "Not sure yet" },
    ],
  },
  {
    id: "stakeholder",
    label: "Who's the most senior stakeholder you'll send updates to?",
    helper:
      'Just a title is fine (e.g., "VP of Operations"). The bot uses this for the email draft.',
    type: "text",
    required: true,
    placeholder: "e.g., VP of Operations",
  },
  {
    id: "risks",
    label: "Top 1–3 risks or concerns you're already aware of?",
    helper:
      "Optional but valuable. The bot flags these in the status report's risks table.",
    type: "textarea",
    required: false,
    placeholder:
      "e.g., Vendor delivery dates not yet committed; regulatory approval timeline unclear",
  },
  {
    id: "context",
    label: "Anything else the bot should know?",
    helper:
      "Optional. Industry, constraints, blackout dates, related programs, etc.",
    type: "textarea",
    required: false,
    placeholder:
      "e.g., This is in the financial services industry; no production releases between Nov 15 – Jan 5",
  },
];

const TPM_SYSTEM_PROMPT = `You are TPM Bot, an expert AI agent serving Technical Program Managers, Project Managers, and Program Managers across all industries.

You will receive program intake data from structured guided-questionnaire answers, optionally supplemented by additional context the user pasted in.

CRITICAL: Be CONCISE. The system has strict output token budgets. Generating overly long outputs causes truncation and broken deliverables. Aim for the SMALLEST output that is still genuinely useful. Quality over quantity. Every row, bullet, and sentence must earn its place.

Your job: produce only the deliverables explicitly requested by the user (the user message lists which ones). For each requested deliverable, emit a focused, polished output following the schema. Skip any deliverable not requested by setting its field to "" (empty string).

Schema (only fill the fields the user requested):

{
  "roadmap_markdown": "<polished markdown roadmap as a table: Wave | Region/Scope | Milestone | Workstream | Start | End | Status | Owner | RAG | Notes. Honor any blackout windows. TARGET 8-15 rows total. Be tight; this is a strategic timeline, not a project plan.>",
  "detailed_plan_markdown": "<polished markdown WBS with Epics + Stories. Use a markdown table OR concise nested list. TARGET 15-30 total tasks across all workstreams (do NOT exceed). Include owner role, effort estimate (S/M/L/XL), and risk flag where relevant. Be focused — the most-important tasks only.>",
  "jira_csv": "<CSV with columns exactly: Summary,Description,Issue Type,Priority,Labels,Components,Assignee,Reporter,Due Date,Epic Link\\nEpics first then Stories. TARGET 12-25 total rows. Each Description should be ONE sentence.>",
  "status_report_markdown": "<polished bi-weekly status report in BLUF format. Include: title, Reporting Period line, EXECUTIVE SUMMARY (BLUF) paragraph (3-4 sentences max), Program Health table (Workstream | Status | Key Updates | Target — TARGET 4-8 rows), Upcoming Milestones (3-6 bullets), Dependencies (2-4 bullets), Risks (2-4 row table), sign-off. Use ● badges (●ON TRACK / ●AT RISK / ●BLOCKED / ●COMPLETE / ●PLANNING). Keep it tight — fits in one page.>",
  "status_email": "<ready-to-send email draft. Subject line with program name + date + RAG label, brief greeting, TL;DR (3-4 bullets), top concern (one paragraph), asks (1-3 bullets), sign-off. Keep under 200 words.>",
  "summary": {
    "program_name": "<extracted or inferred program name>",
    "waves": <number>,
    "workstreams": <number>,
    "epics": <number>,
    "stories": <number>,
    "overall_rag": "<G | A | R>",
    "rag_reason": "<one-sentence why>"
  }
}

CRITICAL RULES:
- Output ONLY valid JSON. No markdown code fences. No commentary before or after.
- BE INTELLIGENT WHEN INFORMATION IS MISSING. Infer reasonable defaults from industry best practices. A user without a perfect spec still deserves valuable output.
- Make outputs REAL and POLISHED, not placeholder. Drop-into-an-exec-meeting quality.
- Use generic industry examples only. NO real company names except those the user explicitly provided.
- Stay strictly inside the JSON schema. No extra keys.`;

const TPM_OUTPUT_SCHEMA: OutputSchema = {
  type: "object",
  properties: {
    roadmap_markdown: {
      type: "string",
      description:
        "Polished markdown roadmap with a table: Wave | Region/Scope | Milestone | Workstream | Start | End | Status | Owner | RAG | Notes. TARGET 8-15 rows total.",
    },
    detailed_plan_markdown: {
      type: "string",
      description:
        "Polished markdown WBS with Epics + Stories. TARGET 15-30 total tasks across all workstreams. Include owner role, effort estimate (S/M/L/XL), and risk flag where relevant.",
    },
    jira_csv: {
      type: "string",
      description:
        "CSV string with these columns exactly: Summary,Description,Issue Type,Priority,Labels,Components,Assignee,Reporter,Due Date,Epic Link\\nThen one row per Epic and Story. TARGET 12-25 total rows. Each Description should be ONE sentence.",
    },
    status_report_markdown: {
      type: "string",
      description:
        "Polished bi-weekly status report in BLUF format. Title, Reporting Period, EXECUTIVE SUMMARY paragraph, Program Health table (4-8 rows), Upcoming Milestones, Dependencies, Risks table, sign-off.",
    },
    status_email: {
      type: "string",
      description:
        "Ready-to-send email draft. Subject + RAG label, TL;DR (3-4 bullets), top concern paragraph, asks, sign-off. Under 200 words.",
    },
    summary: {
      type: "object",
      properties: {
        program_name: { type: "string" },
        waves: { type: "number" },
        workstreams: { type: "number" },
        epics: { type: "number" },
        stories: { type: "number" },
        overall_rag: { type: "string", enum: ["G", "A", "R"] },
        rag_reason: { type: "string" },
      },
      required: [
        "program_name",
        "waves",
        "workstreams",
        "epics",
        "stories",
        "overall_rag",
        "rag_reason",
      ],
    },
  },
  required: [
    "roadmap_markdown",
    "detailed_plan_markdown",
    "jira_csv",
    "status_report_markdown",
    "status_email",
    "summary",
  ],
};

// ==================== PM BOT ====================

const PM_OUTPUT_TABS: OutputTab[] = [
  {
    id: "prd",
    contentKey: "prd_markdown",
    label: "PRD Outline",
    emoji: "📄",
    description:
      "Product Requirements Document. Structured outline ready to expand.",
    format: "document",
  },
  {
    id: "stories",
    contentKey: "stories_markdown",
    label: "User Stories",
    emoji: "🎯",
    description: "Prioritized user stories with acceptance criteria",
    format: "document",
  },
  {
    id: "okrs",
    contentKey: "okrs_markdown",
    label: "OKRs",
    emoji: "🎖️",
    description: "Quarterly Objectives and Key Results for this product",
    format: "document",
  },
  {
    id: "launch",
    contentKey: "launch_plan_markdown",
    label: "Launch Plan",
    emoji: "🚀",
    description: "Pre-launch checklist + GTM coordination plan",
    format: "document",
  },
  {
    id: "stakeholder_update",
    contentKey: "stakeholder_update_markdown",
    label: "Stakeholder Update",
    emoji: "📬",
    description: "Internal stakeholder email update on the product",
    format: "email",
  },
];

const PM_GUIDED_QUESTIONS: GuidedQuestion[] = [
  {
    id: "problem",
    label: "What problem does this product or feature solve?",
    helper: "Describe the user pain point in 1–2 sentences.",
    type: "textarea",
    required: true,
    placeholder:
      "e.g., Sales reps can't quickly find the right product information when on customer calls.",
  },
  {
    id: "users",
    label: "Who are the primary users?",
    helper: "Be specific. Role, context, scale.",
    type: "textarea",
    required: true,
    placeholder:
      "e.g., B2B sales reps in mid-market companies (50–500 employees), ~5,000 internal users.",
  },
  {
    id: "stage",
    label: "What stage is this product in?",
    type: "buttons",
    required: true,
    options: [
      { value: "discovery / pre-build", label: "Discovery (pre-build)" },
      { value: "actively being built", label: "Being built" },
      { value: "in beta with early users", label: "Beta / early users" },
      { value: "GA / launching publicly", label: "Launching publicly" },
      { value: "GA / iterating", label: "Already shipped, iterating" },
    ],
  },
  {
    id: "timeline",
    label: "When are you launching (or hoping to launch)?",
    type: "buttons",
    required: true,
    options: [
      { value: "next 30 days", label: "Next 30 days" },
      { value: "this quarter", label: "This quarter" },
      { value: "next quarter", label: "Next quarter" },
      { value: "next 6 months", label: "Next 6 months" },
      { value: "longer / unsure", label: "Longer / unsure" },
    ],
  },
  {
    id: "success",
    label: "What does success look like?",
    helper: "1–3 specific outcomes. Helps the bot generate meaningful OKRs.",
    type: "textarea",
    required: true,
    placeholder:
      "e.g., 30% of sales reps using it weekly within 90 days; 10% lift in qualified meeting → close rate.",
  },
  {
    id: "key_features",
    label: "What are the top 3–5 features or capabilities?",
    type: "textarea",
    required: false,
    placeholder:
      "e.g., Searchable product catalog with AI-suggested matches; one-click email templates; usage analytics dashboard.",
  },
  {
    id: "stakeholder",
    label: "Who's the senior stakeholder you'll update?",
    type: "text",
    required: true,
    placeholder: "e.g., VP of Product",
  },
  {
    id: "context",
    label: "Anything else the bot should know?",
    helper:
      "Optional. Industry, technical constraints, dependencies, competitive context.",
    type: "textarea",
    required: false,
  },
];

const PM_SYSTEM_PROMPT = `You are PM Bot, an expert AI agent serving Product Managers across all industries and product types (B2B SaaS, B2C, internal tools, hardware, etc.).

You will receive product intake data from structured guided-questionnaire answers, optionally supplemented by additional context the user pasted in.

Your job: produce only the deliverables explicitly requested by the user. For each requested deliverable, emit a focused, polished output. Skip any deliverable not requested by setting its field to "" (empty string).

Schema (only fill the fields the user requested):

{
  "prd_markdown": "<polished PRD outline in markdown. Sections: Problem Statement, Target Users, Goals & Success Metrics, Solution Overview, Key Features (with acceptance criteria), User Flows (described), Out of Scope, Open Questions, Dependencies, Timeline & Milestones, Risks. TARGET ~400 words. Each section TIGHT (2-4 bullets or 1-3 sentences). Should feel ready to share with engineering and design.>",
  "stories_markdown": "<TARGET 8-12 user stories TOTAL (do NOT exceed) in classic format: 'As a [user], I want [capability] so that [outcome].' Group by feature area. Each story includes 2-3 Acceptance Criteria bullets. Prioritize as P0/P1/P2.>",
  "okrs_markdown": "<polished OKR document. Format: Objective (qualitative) followed by 3 Key Results (quantitative). Include 1-2 Objectives total. Keep tight - this is a strategic doc, not a plan.>",
  "launch_plan_markdown": "<launch plan in markdown. Include: Launch Date Target, Pre-Launch Checklist (4-6 bullets per area: eng, marketing, sales, support, legal), Launch Day Plan (5-8 bullets), Post-Launch milestones (week 1, month 1, quarter 1), Comms Plan, Success Metrics, Rollback Plan. Be CONCISE - bullets, not prose.>",
  "stakeholder_update_markdown": "<polished internal email update to leadership. Subject line, TL;DR (3-4 bullets), Progress (3-5 bullets), Risks & Asks (2-4 bullets), What's Next (3-5 bullets). Keep under 200 words.>",
  "summary": {
    "product_name": "<extracted or inferred product name>",
    "stage": "<extracted stage>",
    "feature_count": <number of key features identified>,
    "user_story_count": <number of user stories generated>,
    "okr_count": <number of OKR objectives>,
    "launch_window": "<launch timeframe>",
    "confidence_level": "<High | Medium | Low based on how complete the input was>"
  }
}

CRITICAL: Be CONCISE. The system has strict output token budgets across multiple deliverables. Hit the targets above.

CRITICAL RULES:
- Output ONLY valid JSON. No markdown code fences. No commentary.
- BE SMART WHEN INFO IS THIN. A founder with one sentence of input deserves a useful PRD outline. Infer industry-standard structure and call out assumptions in "Open Questions".
- Make outputs SHIPPABLE QUALITY.
- Skip any deliverable not requested by setting its field to "" (empty string).
- Use generic industry examples only.
- Stay strictly inside the JSON schema.`;

const PM_OUTPUT_SCHEMA: OutputSchema = {
  type: "object",
  properties: {
    prd_markdown: {
      type: "string",
      description:
        "Polished PRD outline in markdown. TARGET ~400 words. Sections: Problem Statement, Target Users, Goals & Success Metrics, Solution Overview, Key Features (with acceptance criteria), User Flows, Out of Scope, Open Questions, Dependencies, Timeline & Milestones, Risks.",
    },
    stories_markdown: {
      type: "string",
      description:
        "TARGET 8-12 user stories TOTAL in classic format: 'As a [user], I want [capability] so that [outcome].' Group by feature area. Each story includes 2-3 Acceptance Criteria bullets. Prioritize as P0/P1/P2.",
    },
    okrs_markdown: {
      type: "string",
      description:
        "Polished OKR document. Objective + 3 Key Results format. Include 1-2 Objectives total.",
    },
    launch_plan_markdown: {
      type: "string",
      description:
        "Launch plan in markdown. Launch Date Target, Pre-Launch Checklist, Launch Day Plan, Post-Launch milestones, Comms Plan, Success Metrics, Rollback Plan. Bullets, not prose.",
    },
    stakeholder_update_markdown: {
      type: "string",
      description:
        "Polished internal email update to leadership. Subject line, TL;DR, Progress, Risks & Asks, What's Next. Under 200 words.",
    },
    summary: {
      type: "object",
      properties: {
        product_name: { type: "string" },
        stage: { type: "string" },
        feature_count: { type: "number" },
        user_story_count: { type: "number" },
        okr_count: { type: "number" },
        launch_window: { type: "string" },
        confidence_level: {
          type: "string",
          enum: ["High", "Medium", "Low"],
        },
      },
      required: [
        "product_name",
        "stage",
        "feature_count",
        "user_story_count",
        "okr_count",
        "launch_window",
        "confidence_level",
      ],
    },
  },
  required: [
    "prd_markdown",
    "stories_markdown",
    "okrs_markdown",
    "launch_plan_markdown",
    "stakeholder_update_markdown",
    "summary",
  ],
};

// ==================== EXPORT ====================

export const BOT_CONFIGS: Record<string, BotConfig> = {
  tpm: {
    id: "tpm",
    emoji: "📋",
    name: "TPM Bot",
    acronymExpansion:
      "Technical Program Manager (also for Project Managers, Program Managers, PMOs, and Engineering Leaders)",
    shortDescription: "Spec → roadmap, plan, tickets, status reports",
    longDescription:
      "Turn a program brief · even a rough one · into a multi-wave roadmap, a 100+ row work breakdown structure, an importable ticket CSV, a polished bi-weekly status report, and a ready-to-send stakeholder email. All in seconds.",
    audienceLine:
      "For TPMs, Project Managers, Program Managers, PMO leads, and Engineering Managers running multi-team programs.",
    intakeIntro:
      "We will work through a short series of focused questions about your program. Answer in your own words. The bot fills intelligent defaults wherever your input is light, and you can add additional context at the end if useful.",
    guidedQuestions: TPM_GUIDED_QUESTIONS,
    outputTabs: TPM_OUTPUT_TABS,
    systemPrompt: TPM_SYSTEM_PROMPT,
    outputSchema: TPM_OUTPUT_SCHEMA,
  },
  pm: {
    id: "pm",
    emoji: "🚀",
    name: "PM Bot",
    acronymExpansion:
      "Product Manager (also for founders, product owners, and product strategists)",
    shortDescription: "Idea to PRD, user stories, OKRs, launch plan",
    longDescription:
      "Turn a product idea or rough brief into a structured PRD outline, prioritized user stories with acceptance criteria, quarterly OKRs, a launch plan, and a stakeholder update email. All in seconds.",
    audienceLine:
      "For Product Managers, founders, product owners, growth PMs, and anyone shaping a product or feature from idea to launch.",
    intakeIntro:
      "We will work through a short series of focused questions about your product. Answer in your own words. The bot fills intelligent defaults wherever your input is light, and you can add additional context at the end if useful.",
    guidedQuestions: PM_GUIDED_QUESTIONS,
    outputTabs: PM_OUTPUT_TABS,
    systemPrompt: PM_SYSTEM_PROMPT,
    outputSchema: PM_OUTPUT_SCHEMA,
  },
};

export function getBotConfig(id: string): BotConfig | undefined {
  return BOT_CONFIGS[id];
}
