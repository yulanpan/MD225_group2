import { z } from "zod";

export const numericStateSchema = z.object({
  truth: z.number().min(0).max(10),
  pressure: z.number().min(0).max(10),
  virality: z.number().min(0).max(10),
  publicDoubt: z.number().min(0).max(10),
  reputation: z.number().min(0).max(10),
  systemSuspicion: z.number().min(0).max(10),
  actionsLeft: z.number().min(0).max(6).optional(),
  childAmplified: z.boolean().optional()
});

const gameStateLikeSchema = numericStateSchema.passthrough();

export const languageSchema = z.enum(["en", "zh"]).default("en");

export const aiReactionRequestSchema = z.object({
  actionId: z.string().min(1),
  language: languageSchema,
  state: gameStateLikeSchema,
  history: z.array(z.string()).default([])
});

export const rewriteRequestSchema = z.object({
  actionId: z.string().min(1),
  language: languageSchema,
  originalPost: z.string().min(1).max(1200),
  state: gameStateLikeSchema
});

export const commentsRequestSchema = z.object({
  language: languageSchema,
  state: gameStateLikeSchema,
  latestPost: z.string().min(1).max(1200)
});

export const finalReportRequestSchema = z.object({
  endingId: z.string().min(1),
  language: languageSchema,
  state: gameStateLikeSchema,
  history: z.array(z.string()).default([])
});

export const guidanceRequestSchema = z.object({
  language: languageSchema,
  mode: z.enum(["engine", "coach"]).default("engine"),
  state: gameStateLikeSchema,
  profile: z.object({
    biasAwareness: z.number().min(0).max(100).optional(),
    decodedEngine: z.boolean().optional(),
    secretEndingUnlocked: z.boolean().optional(),
    engineFragments: z.array(z.object({ id: z.string() })).optional(),
    runs: z.array(z.object({ endingId: z.string() }).passthrough()).optional()
  }).passthrough(),
  latestAction: z.string().optional(),
  history: z.array(z.string()).default([])
});

export const dialogueArchetypeSchema = z.enum([
  "ministerChallenge",
  "tailorThreat",
  "publicWitness",
  "archiveClerk",
  "childGuardian",
  "engineAudit"
]);
export const dialogueOutcomeTagSchema = z.enum([
  "reassureAuthority",
  "surfaceDoubt",
  "increaseSuspicion",
  "containNarrative",
  "amplifyWitness",
  "noEffect"
]);

export const dialoguePromptPatchSchema = z.object({
  angle: z.string().min(1).max(180),
  speakerAgenda: z.string().min(1).max(180),
  forbiddenFrame: z.string().min(1).max(180),
  pressureLine: z.string().min(1).max(180)
});

export const dialogueMoodSchema = z.object({
  trust: z.number().min(0).max(10),
  agitation: z.number().min(0).max(10),
  openness: z.number().min(0).max(10),
  leverage: z.number().min(0).max(10)
});

export const dialogueMoodDeltaSchema = z.object({
  trust: z.number().min(-2).max(2).optional(),
  agitation: z.number().min(-2).max(2).optional(),
  openness: z.number().min(-2).max(2).optional(),
  leverage: z.number().min(-2).max(2).optional()
});

export const dialogueChoiceIntentSchema = z.enum(["stabilize", "challenge", "clarify", "protect", "escalate", "concede"]);

export const dialogueChoiceSchema = z.object({
  id: z.string().min(1).max(40),
  label: z.string().min(1).max(90),
  playerLine: z.string().min(1).max(180),
  intent: dialogueChoiceIntentSchema,
  moodDelta: dialogueMoodDeltaSchema
});

export const dialogueEventSchema = z.object({
  id: z.string().min(1).max(80),
  archetype: dialogueArchetypeSchema,
  speakerName: z.string().min(1).max(80),
  speakerRole: z.string().min(1).max(120),
  openingLine: z.string().min(1).max(320),
  stakes: z.string().min(1).max(220),
  mood: dialogueMoodSchema,
  quickReplies: z.array(dialogueChoiceSchema).min(2).max(3),
  promptPatch: dialoguePromptPatchSchema,
  turnLimit: z.number().int().min(1).max(3)
});

export const dialogueMessageSchema = z.object({
  role: z.enum(["speaker", "player", "system"]),
  content: z.string().min(1).max(420),
  createdAt: z.string().min(1).max(80),
  choiceId: z.string().max(40).optional(),
  intent: dialogueChoiceIntentSchema.optional()
});

export const dialogueStartRequestSchema = z.object({
  language: languageSchema,
  state: gameStateLikeSchema.extend({
    dialogueEventIds: z.array(z.string()).optional()
  }).passthrough(),
  latestActionId: z.string().min(1).optional(),
  history: z.array(z.string()).default([]),
  completedDialogueEventIds: z.array(z.string()).default([])
});

export const dialogueTurnRequestSchema = z.object({
  language: languageSchema,
  event: dialogueEventSchema,
  state: gameStateLikeSchema,
  transcript: z.array(dialogueMessageSchema).max(7),
  playerMessage: z.string().min(1).max(280),
  selectedChoice: dialogueChoiceSchema.optional(),
  currentMood: dialogueMoodSchema.optional()
});

export const dialogueRepliesRequestSchema = z.object({
  language: languageSchema,
  event: dialogueEventSchema,
  state: gameStateLikeSchema,
  transcript: z.array(dialogueMessageSchema).min(1).max(8),
  lastSpeakerMessage: z.string().min(1).max(420),
  currentMood: dialogueMoodSchema.optional()
});

