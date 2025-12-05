"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, BookOpen, Zap, BarChart3, Settings, Trophy, Star } from "lucide-react"
import { loadGameState, createInitialGameState } from "@/lib/campaign-system"
import type { GameState } from "@/lib/game-types"

interface GameMenuProps {
  onStartGame: (caseData: any, gameState?: GameState) => void
  onStartCampaign: () => void
  onShowStats: () => void
}

export function GameMenu({ onStartGame, onStartCampaign, onShowStats }: GameMenuProps) {
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [error, setError] = useState<string | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [showQuickCase, setShowQuickCase] = useState(false)

  useEffect(() => {
    const saved = loadGameState()
    setGameState(saved || createInitialGameState())
  }, [])

  const handleStartCase = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/generate-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      })
      if (!response.ok) {
        throw new Error("Error generando caso")
      }
      const caseData = await response.json()
      onStartGame(caseData, gameState || undefined)
    } catch (error) {
      console.error("Error generating case:", error)
      setError("No se pudo generar el caso. Verifica tu API key de OpenAI.")
    } finally {
      setLoading(false)
    }
  }

  // Quick case mode selection
  if (showQuickCase) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <Card className="w-full max-w-md bg-slate-900/95 border-slate-700 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-amber-500">CASO RÁPIDO</h2>
            </div>
            <Button
              onClick={() => setShowQuickCase(false)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200"
            >
              ← Volver
            </Button>
          </div>

          <p className="text-slate-400 mb-6 text-sm">
            Genera un caso único sin afectar tu progreso de campaña.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Selecciona Dificultad
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["easy", "medium", "hard"] as const).map((level) => (
                  <Button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    variant={difficulty === level ? "default" : "outline"}
                    className={`capitalize ${difficulty === level
                        ? level === "easy" ? "bg-green-600 hover:bg-green-700" :
                          level === "medium" ? "bg-amber-600 hover:bg-amber-700" :
                            "bg-red-600 hover:bg-red-700"
                        : "border-slate-600 hover:bg-slate-800"
                      }`}
                  >
                    {level === "easy" ? "Fácil" : level === "medium" ? "Medio" : "Difícil"}
                  </Button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded text-sm text-red-200">
                {error}
              </div>
            )}

            <Button
              onClick={handleStartCase}
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando caso...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Iniciar Caso Rápido
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Main menu
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-lg space-y-6">
        {/* Title Card */}
        <Card className="bg-slate-900/95 border-amber-700/50 p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🕵️</div>
            <h1 className="text-5xl font-bold text-amber-500 mb-2 tracking-tight">
              DETECTIVE AI
            </h1>
            <p className="text-slate-400">Interroga. Deduce. Resuelve.</p>
          </div>

          {/* Detective Progress Summary */}
          {gameState && gameState.detective.casesCompleted > 0 && (
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Detective</span>
                  <Badge variant="outline" className="border-amber-600 text-amber-400">
                    Nv.{gameState.detective.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-slate-300">
                    {gameState.detective.casesWon}/{gameState.detective.casesCompleted}
                  </span>
                </div>
              </div>
              <Progress
                value={(gameState.detective.experience % 100)}
                className="h-2 bg-slate-700"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>{gameState.detective.rank}</span>
                <span>{gameState.detective.experience} XP</span>
              </div>
            </div>
          )}

          {/* Main Menu Options */}
          <div className="space-y-3">
            {/* Campaign Mode - Primary Action */}
            <Button
              onClick={onStartCampaign}
              className="w-full h-16 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-lg transition-all"
            >
              <BookOpen className="mr-3 h-6 w-6" />
              <div className="text-left">
                <div>Modo Campaña</div>
                <div className="text-xs font-normal opacity-75">
                  {gameState?.campaign.currentChapter
                    ? `Capítulo ${gameState.campaign.currentChapter} - El Arquitecto`
                    : '5 capítulos, una conspiración'}
                </div>
              </div>
            </Button>

            {/* Quick Case */}
            <Button
              onClick={() => setShowQuickCase(true)}
              variant="outline"
              className="w-full h-14 border-slate-600 hover:bg-slate-800 hover:border-amber-600/50"
            >
              <Zap className="mr-3 h-5 w-5 text-amber-500" />
              <div className="text-left">
                <div className="text-slate-200">Caso Rápido</div>
                <div className="text-xs text-slate-500">Un caso independiente</div>
              </div>
            </Button>

            {/* Stats */}
            <Button
              onClick={onShowStats}
              variant="outline"
              className="w-full h-14 border-slate-600 hover:bg-slate-800"
            >
              <BarChart3 className="mr-3 h-5 w-5 text-blue-400" />
              <div className="text-left">
                <div className="text-slate-200">Estadísticas</div>
                <div className="text-xs text-slate-500">Tu progreso y logros</div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-600">
            Cada caso es único, generado por IA
          </p>
          <p className="text-xs text-slate-700">
            Requiere OPENAI_API_KEY configurada
          </p>
        </div>
      </div>
    </div>
  )
}

