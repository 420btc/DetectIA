import { type NextRequest, NextResponse } from "next/server"
import { generateCaseStory } from "@/lib/case-story-generator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { caseData } = body

    if (!caseData) {
      return NextResponse.json(
        { error: "Datos del caso requeridos" },
        { status: 400 }
      )
    }

    // Generar la historia del caso
    const story = await generateCaseStory({
      title: caseData.title,
      location: caseData.location,
      timeline: caseData.timeline,
      description: caseData.description,
      suspects: caseData.suspects.map((suspect: any) => ({
        name: suspect.name,
        role: suspect.role
      }))
    })

    return NextResponse.json({ story })
  } catch (error) {
    console.error("Error en generate-case-story:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}