import { type NextRequest, NextResponse } from "next/server"
import { generateMultipleChoiceQuestions } from "@/lib/minigames-generator"

export async function POST(request: NextRequest) {
  try {
    const { caseData, count } = await request.json()
    const questions = await generateMultipleChoiceQuestions(caseData, count || 4)
    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
