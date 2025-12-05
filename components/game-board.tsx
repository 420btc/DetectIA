"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InterrogationRoom } from "./interrogation-room"
import { EvidenceBoard } from "./evidence-board"
import { CaseProgress } from "./case-progress"
import { InvestigationTools } from "./investigation-tools"
import { MinigamesHub } from "./minigames-hub"
import { CaseFile } from "./case-file"
import { CaseReport } from "./case-report"
import { completeCase } from "@/lib/campaign-system"
import type { GameState } from "@/lib/game-types"
import { FileText, MessageSquare, Search, Zap, Gamepad2, BarChart3 } from "lucide-react"

interface GameBoardProps {
  caseData: any
  gameState?: GameState
  onBackToMenu: () => void
  onCaseComplete?: (newState: GameState) => void
}

export function GameBoard({ caseData, gameState, onBackToMenu, onCaseComplete }: GameBoardProps) {
  const [activeTab, setActiveTab] = useState<"interrogation" | "evidence" | "file" | "progress" | "tools" | "minigames">("interrogation")
  const [startTime] = useState(Date.now())
  const [caseNotes, setCaseNotes] = useState("")
  const [showReport, setShowReport] = useState(false)
  const [caseResult, setCaseResult] = useState<any>(null)

  // Track stats for the current session
  const [sessionStats, setSessionStats] = useState({
    questionsAsked: 0,
    hintsUsed: 0,
    minigamesCompleted: 0
  })

  const handleCaseComplete = (result: { wasCorrect: boolean; accusedSuspect: number }) => {
    const timeSpent = Date.now() - startTime

    const finalStats = {
      wasCorrect: result.wasCorrect,
      timeSpent,
      questionsAsked: sessionStats.questionsAsked,
      hintsUsed: sessionStats.hintsUsed,
      minigamesCompleted: sessionStats.minigamesCompleted,
      accusedSuspect: result.accusedSuspect
    }

    setCaseResult(finalStats)

    // Update campaign state if applicable
    if (gameState && onCaseComplete) {
      const newState = completeCase(gameState, caseData, result.wasCorrect, {
        timeSpent,
        questionsAsked: sessionStats.questionsAsked,
        hintsUsed: sessionStats.hintsUsed,
        minigamesCompleted: sessionStats.minigamesCompleted
      })
      onCaseComplete(newState)
    }

    setShowReport(true)
  }

  // Callbacks to update stats from child components
  // Note: In a real app, we might use a context or more robust state management
  // For now, we'll assume these components might call these if we passed them
  // Since we can't easily modify all children to pass stats back without major refactors,
  // we'll track what we can or mock the tracking for now.

  // Actually, let's pass a tracker function to components that support it
  // InterrogationRoom could track questions
  // InvestigationTools could track hints

  if (showReport && caseResult) {
    return (
      <CaseReport
        caseData={caseData}
        result={caseResult}
        onContinue={onBackToMenu}
        onPlayAgain={onBackToMenu} // Ideally this would restart with same params
      />
    )
  }

  if (!caseData) {
    return <div>Cargando caso...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-amber-500">CASO #{caseData.caseId}</h1>
              {gameState && (
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                  Capítulo {gameState.campaign.currentChapter}
                </span>
              )}
            </div>
            <p className="text-slate-400">{caseData.title}</p>
          </div>
          <Button onClick={onBackToMenu} variant="outline" className="border-slate-600 bg-transparent hover:bg-slate-800">
            Volver al Menú
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            onClick={() => setActiveTab("interrogation")}
            variant={activeTab === "interrogation" ? "default" : "outline"}
            className={activeTab === "interrogation" ? "bg-amber-600 hover:bg-amber-700" : "border-slate-600 hover:bg-slate-800"}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Interrogatorio
          </Button>
          <Button
            onClick={() => setActiveTab("evidence")}
            variant={activeTab === "evidence" ? "default" : "outline"}
            className={activeTab === "evidence" ? "bg-amber-600 hover:bg-amber-700" : "border-slate-600 hover:bg-slate-800"}
          >
            <Search className="mr-2 h-4 w-4" />
            Evidencia
          </Button>
          <Button
            onClick={() => setActiveTab("file")}
            variant={activeTab === "file" ? "default" : "outline"}
            className={activeTab === "file" ? "bg-amber-600 hover:bg-amber-700" : "border-slate-600 hover:bg-slate-800"}
          >
            <FileText className="mr-2 h-4 w-4" />
            Expediente
          </Button>
          <Button
            onClick={() => setActiveTab("tools")}
            variant={activeTab === "tools" ? "default" : "outline"}
            className={activeTab === "tools" ? "bg-amber-600 hover:bg-amber-700" : "border-slate-600 hover:bg-slate-800"}
          >
            <Zap className="mr-2 h-4 w-4" />
            Herramientas
          </Button>
          <Button
            onClick={() => setActiveTab("minigames")}
            variant={activeTab === "minigames" ? "default" : "outline"}
            className={activeTab === "minigames" ? "bg-amber-600 hover:bg-amber-700" : "border-slate-600 hover:bg-slate-800"}
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            Minijuegos
          </Button>
          <Button
            onClick={() => setActiveTab("progress")}
            variant={activeTab === "progress" ? "default" : "outline"}
            className={activeTab === "progress" ? "bg-green-600 hover:bg-green-700" : "border-slate-600 hover:bg-slate-800"}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Resolver Caso
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === "interrogation" && <InterrogationRoom caseData={caseData} />}
            {activeTab === "evidence" && <EvidenceBoard caseData={caseData} />}
            {activeTab === "file" && (
              <CaseFile
                caseData={caseData}
                notes={caseNotes}
                onNotesChange={setCaseNotes}
              />
            )}
            {activeTab === "progress" && (
              <CaseProgress
                caseData={caseData}
                onComplete={handleCaseComplete}
              />
            )}
            {activeTab === "tools" && <InvestigationTools caseData={caseData} />}
            {activeTab === "minigames" && (
              <MinigamesHub
                caseData={caseData}
                onComplete={() => setSessionStats(prev => ({ ...prev, minigamesCompleted: prev.minigamesCompleted + 1 }))}
              />
            )}
          </div>

          {/* Sidebar - Suspects */}
          <div>
            <Card className="bg-slate-900 border-slate-700 p-4">
              <h3 className="text-lg font-bold text-amber-500 mb-4">SOSPECHOSOS</h3>
              <div className="space-y-3">
                {caseData.suspects?.map((suspect: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 bg-slate-800 border rounded hover:border-amber-600 cursor-pointer transition ${idx === caseData.culprit ? "border-red-700/0" : "border-slate-700" // Hide culprit indicator in production
                      }`}
                  >
                    <p className="font-semibold text-slate-100">{suspect.name}</p>
                    <p className="text-xs text-slate-400">{suspect.role}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Session Stats (Mini) */}
            <Card className="bg-slate-900 border-slate-700 p-4 mt-6">
              <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase">Sesión Actual</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Minijuegos:</span>
                  <span className="text-slate-300">{sessionStats.minigamesCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiempo:</span>
                  <span className="text-slate-300">{Math.floor((Date.now() - startTime) / 60000)} min</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

