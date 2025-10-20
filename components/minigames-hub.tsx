"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MultipleChoiceGame } from "./minigames/multiple-choice-game"
import { RiddleGame } from "./minigames/riddle-game"
import { DeductionGame } from "./minigames/deduction-game"

interface MinigamesHubProps {
  caseData: any
}

export function MinigamesHub({ caseData }: MinigamesHubProps) {
  const [activeGame, setActiveGame] = useState<"menu" | "multiple-choice" | "riddles" | "deduction">("menu")
  const [loading, setLoading] = useState(false)

  const handleStartGame = async (gameType: "multiple-choice" | "riddles" | "deduction") => {
    setLoading(true)
    setActiveGame(gameType)
    setLoading(false)
  }

  if (activeGame === "menu") {
    return (
      <Card className="bg-slate-900 border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-amber-500 mb-6">MINIJUEGOS DE DEDUCCIÓN</h2>
        <p className="text-slate-400 mb-6">Prueba tus habilidades de detective con estos desafíos especiales.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => handleStartGame("multiple-choice")}
            disabled={loading}
            className="h-24 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center"
          >
            <div className="text-2xl mb-2">❓</div>
            <span className="text-sm font-semibold">Preguntas Múltiples</span>
            <span className="text-xs text-slate-400">4 opciones</span>
          </Button>

          <Button
            onClick={() => handleStartGame("riddles")}
            disabled={loading}
            className="h-24 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center"
          >
            <div className="text-2xl mb-2">🧩</div>
            <span className="text-sm font-semibold">Adivinanzas</span>
            <span className="text-xs text-slate-400">Con pistas</span>
          </Button>

          <Button
            onClick={() => handleStartGame("deduction")}
            disabled={loading}
            className="h-24 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center"
          >
            <div className="text-2xl mb-2">🔍</div>
            <span className="text-sm font-semibold">Deducción</span>
            <span className="text-xs text-slate-400">Lógica pura</span>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setActiveGame("menu")} variant="outline" className="border-slate-600 hover:bg-slate-800">
        Volver a Minijuegos
      </Button>

      {activeGame === "multiple-choice" && <MultipleChoiceGame caseData={caseData} />}
      {activeGame === "riddles" && <RiddleGame caseData={caseData} />}
      {activeGame === "deduction" && <DeductionGame caseData={caseData} />}
    </div>
  )
}
