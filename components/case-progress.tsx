"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface CaseProgressProps {
  caseData: any
}

export function CaseProgress({ caseData }: CaseProgressProps) {
  const [accusedSuspect, setAccusedSuspect] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleAccuse = (idx: number) => {
    setAccusedSuspect(idx)
    setShowResult(true)
  }

  const isCorrect = accusedSuspect === caseData.culprit

  return (
    <Card className="bg-slate-900 border-slate-700 p-4">
      <h2 className="text-xl font-bold text-amber-500 mb-4">PROGRESO DEL CASO</h2>

      <div className="space-y-4">
        {/* Case Info */}
        <div className="bg-slate-800 border border-slate-700 rounded p-3">
          <p className="text-xs text-slate-400 uppercase mb-1">Descripción del caso</p>
          <p className="text-sm text-slate-300">{caseData.description}</p>
        </div>

        {/* Difficulty */}
        <div>
          <p className="text-xs text-slate-400 uppercase mb-2">Dificultad</p>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((level) => (
              <div
                key={level}
                className={`flex-1 h-2 rounded ${
                  caseData.difficulty === level
                    ? level === "easy"
                      ? "bg-green-600"
                      : level === "medium"
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    : "bg-slate-700"
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Accusation Section */}
        <div className="border-t border-slate-700 pt-4">
          <p className="text-xs text-slate-400 uppercase mb-3">Acusar a un sospechoso</p>
          <div className="space-y-2">
            {caseData.suspects?.map((suspect: any, idx: number) => (
              <Button
                key={idx}
                onClick={() => handleAccuse(idx)}
                disabled={showResult}
                variant="outline"
                className="w-full justify-start border-slate-600 hover:bg-slate-800 disabled:opacity-50"
              >
                {suspect.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Result */}
        {showResult && (
          <div
            className={`border-t border-slate-700 pt-4 p-3 rounded ${
              isCorrect ? "bg-green-900 border-green-700" : "bg-red-900 border-red-700"
            }`}
          >
            <p className={`font-bold ${isCorrect ? "text-green-300" : "text-red-300"}`}>
              {isCorrect ? "¡CORRECTO!" : "¡INCORRECTO!"}
            </p>
            <p className="text-sm mt-2">
              {isCorrect
                ? `${caseData.suspects[caseData.culprit].name} era el culpable. ¡Caso resuelto!`
                : `El culpable era ${caseData.suspects[caseData.culprit].name}, no ${caseData.suspects[accusedSuspect].name}.`}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
