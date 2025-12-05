"use client"

import { useState, useEffect } from "react"
import { GameMenu } from "@/components/game-menu"
import { GameBoard } from "@/components/game-board"
import { CampaignMenu } from "@/components/campaign-menu"
import { StatsDashboard } from "@/components/stats-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { GameState, Chapter, ActiveSession } from "@/lib/game-types"
import { saveGameState, loadGameState } from "@/lib/campaign-system"

type ViewState = "menu" | "campaign" | "playing" | "stats"

export default function Home() {
  const [view, setView] = useState<ViewState>("menu")
  const [caseData, setCaseData] = useState(null)
  const [gameState, setGameState] = useState<GameState | undefined>(undefined)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null)

  // Load game state on mount
  useEffect(() => {
    const loadedState = loadGameState()
    if (loadedState) {
      setGameState(loadedState)
      if (loadedState.activeSession) {
        setActiveSession(loadedState.activeSession)
      }
    }
  }, [])

  const handleStartGame = (selectedCase: any, currentGameState?: GameState) => {
    setCaseData(selectedCase)
    setGameState(currentGameState)
    setView("playing")
  }

  const handleStartCampaignCase = (currentGameState: GameState, chapter: Chapter) => {
    generateCampaignCase(currentGameState, chapter)
  }

  const handleContinueSession = () => {
    if (gameState?.activeSession) {
      setCaseData(gameState.activeSession.caseData)
      setView("playing")
    }
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
    // If we are in campaign mode and have a game state, save the session
    if (gameState && caseData && view === "playing") {
      // Create active session object
      // Note: We need to get current stats/notes from GameBoard.
      // Since we can't easily pull that up, we'll rely on GameBoard calling a save callback
      // OR we just save the caseData and reset stats for now (MVP)
      // Ideally GameBoard should have an onSave prop.

      // For now, let's just save the caseData so they can restart the case at least
      // To do this properly, we should update GameBoard to notify us of state changes
      // or handle the save inside GameBoard before calling onBackToMenu.

      // Let's assume for now we just save the caseData to allow re-entry
      const session: ActiveSession = {
        caseData: caseData,
        startTime: Date.now(), // This resets time, but better than losing case
        notes: "", // We lose notes unless we pass them back
        stats: {
          questionsAsked: 0,
          hintsUsed: 0,
          minigamesCompleted: 0
        }
      }

      const newState = {
        ...gameState,
        activeSession: session
      }
      setGameState(newState)
      saveGameState(newState)
    }

    setView("menu")
    setCaseData(null)
  }

  // New handler for saving session from GameBoard
  const handleSaveSession = (sessionData: { notes: string, stats: any }) => {
    if (gameState && caseData) {
      const session: ActiveSession = {
        caseData: caseData,
        startTime: Date.now(), // Ideally preserve original start time
        notes: sessionData.notes,
        stats: sessionData.stats
      }

      const newState = {
        ...gameState,
        activeSession: session
      }
      setGameState(newState)
      saveGameState(newState)
    }
  }

  const handleCaseComplete = (newState: GameState) => {
    // Clear active session on completion
    const stateWithoutSession = {
      ...newState,
      activeSession: null
    }
    setGameState(stateWithoutSession)
    saveGameState(stateWithoutSession)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {view === "menu" && (
        <GameMenu
          onStartGame={handleStartGame}
          onStartCampaign={() => setView("campaign")}
          onShowStats={() => setView("stats")}
          onContinueSession={gameState?.activeSession ? handleContinueSession : undefined}
          gameState={gameState}
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
          onBackToMenu={handleBackToMenu}
          onCaseComplete={handleCaseComplete}
          onSaveSession={handleSaveSession}
          initialNotes={gameState?.activeSession?.notes}
        />
      )}
    </main>
  )
}

