"use server"

import { getOpenAIClient } from "./openai-client"
import { getRandomVillainProfile, type VillainProfile } from "./villain-profiles"

const MODEL = "gpt-4-turbo"

interface Suspect {
  name: string
  role: string
  backstory: string
  motive: string
  alibi: string
  personality: string
  secrets: string[]
}

interface Evidence {
  name: string
  description: string
  linkedTo: number[]
  falseLeads: string[]
}

interface CaseData {
  caseId: string
  title: string
  description: string
  suspects: Suspect[]
  culprit: number
  culpritProfile: VillainProfile
  evidence: Evidence[]
  timeline: string
  location: string
  difficulty: "easy" | "medium" | "hard"
  chapterId?: string
}

interface GenerationParams {
  difficulty: "easy" | "medium" | "hard"
  theme?: string
  mastermindClue?: string
  chapterId?: string
}

// Step 1: Generate basic case framework
async function generateCaseFramework(params: GenerationParams): Promise<any> {
  const openai = getOpenAIClient()

  const difficultyGuide = {
    easy: "Simple, straightforward crime with obvious motives and clear evidence",
    medium: "Moderate complexity with some misdirection and subtle clues",
    hard: "Complex crime with multiple layers, sophisticated deception, and interconnected clues",
  }

  let prompt = `Create a police case framework for a detective game. Difficulty: ${difficultyGuide[params.difficulty]}`

  if (params.theme) {
    const themePrompts: Record<string, string> = {
      corporate: "Theme: Corporate espionage, white-collar crime, high-stakes business.",
      passion: "Theme: Crime of passion, romantic entanglement, jealousy.",
      organized: "Theme: Organized crime, mafia connections, underground gambling.",
      revenge: "Theme: Long-held grudge, calculated revenge plot.",
      conspiracy: "Theme: Political conspiracy, cover-ups, secret societies."
    }
    prompt += `\n${themePrompts[params.theme] || `Theme: ${params.theme}`}`
  }

  prompt += `\n\nReturn JSON:
{
  "crimeType": "type of crime",
  "title": "catchy case title",
  "location": "where it happened",
  "timeline": "when it happened",
  "basicDescription": "2-3 sentence overview"
}`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.choices[0].message.content
  const jsonMatch = content?.match(/\{[\s\S]*\}/)
  return JSON.parse(jsonMatch?.[0] || "{}")
}

// Step 2: Generate suspects with one culprit
async function generateSuspects(caseFramework: any, params: GenerationParams): Promise<Suspect[]> {
  const openai = getOpenAIClient()

  const suspectCount = params.difficulty === "easy" ? 2 : params.difficulty === "medium" ? 3 : 4

  const prompt = `Generate ${suspectCount} suspects for this crime: ${caseFramework.title}
Location: ${caseFramework.location}
Crime type: ${caseFramework.crimeType}

One of them is the culprit. Create diverse characters with different motives.

Return JSON array:
[
  {
    "name": "full name",
    "role": "occupation/relationship to victim",
    "backstory": "personal background (2-3 sentences)",
    "motive": "why they might commit this crime",
    "alibi": "their claimed alibi",
    "personality": "how they act under interrogation (nervous, confident, defensive, etc)",
    "secrets": ["secret 1", "secret 2"]
  }
]

Make the suspects realistic and complex. Include at least one red herring.`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.choices[0].message.content
  const jsonMatch = content?.match(/\[[\s\S]*\]/)
  return JSON.parse(jsonMatch?.[0] || "[]")
}

// Step 3: Generate evidence and clues
async function generateEvidence(
  caseFramework: any,
  suspects: Suspect[],
  params: GenerationParams,
): Promise<Evidence[]> {
  const openai = getOpenAIClient()

  const evidenceCount = params.difficulty === "easy" ? 4 : params.difficulty === "medium" ? 6 : 8

  const suspectNames = suspects.map((s) => s.name).join(", ")

  let prompt = `Generate ${evidenceCount} pieces of evidence for this crime: ${caseFramework.title}
Suspects: ${suspectNames}

Create evidence that:
1. Points to the culprit (suspect 0)
2. Creates false leads for other suspects
3. Includes physical evidence, testimonies, and digital traces
4. Has varying levels of reliability`

  if (params.mastermindClue) {
    prompt += `\n\nIMPORTANT: Include one specific piece of evidence that subtly hints at a larger conspiracy or "The Architect", related to this clue: "${params.mastermindClue}". This should be subtle.`
  }

  prompt += `\n\nReturn JSON array:
[
  {
    "name": "evidence name",
    "description": "what it is and where found",
    "linkedTo": [suspect indices it implicates],
    "falseLeads": ["misleading interpretation 1", "misleading interpretation 2"]
  }
]

Make evidence realistic and interconnected.`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.choices[0].message.content
  const jsonMatch = content?.match(/\[[\s\S]*\]/)
  return JSON.parse(jsonMatch?.[0] || "[]")
}

// Step 4: Generate detailed timeline
async function generateTimeline(caseFramework: any, suspects: Suspect[]): Promise<string> {
  const openai = getOpenAIClient()

  const prompt = `Create a detailed timeline for this crime: ${caseFramework.title}
Location: ${caseFramework.location}
Suspects: ${suspects.map((s) => s.name).join(", ")}

Generate a realistic timeline with:
- When the crime occurred
- Key events before and after
- When suspects were seen
- When evidence was discovered

Format as a readable timeline (not JSON).`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  return response.choices[0].message.content || ""
}

// Main function: Orchestrate case generation with multiple calls
export async function generateCaseWithAI(
  difficultyOrParams: "easy" | "medium" | "hard" | GenerationParams
): Promise<CaseData> {

  const params: GenerationParams = typeof difficultyOrParams === 'string'
    ? { difficulty: difficultyOrParams }
    : difficultyOrParams

  console.log("[v0] Starting case generation with params:", params)

  // Step 1: Generate framework
  console.log("[v0] Step 1: Generating case framework...")
  const framework = await generateCaseFramework(params)

  // Step 2: Generate suspects
  console.log("[v0] Step 2: Generating suspects...")
  const suspects = await generateSuspects(framework, params)

  // Step 3: Generate evidence
  console.log("[v0] Step 3: Generating evidence...")
  const evidence = await generateEvidence(framework, suspects, params)

  // Step 4: Generate timeline
  console.log("[v0] Step 4: Generating timeline...")
  const timeline = await generateTimeline(framework, suspects)

  const culpritIndex = Math.floor(Math.random() * suspects.length)
  const culpritProfile = getRandomVillainProfile()

  const caseData: CaseData = {
    caseId: `CASE-${Date.now()}`,
    title: framework.title,
    description: framework.basicDescription,
    suspects,
    culprit: culpritIndex,
    culpritProfile,
    evidence,
    timeline,
    location: framework.location,
    difficulty: params.difficulty,
    chapterId: params.chapterId
  }

  console.log("[v0] Case generation complete. Culprit index:", culpritIndex, "Profile:", culpritProfile.name)
  return caseData
}
