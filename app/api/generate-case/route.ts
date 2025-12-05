import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { difficulty, theme, mastermindClue, chapterId } = body

    console.log("[v0] Starting case generation with params:", { difficulty, theme, chapterId })

    // We don't need to instantiate OpenAI client here anymore as it's handled in lib/case-generator.ts
    // But the original file had helper functions inside the route file too?
    // Wait, the original file imported generateCaseWithAI but also defined local versions of the helper functions?
    // Ah, I see the previous file content I viewed for route.ts had all the logic inside it!
    // But I also viewed lib/case-generator.ts which had the logic too.
    // It seems there was code duplication or I misread.
    // The route.ts I viewed in step 126 had all the logic inline.
    // The lib/case-generator.ts I viewed in step 127 ALSO had the logic.
    // I should use the lib version to avoid duplication and use the updated logic.

    // Let's import the updated function from lib
    const { generateCaseWithAI } = await import("@/lib/case-generator")

    const caseData = await generateCaseWithAI({
      difficulty,
      theme,
      mastermindClue,
      chapterId
    })

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
