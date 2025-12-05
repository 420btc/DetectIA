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

  const prompt = `Generate ${count} multiple choice questions about this criminal case for a detective game.

CASE: ${caseData.title}
SUSPECTS: ${caseData.suspects.map((s: any) => s.name).join(", ")}
EVIDENCE: ${caseData.evidence.map((e: any) => e.name).join(", ")}

Each question should:
1. Test understanding of the case
2. Have 4 plausible options
3. Include one correct answer
4. Be challenging but fair

Return JSON array:
[
  {
    "question": "question text",
    "options": ["option 1", "option 2", "option 3", "option 4"],
    "correctAnswer": 0,
    "explanation": "why this is correct"
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

  const prompt = `Generate ${count} detective riddles related to this case.

CASE: ${caseData.title}
LOCATION: ${caseData.location}
SUSPECTS: ${caseData.suspects.map((s: any) => s.name).join(", ")}

Each riddle should:
1. Be related to the case or crime scene
2. Have a clever answer
3. Include 2-3 helpful hints
4. Be solvable but challenging

Return JSON array:
[
  {
    "riddle": "riddle text",
    "answer": "the answer",
    "hints": ["hint 1", "hint 2", "hint 3"],
    "explanation": "explanation of the answer"
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

  const prompt = `Generate ${count} deduction tests for a detective game based on this case.

CASE: ${caseData.title}
SUSPECTS: ${caseData.suspects.map((s: any) => s.name).join(", ")}
EVIDENCE: ${caseData.evidence.map((e: any) => e.name).join(", ")}
TIMELINE: ${caseData.timeline}

Each test should:
1. Present a scenario with clues
2. Ask for logical deduction
3. Have 4 possible conclusions
4. Require critical thinking

Return JSON array:
[
  {
    "scenario": "scenario description with clues",
    "question": "what can you deduce?",
    "options": ["option 1", "option 2", "option 3", "option 4"],
    "correctAnswer": 0,
    "reasoning": "logical reasoning for the correct answer"
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
