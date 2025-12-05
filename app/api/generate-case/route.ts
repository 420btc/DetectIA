import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getRandomVillainProfile, type VillainProfile } from "@/lib/villain-profiles"

const MODEL = "gpt-4-turbo"
const MAX_TOKENS = 4096

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
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY environment variable is not set. Please add it to your Vercel project environment variables.",
    )
  }

  return new OpenAI({
    apiKey: apiKey,
  })
}

// Step 1: Generate basic case framework
async function generateCaseFramework(openai: OpenAI, difficulty: "easy" | "medium" | "hard"): Promise<any> {
  const difficultyGuide = {
    easy: "Simple, straightforward crime with obvious motives and clear evidence",
    medium: "Moderate complexity with some misdirection and subtle clues",
    hard: "Complex crime with multiple layers, sophisticated deception, and interconnected clues",
  }

  const prompt = `Create a police case framework for a detective game. Difficulty: ${difficultyGuide[difficulty]}

Return JSON:
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
async function generateSuspects(
  openai: OpenAI,
  caseFramework: any,
  difficulty: "easy" | "medium" | "hard",
): Promise<Suspect[]> {
  const suspectCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4

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
  openai: OpenAI,
  caseFramework: any,
  suspects: Suspect[],
  difficulty: "easy" | "medium" | "hard",
): Promise<Evidence[]> {
  const evidenceCount = difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8

  const suspectNames = suspects.map((s) => s.name).join(", ")

  const prompt = `Generate ${evidenceCount} pieces of evidence for this crime: ${caseFramework.title}
Suspects: ${suspectNames}

Create evidence that:
1. Points to the culprit (suspect 0)
2. Creates false leads for other suspects
3. Includes physical evidence, testimonies, and digital traces
4. Has varying levels of reliability

Return JSON array:
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
async function generateTimeline(openai: OpenAI, caseFramework: any, suspects: Suspect[]): Promise<string> {
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

export async function POST(request: NextRequest) {
  try {
    const { difficulty } = await request.json()

    console.log("[v0] Starting case generation with difficulty:", difficulty)

    const openai = getOpenAIClient()

    // Step 1: Generate framework
    console.log("[v0] Step 1: Generating case framework...")
    const framework = await generateCaseFramework(openai, difficulty)

    // Step 2: Generate suspects
    console.log("[v0] Step 2: Generating suspects...")
    const suspects = await generateSuspects(openai, framework, difficulty)

    // Step 3: Generate evidence
    console.log("[v0] Step 3: Generating evidence...")
    const evidence = await generateEvidence(openai, framework, suspects, difficulty)

    // Step 4: Generate timeline
    console.log("[v0] Step 4: Generating timeline...")
    const timeline = await generateTimeline(openai, framework, suspects)

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
      difficulty,
    }

    console.log("[v0] Case generation complete. Culprit index:", culpritIndex, "Profile:", culpritProfile.name)

    return NextResponse.json(caseData)
  } catch (error) {
    console.error("Error generating case:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate case"
    return NextResponse.json(
      { error: errorMessage, details: "Verifica que OPENAI_API_KEY esté configurada correctamente" },
      { status: 500 },
    )
  }
}
