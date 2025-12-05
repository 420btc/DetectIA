"use server"

import { getOpenAIClient } from "./openai-client"

const MODEL = "gpt-4-turbo"
const MAX_TOKENS = 2048

interface AnalysisResult {
  inconsistencies: string[]
  suspicionScore: number
  deceptionIndicators: string[]
  recommendations: string[]
}

export async function analyzeInterrogation(
  suspect: any,
  question: string,
  response: string,
  conversationHistory: Array<{ role: string; content: string }>,
  caseData: any,
): Promise<AnalysisResult> {
  const openai = getOpenAIClient()

  const prompt = `Analyze this interrogation response for deception and inconsistencies.

SUSPECT: ${suspect.name}
ROLE: ${suspect.role}
ALIBI: ${suspect.alibi}

QUESTION ASKED: "${question}"
RESPONSE: "${response}"

PREVIOUS STATEMENTS:
${conversationHistory.map((msg) => `${msg.role === "user" ? "Detective" : suspect.name}: ${msg.content}`).join("\n")}

Analyze for:
1. Inconsistencies with previous statements
2. Signs of deception (hesitation, over-explanation, deflection)
3. Logical contradictions
4. Emotional incongruence

Return JSON:
{
  "inconsistencies": ["inconsistency 1", "inconsistency 2"],
  "suspicionScore": 0.0-1.0,
  "deceptionIndicators": ["indicator 1", "indicator 2"],
  "recommendations": ["follow-up question 1", "follow-up question 2"]
}`

  const response_obj = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response_obj.choices[0].message.content
  const jsonMatch = content?.match(/\{[\s\S]*\}/)
  const analysis = JSON.parse(jsonMatch?.[0] || "{}")

  return {
    inconsistencies: analysis.inconsistencies || [],
    suspicionScore: analysis.suspicionScore || 0.5,
    deceptionIndicators: analysis.deceptionIndicators || [],
    recommendations: analysis.recommendations || [],
  }
}

export async function generateInvestigationHints(caseData: any, currentProgress: any): Promise<string[]> {
  const openai = getOpenAIClient()

  const prompt = `Generate investigation hints for a detective game.

CASE: ${caseData.title}
SUSPECTS: ${caseData.suspects.map((s: any) => s.name).join(", ")}
EVIDENCE: ${caseData.evidence.map((e: any) => e.name).join(", ")}

Current progress: ${JSON.stringify(currentProgress)}

Generate 3-4 strategic hints that:
1. Point toward important evidence
2. Suggest effective interrogation angles
3. Highlight suspicious patterns
4. Don't directly reveal the culprit

Return as JSON array of strings.`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.choices[0].message.content
  const jsonMatch = content?.match(/\[[\s\S]*\]/)
  return JSON.parse(jsonMatch?.[0] || "[]")
}

export async function generateCaseMap(caseData: any): Promise<string> {
  const openai = getOpenAIClient()

  const prompt = `Create a detailed ASCII map of the crime scene for: ${caseData.title}
Location: ${caseData.location}

Include:
- Key locations
- Evidence locations
- Suspect positions
- Entry/exit points

Make it realistic and detailed. Return only the ASCII map.`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  return response.choices[0].message.content || ""
}
