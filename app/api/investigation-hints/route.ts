import { type NextRequest, NextResponse } from "next/server"
import { generateInvestigationHints } from "@/lib/investigation-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { caseData, currentProgress } = await request.json()

    const hints = await generateInvestigationHints(caseData, currentProgress)

    return NextResponse.json({ hints })
  } catch (error) {
    console.error("Error generating hints:", error)
    return NextResponse.json({ error: "Failed to generate hints" }, { status: 500 })
  }
}
