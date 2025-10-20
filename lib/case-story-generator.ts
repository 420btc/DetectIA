import { getOpenAIClient } from "./openai-client"

const MODEL = "gpt-4-turbo"
const MAX_TOKENS = 2048

interface CaseStoryData {
  title: string
  location: string
  timeline: string
  description: string
  suspects: Array<{
    name: string
    role: string
  }>
}

export async function generateCaseStory(caseData: CaseStoryData): Promise<string> {
  const openai = getOpenAIClient()

  const prompt = `Eres un detective experimentado escribiendo un reporte inicial de caso para otro detective que acaba de ser asignado a la investigación.

DATOS DEL CASO:
- Título: ${caseData.title}
- Ubicación: ${caseData.location}
- Fecha/Hora: ${caseData.timeline}
- Descripción: ${caseData.description}
- Sospechosos identificados: ${caseData.suspects.map(s => `${s.name} (${s.role})`).join(', ')}

Escribe un reporte policial narrativo y envolvente que:
1. Establezca la escena del crimen de manera dramática
2. Describa los primeros hallazgos y la situación inicial
3. Mencione brevemente a los sospechosos sin revelar detalles comprometedores
4. Termine con una frase que motive al detective (jugador) a comenzar la investigación
5. Use un tono profesional pero intrigante, como si fuera un verdadero reporte policial

El reporte debe tener entre 200-300 palabras y estar dividido en 3-4 párrafos cortos.

IMPORTANTE: Responde SIEMPRE en español. No reveles quién es el culpable ni des pistas obvias sobre la solución.`

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8, // Un poco más de creatividad para la narrativa
    })

    const story = response.choices[0].message.content?.trim()
    
    if (!story) {
      throw new Error("No se pudo generar la historia del caso")
    }

    return story
  } catch (error) {
    console.error("Error generando historia del caso:", error)
    throw new Error("Error al generar el reporte inicial del caso")
  }
}