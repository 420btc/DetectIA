import { type NextRequest, NextResponse } from "next/server"
import { generateCaseMap } from "@/lib/investigation-analyzer"

export async function POST(request: NextRequest) {
  try {
    const { caseData } = await request.json()

    const map = await generateCaseMap(caseData)

    return NextResponse.json({ map })
  } catch (error) {
    console.error("Error generating map:", error)
    return NextResponse.json({ error: "Failed to generate map" }, { status: 500 })
  }
}
