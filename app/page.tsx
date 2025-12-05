"use client"

import { useState } from "react"
import { GameMenu } from "@/components/game-menu"
import { GameBoard } from "@/components/game-board"
import { CampaignMenu } from "@/components/campaign-menu"
import { StatsDashboard } from "@/components/stats-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { GameState, Chapter } from "@/lib/game-types"

type ViewState = "menu" | "campaign" | "playing" | "stats"

export default function Home() {
  const [view, setView] = useState<ViewState>("menu")
  const [caseData, setCaseData] = useState(null)
  const [gameState, setGameState] = useState<GameState | undefined>(undefined)

  const handleStartGame = (selectedCase: any, currentGameState?: GameState) => {
    setCaseData(selectedCase)
    setGameState(currentGameState)
    setView("playing")
  }

  const handleStartCampaignCase = (currentGameState: GameState, chapter: Chapter) => {
    // In a real implementation, we would generate a case specific to the chapter
    // For now, we'll trigger the standard case generation but pass the game state
    // The actual generation happens in the GameMenu or CampaignMenu component
    // Here we just need to handle the transition

    // Note: CampaignMenu calls onStartCase which should trigger generation
    // We need to bridge that. For now, let's assume CampaignMenu handles generation
    // and passes the data here.

    // Actually, CampaignMenu needs to generate the case first.
    // Let's update CampaignMenu to generate the case.
    // But wait, CampaignMenu currently just calls onStartCase with state and chapter.
    // We need to fetch the case here or in CampaignMenu.

    // Let's modify this flow slightly:
    // 1. CampaignMenu calls onStartCase
    // 2. We set loading state (if we had one here)
    // 3. We generate case with chapter params
    // 4. We set view to playing

    generateCampaignCase(currentGameState, chapter)
  }

  const generateCampaignCase = async (state: GameState, chapter: Chapter) => {
    try {
      const response = await fetch("/api/generate-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: state.settings.difficulty,
          chapterId: chapter.id,
          theme: chapter.theme,
          mastermindClue: chapter.mastermindClue
        }),
      })

      if (!response.ok) throw new Error("Error generating case")

      const data = await response.json()
      setCaseData(data)
      setGameState(state)
      setView("playing")
    } catch (error) {
      console.error("Error generating campaign case:", error)
      // Ideally show error toast
    }
  }

  const handleBackToMenu = () => {
    setView("menu")
    setCaseData(null)
  }

  const handleCaseComplete = (newState: GameState) => {
    setGameState(newState)
    // We stay in playing view to show the report
    // The report component handles "Continue" which calls onBackToMenu
    // But for campaign, "Continue" should probably go back to Campaign Menu
    // We can handle that in the GameBoard's onBackToMenu or a new prop
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {view === "menu" && (
        <GameMenu
          onStartGame={handleStartGame}
          onStartCampaign={() => setView("campaign")}
          onShowStats={() => setView("stats")}
        />
      )}

      {view === "campaign" && (
        <CampaignMenu
          onStartCase={handleStartCampaignCase}
          onBack={() => setView("menu")}
        />
      )}

      {view === "stats" && gameState && (
        <div className="p-4 max-w-6xl mx-auto">
          <Button
            onClick={() => setView("menu")}
            variant="ghost"
            className="mb-4 text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Menú
          </Button>
          <StatsDashboard gameState={gameState} />
        </div>
      )}

      {view === "playing" && (
        <GameBoard
          caseData={caseData}
          gameState={gameState}
          onBackToMenu={() => setView(gameState ? "campaign" : "menu")}
          onCaseComplete={handleCaseComplete}
        />
      )}
    </main>
  )
}

