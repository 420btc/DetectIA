"use client"

import { useState } from "react"
import { GameMenu } from "@/components/game-menu"
import { GameBoard } from "@/components/game-board"
import { CaseStory } from "@/components/case-story"

export default function Home() {
  const [gameState, setGameState] = useState<"menu" | "story" | "playing">("menu")
  const [caseData, setCaseData] = useState(null)

  const handleStartGame = (selectedCase: any) => {
    setCaseData(selectedCase)
    setGameState("story")
  }

  const handleContinueToGame = () => {
    setGameState("playing")
  }

  const handleBackToMenu = () => {
    setGameState("menu")
    setCaseData(null)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {gameState === "menu" ? (
        <GameMenu onStartGame={handleStartGame} />
      ) : gameState === "story" ? (
        <CaseStory caseData={caseData} onContinueToGame={handleContinueToGame} />
      ) : (
        <GameBoard caseData={caseData} onBackToMenu={handleBackToMenu} />
      )}
    </main>
  )
}
