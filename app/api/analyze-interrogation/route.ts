import { type NextRequest, NextResponse } from "next/server"
import { analyzeInterrogation } from "@/lib/investigation-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { suspect, question, response, conversationHistory, caseData } = await request.json()

    const analysis = await analyzeInterrogation(suspect, question, response, conversationHistory, caseData)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Error analyzing interrogation:", error)
    return NextResponse.json({ error: "Failed to analyze interrogation" }, { status: 500 })
  }
}
