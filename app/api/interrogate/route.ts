import { type NextRequest, NextResponse } from "next/server"
import { interrogateSuspect } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { caseData, suspectIndex, question, conversationHistory } = await request.json()

    const response = await interrogateSuspect(caseData, suspectIndex, question, conversationHistory)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error interrogating:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to interrogate"
    return NextResponse.json(
      { error: errorMessage, details: "Verifica que OPENAI_API_KEY esté configurada correctamente" },
      { status: 500 },
    )
  }
}
