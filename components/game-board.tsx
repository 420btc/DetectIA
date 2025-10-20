"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InterrogationRoom } from "./interrogation-room"
import { EvidenceBoard } from "./evidence-board"
import { CaseProgress } from "./case-progress"
import { InvestigationTools } from "./investigation-tools"
import { MinigamesHub } from "./minigames-hub"

interface GameBoardProps {
  caseData: any
  onBackToMenu: () => void
}

export function GameBoard({ caseData, onBackToMenu }: GameBoardProps) {
  const [activeTab, setActiveTab] = useState<"interrogation" | "evidence" | "progress" | "tools" | "minigames">(
    "interrogation",
  )

  if (!caseData) {
    return <div>Cargando caso...</div>
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-amber-500">CASO #{caseData.caseId}</h1>
            <p className="text-slate-400">{caseData.title}</p>
          </div>
          <Button onClick={onBackToMenu} variant="outline" className="border-slate-600 bg-transparent">
            Volver al Menú
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["interrogation", "evidence", "progress", "tools", "minigames"] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "outline"}
              className={`capitalize ${
                activeTab === tab ? "bg-amber-600 hover:bg-amber-700" : "border-slate-600 hover:bg-slate-800"
              }`}
            >
              {tab === "interrogation"
                ? "Interrogatorio"
                : tab === "evidence"
                  ? "Evidencia"
                  : tab === "progress"
                    ? "Progreso"
                    : tab === "tools"
                      ? "Herramientas"
                      : "Minijuegos"}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeTab === "interrogation" && <InterrogationRoom caseData={caseData} />}
            {activeTab === "evidence" && <EvidenceBoard caseData={caseData} />}
            {activeTab === "progress" && <CaseProgress caseData={caseData} />}
            {activeTab === "tools" && <InvestigationTools caseData={caseData} />}
            {activeTab === "minigames" && <MinigamesHub caseData={caseData} />}
          </div>

          {/* Sidebar - Suspects */}
          <div>
            <Card className="bg-slate-900 border-slate-700 p-4">
              <h3 className="text-lg font-bold text-amber-500 mb-4">SOSPECHOSOS</h3>
              <div className="space-y-3">
                {caseData.suspects?.map((suspect: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 bg-slate-800 border rounded hover:border-amber-600 cursor-pointer transition ${
                      idx === caseData.culprit ? "border-red-700" : "border-slate-700"
                    }`}
                  >
                    <p className="font-semibold text-slate-100">{suspect.name}</p>
                    <p className="text-xs text-slate-400">{suspect.role}</p>
                    {idx === caseData.culprit && <p className="text-xs text-red-400 mt-1">⚠️ Culpable (oculto)</p>}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
