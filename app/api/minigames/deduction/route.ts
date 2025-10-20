import { type NextRequest, NextResponse } from "next/server"
import { generateDeductionTests } from "@/lib/minigames-generator"

export async function POST(request: NextRequest) {
  try {
    const { caseData, count } = await request.json()
    const tests = await generateDeductionTests(caseData, count || 3)
    return NextResponse.json({ tests })
  } catch (error) {
    console.error("Error generating deduction tests:", error)
    return NextResponse.json({ error: "Failed to generate deduction tests" }, { status: 500 })
  }
}
