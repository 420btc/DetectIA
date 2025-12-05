"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MultipleChoiceGame } from "./minigames/multiple-choice-game"
import { RiddleGame } from "./minigames/riddle-game"
import { DeductionGame } from "./minigames/deduction-game"
import { MemoryGame } from "./minigames/memory-game"
import { TimelinePuzzle } from "./minigames/timeline-puzzle"
import { LieDetector } from "./minigames/lie-detector"
import { EvidenceMatch } from "./minigames/evidence-match"
import { ArrowLeft } from "lucide-react"

interface MinigamesHubProps {
  caseData: any
  onComplete?: (minigameId: string, score: number) => void
}

type GameType = "menu" | "multiple-choice" | "riddles" | "deduction" | "memory" | "timeline" | "lie-detector" | "evidence-match"

interface MinigameInfo {
  id: GameType
  icon: string
  name: string
  description: string
  difficulty: 'Fácil' | 'Medio' | 'Difícil'
  skills: string[]
  isNew?: boolean
}

const MINIGAMES: MinigameInfo[] = [
  {
    id: "memory",
    icon: "🧠",
    name: "Desafío de Memoria",
    description: "Memoriza los detalles del caso",
    difficulty: "Medio",
    skills: ["Percepción", "Atención"],
    isNew: true
  },
  {
    id: "lie-detector",
    icon: "🎭",
    name: "Detector de Mentiras",
    description: "Identifica las mentiras de los sospechosos",
    difficulty: "Difícil",
    skills: ["Persuasión", "Intuición"],
    isNew: true
  },
  {
    id: "timeline",
    icon: "⏱️",
    name: "Puzzle Cronológico",
    description: "Ordena los eventos correctamente",
    difficulty: "Medio",
    skills: ["Lógica", "Análisis"],
    isNew: true
  },
  {
    id: "evidence-match",
    icon: "🔗",
    name: "Conexión de Evidencia",
    description: "Vincula evidencias con sospechosos",
    difficulty: "Medio",
    skills: ["Investigación", "Deducción"],
    isNew: true
  },
  {
    id: "multiple-choice",
    icon: "❓",
    name: "Preguntas Múltiples",
    description: "4 opciones para cada pregunta",
    difficulty: "Fácil",
    skills: ["Conocimiento"]
  },
  {
    id: "riddles",
    icon: "🧩",
    name: "Adivinanzas",
    description: "Resuelve acertijos con pistas progresivas",
    difficulty: "Medio",
    skills: ["Pensamiento lateral"]
  },
  {
    id: "deduction",
    icon: "🔍",
    name: "Deducción Lógica",
    description: "Usa la lógica pura para resolver",
    difficulty: "Difícil",
    skills: ["Lógica", "Razonamiento"]
  }
]

export function MinigamesHub({ caseData, onComplete }: MinigamesHubProps) {
  const [activeGame, setActiveGame] = useState<GameType>("menu")

  const handleStartGame = (gameType: GameType) => {
    setActiveGame(gameType)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-600'
      case 'Medio': return 'bg-amber-600'
      case 'Difícil': return 'bg-red-600'
      default: return 'bg-slate-600'
    }
  }

  if (activeGame === "menu") {
    return (
      <Card className="bg-slate-900 border-slate-700 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-amber-500 mb-2">MINIJUEGOS DE DEDUCCIÓN</h2>
          <p className="text-slate-400">Prueba tus habilidades de detective con estos desafíos especiales.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MINIGAMES.map((game) => (
            <Button
              key={game.id}
              onClick={() => handleStartGame(game.id)}
              className="h-auto p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-600/50 flex flex-col items-start justify-start text-left transition-all"
            >
              <div className="flex items-start justify-between w-full mb-2">
                <span className="text-3xl">{game.icon}</span>
                <div className="flex gap-1">
                  {game.isNew && (
                    <Badge className="bg-green-600 text-xs">NUEVO</Badge>
                  )}
                  <Badge className={`${getDifficultyColor(game.difficulty)} text-xs`}>
                    {game.difficulty}
                  </Badge>
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-100">{game.name}</span>
              <span className="text-xs text-slate-400 mt-1">{game.description}</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {game.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs border-slate-600 text-slate-500">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Button>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setActiveGame("menu")}
        variant="outline"
        className="border-slate-600 hover:bg-slate-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a Minijuegos
      </Button>

      {activeGame === "multiple-choice" && <MultipleChoiceGame caseData={caseData} />}
      {activeGame === "riddles" && <RiddleGame caseData={caseData} />}
      {activeGame === "deduction" && <DeductionGame caseData={caseData} />}
      {activeGame === "memory" && <MemoryGame caseData={caseData} />}
      {activeGame === "timeline" && <TimelinePuzzle caseData={caseData} />}
      {activeGame === "lie-detector" && <LieDetector caseData={caseData} />}
      {activeGame === "evidence-match" && <EvidenceMatch caseData={caseData} />}
    </div>
  )
}

