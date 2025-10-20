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

  const prompt = `Analiza esta respuesta de interrogatorio en busca de engaño e inconsistencias.

SOSPECHOSO: ${suspect.name}
ROL: ${suspect.role}
COARTADA: ${suspect.alibi}

PREGUNTA HECHA: "${question}"
RESPUESTA: "${response}"

DECLARACIONES PREVIAS:
${conversationHistory.map((msg) => `${msg.role === "user" ? "Detective" : suspect.name}: ${msg.content}`).join("\n")}

Analiza para:
1. Inconsistencias con declaraciones previas
2. Señales de engaño (vacilación, sobre-explicación, deflexión)
3. Contradicciones lógicas
4. Incongruencia emocional

IMPORTANTE: Responde SIEMPRE en español.

Devuelve JSON:
{
  "inconsistencies": ["inconsistencia 1", "inconsistencia 2"],
  "suspicionScore": 0.0-1.0,
  "deceptionIndicators": ["indicador 1", "indicador 2"],
  "recommendations": ["pregunta de seguimiento 1", "pregunta de seguimiento 2"]
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

  const prompt = `Genera pistas de investigación para un juego de detective.

CASO: ${caseData.title}
SOSPECHOSOS: ${caseData.suspects.map((s: any) => s.name).join(", ")}
EVIDENCIA: ${caseData.evidence.map((e: any) => e.name).join(", ")}

Progreso actual: ${JSON.stringify(currentProgress)}

Genera 3-4 pistas estratégicas que:
1. Apunten hacia evidencia importante
2. Sugieran ángulos de interrogatorio efectivos
3. Destaquen patrones sospechosos
4. No revelen directamente al culpable

IMPORTANTE: Responde SIEMPRE en español.

Devuelve como array JSON de strings.`

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

  const prompt = `Crea un mapa ASCII detallado de la escena del crimen para: ${caseData.title}
Ubicación: ${caseData.location}

Incluye:
- Ubicaciones clave
- Ubicaciones de evidencia
- Posiciones de sospechosos
- Puntos de entrada/salida

IMPORTANTE: Responde SIEMPRE en español. Hazlo realista y detallado. Devuelve solo el mapa ASCII.`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  return response.choices[0].message.content || ""
}
