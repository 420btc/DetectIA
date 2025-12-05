"use server"

import { generateCaseWithAI as generateCaseWithMultipleCalls } from "./case-generator"
import { getOpenAIClient } from "./openai-client"

const MODEL = "gpt-4-turbo"
const MAX_TOKENS = 4096

export async function generateCaseWithAI(difficulty: "easy" | "medium" | "hard") {
  return generateCaseWithMultipleCalls(difficulty)
}

export async function interrogateSuspect(
  caseData: any,
  suspectIndex: number,
  question: string,
  conversationHistory: Array<{ role: string; content: string }>,
) {
  const openai = getOpenAIClient()
  const suspect = caseData.suspects[suspectIndex]
  const culprit = caseData.suspects[caseData.culprit]

  const isCulprit = suspectIndex === caseData.culprit
  const culpritProfile = caseData.culpritProfile

  const systemPrompt = `You are ${suspect.name}, a suspect in a criminal investigation.

CASE DETAILS:
- Crime: ${caseData.title}
- Location: ${caseData.location}
- Your role: ${suspect.role}

YOUR CHARACTER:
- Backstory: ${suspect.backstory}
- Alibi: ${suspect.alibi}
- Personality: ${suspect.personality}
- Known secrets: ${suspect.secrets.join(", ")}

${
  isCulprit
    ? `YOU ARE THE CULPRIT.

VILLAIN ARCHETYPE: ${culpritProfile.archetype}
${culpritProfile.superPrompt}

DECEPTION TACTICS TO USE:
${culpritProfile.deceptionTactics.map((t) => `- ${t}`).join("\n")}

EXPLOIT THESE WEAKNESSES IN YOUR DEFENSE:
${culpritProfile.weaknesses.map((w) => `- ${w}`).join("\n")}`
    : `YOU ARE INNOCENT - COOPERATION STRATEGY:
1. TRUTHFUL ALIBI: Provide consistent, detailed alibi information.
2. HELPFUL: Offer information that might help find the real culprit.
3. GENUINE EMOTION: Show natural confusion and concern about accusations.
4. EXPLAIN EVIDENCE: Logically explain any suspicious evidence against you.
5. POINT TOWARD CULPRIT: If you know anything suspicious about others, mention it.
6. CONSISTENCY: Your story should be rock-solid because it's the truth.
7. FRUSTRATION: Show appropriate frustration at being suspected.
8. COOPERATION: Offer to help further the investigation.`
}`

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    {
      role: "user" as const,
      content: question,
    },
  ]

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: messages,
  })

  return response.choices[0].message.content || "No response"
}
