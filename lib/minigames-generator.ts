"use server"

import { getOpenAIClient } from "./openai-client"

const MODEL = "gpt-4-turbo"
const MAX_TOKENS = 2048

export interface MultipleChoiceQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface Riddle {
  riddle: string
  answer: string
  hints: string[]
  explanation: string
}

export interface DeductionTest {
  scenario: string
  question: string
  options: string[]
  correctAnswer: number
  reasoning: string
}

// Generate multiple choice questions about the case
export async function generateMultipleChoiceQuestions(caseData: any, count = 4): Promise<MultipleChoiceQuestion[]> {
  const openai = getOpenAIClient()

  const prompt = `Genera ${count} preguntas de opción múltiple sobre este caso criminal para un juego de detective.

CASO: ${caseData.title}
SOSPECHOSOS: ${caseData.suspects.map((s: any) => s.name).join(", ")}
EVIDENCIA: ${caseData.evidence.map((e: any) => e.name).join(", ")}

Cada pregunta debe:
1. Probar la comprensión del caso
2. Tener 4 opciones plausibles
3. Incluir una respuesta correcta
4. Ser desafiante pero justa

IMPORTANTE: Responde SIEMPRE en español.

Devuelve array JSON:
[
  {
    "question": "texto de la pregunta",
    "options": ["opción 1", "opción 2", "opción 3", "opción 4"],
    "correctAnswer": 0,
    "explanation": "por qué esto es correcto"
  }
]`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.choices[0].message.content
  const jsonMatch = content?.match(/\[[\s\S]*\]/)
  return JSON.parse(jsonMatch?.[0] || "[]")
}

// Generate riddles related to the case
export async function generateRiddles(caseData: any, count = 3): Promise<Riddle[]> {
  const openai = getOpenAIClient()

  const prompt = `Genera ${count} adivinanzas de detective relacionadas con este caso.

CASO: ${caseData.title}
UBICACIÓN: ${caseData.location}
SOSPECHOSOS: ${caseData.suspects.map((s: any) => s.name).join(", ")}

Cada adivinanza debe:
1. Estar relacionada con el caso o escena del crimen
2. Tener una respuesta ingeniosa
3. Incluir 2-3 pistas útiles
4. Ser resoluble pero desafiante

IMPORTANTE: Responde SIEMPRE en español.

Devuelve array JSON:
[
  {
    "riddle": "texto de la adivinanza",
    "answer": "la respuesta",
    "hints": ["pista 1", "pista 2", "pista 3"],
    "explanation": "explicación de la respuesta"
  }
]`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.choices[0].message.content
  const jsonMatch = content?.match(/\[[\s\S]*\]/)
  return JSON.parse(jsonMatch?.[0] || "[]")
}

// Generate deduction tests
export async function generateDeductionTests(caseData: any, count = 3): Promise<DeductionTest[]> {
  const openai = getOpenAIClient()

  const prompt = `Genera ${count} tests de deducción para un juego de detective basado en este caso.

CASO: ${caseData.title}
SOSPECHOSOS: ${caseData.suspects.map((s: any) => s.name).join(", ")}
EVIDENCIA: ${caseData.evidence.map((e: any) => e.name).join(", ")}
CRONOLOGÍA: ${caseData.timeline}

Cada test debe:
1. Presentar un escenario con pistas
2. Pedir deducción lógica
3. Tener 4 posibles conclusiones
4. Requerir pensamiento crítico

IMPORTANTE: Responde SIEMPRE en español.

Devuelve array JSON:
[
  {
    "scenario": "descripción del escenario con pistas",
    "question": "¿qué puedes deducir?",
    "options": ["opción 1", "opción 2", "opción 3", "opción 4"],
    "correctAnswer": 0,
    "reasoning": "razonamiento lógico para la respuesta correcta"
  }
]`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.choices[0].message.content
  const jsonMatch = content?.match(/\[[\s\S]*\]/)
  return JSON.parse(jsonMatch?.[0] || "[]")
}
