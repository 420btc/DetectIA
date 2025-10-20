import { type NextRequest, NextResponse } from "next/server"
import { generateRiddles } from "@/lib/minigames-generator"

export async function POST(request: NextRequest) {
  try {
    const { caseData, count } = await request.json()
    const riddles = await generateRiddles(caseData, count || 3)
    return NextResponse.json({ riddles })
  } catch (error) {
    console.error("Error generating riddles:", error)
    return NextResponse.json({ error: "Failed to generate riddles" }, { status: 500 })
  }
}
