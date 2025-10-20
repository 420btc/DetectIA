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
    easy: "Crimen simple y directo con motivos obvios y evidencia clara",
    medium: "Complejidad moderada con algo de desorientación y pistas sutiles",
    hard: "Crimen complejo con múltiples capas, engaño sofisticado y pistas interconectadas",
  }

  const prompt = `Crea un marco de caso policial para un juego de detective. Dificultad: ${difficultyGuide[difficulty]}

Devuelve JSON:
{
  "crimeType": "tipo de crimen",
  "title": "título atractivo del caso",
  "location": "dónde ocurrió",
  "timeline": "cuándo ocurrió",
  "basicDescription": "descripción general de 2-3 oraciones"
}

IMPORTANTE: Responde SOLO en español. Todos los nombres, lugares y descripciones deben estar en español.`

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

  const prompt = `Genera ${suspectCount} sospechosos para este crimen: ${caseFramework.title}
Ubicación: ${caseFramework.location}
Tipo de crimen: ${caseFramework.crimeType}

Uno de ellos es el culpable. Crea personajes diversos con diferentes motivos.

Devuelve un array JSON:
[
  {
    "name": "nombre completo",
    "role": "ocupación/relación con la víctima",
    "backstory": "trasfondo personal (2-3 oraciones)",
    "motive": "por qué podrían cometer este crimen",
    "alibi": "su coartada declarada",
    "personality": "cómo actúan bajo interrogatorio (nervioso, confiado, defensivo, etc)",
    "secrets": ["secreto 1", "secreto 2"]
  }
]

Haz que los sospechosos sean realistas y complejos. Incluye al menos una pista falsa.
IMPORTANTE: Responde SOLO en español. Todos los nombres deben ser nombres españoles o latinoamericanos.`

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

  const prompt = `Genera ${evidenceCount} piezas de evidencia para este crimen: ${caseFramework.title}
Sospechosos: ${suspectNames}

Crea evidencia que:
1. Apunte al culpable (sospechoso 0)
2. Cree pistas falsas para otros sospechosos
3. Incluya evidencia física, testimonios y rastros digitales
4. Tenga diferentes niveles de confiabilidad

Devuelve un array JSON:
[
  {
    "name": "nombre de la evidencia",
    "description": "qué es y dónde se encontró",
    "linkedTo": [índices de sospechosos que implica],
    "falseLeads": ["interpretación engañosa 1", "interpretación engañosa 2"]
  }
]

Haz que la evidencia sea realista e interconectada.
IMPORTANTE: Responde SOLO en español. Todas las descripciones deben estar en español.`

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
  const prompt = `Crea una cronología detallada para este crimen: ${caseFramework.title}
Ubicación: ${caseFramework.location}
Sospechosos: ${suspects.map((s) => s.name).join(", ")}

Genera una cronología realista con:
- Cuándo ocurrió el crimen
- Eventos clave antes y después
- Cuándo fueron vistos los sospechosos
- Cuándo se descubrió la evidencia

Formatea como una cronología legible (no JSON).
IMPORTANTE: Responde SOLO en español. Toda la cronología debe estar en español.`

  const response = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  return response.choices[0].message.content || ""
}

export async function POST(request: NextRequest) {
  const { difficulty, stream } = await request.json()

  if (stream) {
    // Return streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const sendMessage = (message: string) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message })}\n\n`))
          }

          sendMessage("Iniciando generación del caso...")
          
          const openai = getOpenAIClient()

          // Step 1: Generate framework
          sendMessage("Paso 1: Generando estructura del caso...")
          const framework = await generateCaseFramework(openai, difficulty)

          // Step 2: Generate suspects
          sendMessage("Paso 2: Creando sospechosos...")
          const suspects = await generateSuspects(openai, framework, difficulty)

          // Step 3: Generate evidence
          sendMessage("Paso 3: Generando evidencias...")
          const evidence = await generateEvidence(openai, framework, suspects, difficulty)

          // Step 4: Generate timeline
          sendMessage("Paso 4: Creando cronología...")
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

          sendMessage("¡Caso generado exitosamente!")
          
          // Send final data
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ caseData, complete: true })}\n\n`))
          controller.close()
        } catch (error) {
          console.error("Error generating case:", error)
          const errorMessage = error instanceof Error ? error.message : "Error al generar el caso"
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }

  // Fallback to regular JSON response
  try {
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
