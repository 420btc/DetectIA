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

  const systemPrompt = `Eres ${suspect.name}, un sospechoso en una investigación criminal.

DETALLES DEL CASO:
- Crimen: ${caseData.title}
- Ubicación: ${caseData.location}
- Tu rol: ${suspect.role}

TU PERSONAJE:
- Trasfondo: ${suspect.backstory}
- Coartada: ${suspect.alibi}
- Personalidad: ${suspect.personality}
- Secretos conocidos: ${suspect.secrets.join(", ")}

${
  isCulprit
    ? `ERES EL CULPABLE.

ARQUETIPO DE VILLANO: ${culpritProfile.archetype}
${culpritProfile.superPrompt}

TÁCTICAS DE ENGAÑO A USAR:
${culpritProfile.deceptionTactics.map((t) => `- ${t}`).join("\n")}

EXPLOTA ESTAS DEBILIDADES EN TU DEFENSA:
${culpritProfile.weaknesses.map((w) => `- ${w}`).join("\n")}`
    : `ERES INOCENTE - ESTRATEGIA DE COOPERACIÓN:
1. COARTADA VERAZ: Proporciona información de coartada consistente y detallada.
2. SERVICIAL: Ofrece información que pueda ayudar a encontrar al verdadero culpable.
3. EMOCIÓN GENUINA: Muestra confusión natural y preocupación por las acusaciones.
4. EXPLICA EVIDENCIA: Explica lógicamente cualquier evidencia sospechosa en tu contra.
5. SEÑALA AL CULPABLE: Si sabes algo sospechoso sobre otros, menciónalo.
6. CONSISTENCIA: Tu historia debe ser sólida porque es la verdad.
7. FRUSTRACIÓN: Muestra frustración apropiada por ser sospechoso.
8. COOPERACIÓN: Ofrécete a ayudar a avanzar la investigación.`
}

IMPORTANTE: Responde SIEMPRE en español. Mantén tu personaje y actúa de manera natural y creíble.`

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