export const dialogueResolveRequestSchema = z.object({
  language: languageSchema,
  event: dialogueEventSchema,
  state: gameStateLikeSchema,
  transcript: z.array(dialogueMessageSchema).min(1).max(8),
  currentMood: dialogueMoodSchema.optional()
});

export const dialogueSilenceRequestSchema = z.object({
  language: languageSchema,
  event: dialogueEventSchema,
  state: gameStateLikeSchema,
  transcript: z.array(dialogueMessageSchema).min(1).max(8),
  currentMood: dialogueMoodSchema.optional()
});

export const aiReactionResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["engineMessage", "riskLevel", "suggestedRewrite", "recommendation"],
  properties: {
    engineMessage: { type: "string", maxLength: 260 },
    riskLevel: { type: "string", enum: ["low", "medium", "high"] },
    suggestedRewrite: { type: "string", maxLength: 220 },
    recommendation: { type: "string", enum: ["accept_rewrite", "publish_original", "delay"] }
  }
} as const;

export const rewriteResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["rewrittenPost", "strategy"],
  properties: {
    rewrittenPost: { type: "string", maxLength: 260 },
    strategy: { type: "string", maxLength: 140 }
  }
} as const;

export const commentsResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["comments", "publicComments"],
  properties: {
    comments: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: { type: "string", maxLength: 120 }
    },
    publicComments: {
      type: "array",
      minItems: 6,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["handle", "persona", "stance", "text", "intensity"],
        properties: {
          handle: { type: "string", maxLength: 32 },
          persona: { type: "string", maxLength: 48 },
          stance: { type: "string", enum: ["praise", "fear", "doubt", "satire", "procedural", "witness"] },
          text: { type: "string", maxLength: 120 },
          intensity: { type: "number", minimum: 1, maximum: 5 }
        }
      }
    }
  }
} as const;

export const finalReportResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["report"],
  properties: {
    report: { type: "string", maxLength: 320 }
  }
} as const;

export const guidanceResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["mode", "message", "objective", "risk"],
  properties: {
    mode: { type: "string", enum: ["engine", "coach"] },
    message: { type: "string", maxLength: 260 },
    objective: { type: "string", maxLength: 160 },
    risk: { type: "string", enum: ["low", "medium", "high"] }
  }
} as const;

const dialogueMoodProperties = {
  trust: { type: "number", minimum: 0, maximum: 10 },
  agitation: { type: "number", minimum: 0, maximum: 10 },
  openness: { type: "number", minimum: 0, maximum: 10 },
  leverage: { type: "number", minimum: 0, maximum: 10 }
} as const;

const dialogueMoodDeltaProperties = {
  trust: { type: "number", minimum: -2, maximum: 2 },
  agitation: { type: "number", minimum: -2, maximum: 2 },
  openness: { type: "number", minimum: -2, maximum: 2 },
  leverage: { type: "number", minimum: -2, maximum: 2 }
} as const;

const dialogueChoiceResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "label", "playerLine", "intent", "moodDelta"],
  properties: {
    id: { type: "string", maxLength: 40 },
    label: { type: "string", maxLength: 90 },
    playerLine: { type: "string", maxLength: 180 },
    intent: { type: "string", enum: ["stabilize", "challenge", "clarify", "protect", "escalate", "concede"] },
    moodDelta: {
      type: "object",
      additionalProperties: false,
      required: ["trust", "agitation", "openness", "leverage"],
      properties: dialogueMoodDeltaProperties
    }
  }
} as const;

export const dialogueEventResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "archetype", "speakerName", "speakerRole", "openingLine", "stakes", "mood", "quickReplies", "promptPatch", "turnLimit"],
  properties: {
    id: { type: "string", maxLength: 80 },
    archetype: { type: "string", enum: ["ministerChallenge", "tailorThreat", "publicWitness", "archiveClerk", "childGuardian", "engineAudit"] },
    speakerName: { type: "string", maxLength: 80 },
    speakerRole: { type: "string", maxLength: 120 },
    openingLine: { type: "string", maxLength: 320 },
    stakes: { type: "string", maxLength: 220 },
    mood: {
      type: "object",
      additionalProperties: false,
      required: ["trust", "agitation", "openness", "leverage"],
      properties: dialogueMoodProperties
    },
    quickReplies: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: dialogueChoiceResponseSchema
    },
    promptPatch: {
      type: "object",
      additionalProperties: false,
      required: ["angle", "speakerAgenda", "forbiddenFrame", "pressureLine"],
      properties: {
        angle: { type: "string", maxLength: 180 },
        speakerAgenda: { type: "string", maxLength: 180 },
        forbiddenFrame: { type: "string", maxLength: 180 },
        pressureLine: { type: "string", maxLength: 180 }
      }
    },
    turnLimit: { type: "number", minimum: 1, maximum: 3 }
  }
} as const;

export const dialogueResolutionResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["outcomeTag", "summary", "feedTitle", "feedText"],
  properties: {
    outcomeTag: { type: "string", enum: ["reassureAuthority", "surfaceDoubt", "increaseSuspicion", "containNarrative", "amplifyWitness", "noEffect"] },
    summary: { type: "string", maxLength: 260 },
    feedTitle: { type: "string", maxLength: 90 },
    feedText: { type: "string", maxLength: 220 }
  }
} as const;

export const dialogueRepliesResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["quickReplies"],
  properties: {
    quickReplies: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: dialogueChoiceResponseSchema
    }
  }
} as const;

export const dialogueSilenceResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["speakerMessage", "moodDelta"],
  properties: {
    speakerMessage: { type: "string", maxLength: 220 },
    moodDelta: {
      type: "object",
      additionalProperties: false,
      required: ["trust", "agitation", "openness", "leverage"],
      properties: dialogueMoodDeltaProperties
    }
  }
} as const;
