"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface CaseProgressProps {
  caseData: any
  onComplete?: (result: {
    wasCorrect: boolean
    accusedSuspect: number
  }) => void
}

export function CaseProgress({ caseData, onComplete }: CaseProgressProps) {
  const [accusedSuspect, setAccusedSuspect] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [confirmAccusation, setConfirmAccusation] = useState<number | null>(null)

  const handleAccuseClick = (idx: number) => {
    if (confirmAccusation === idx) {
      // Confirmed
      setAccusedSuspect(idx)
      setShowResult(true)
      const isCorrect = idx === caseData.culprit

      // Delay slightly to show local result before switching view
      setTimeout(() => {
        onComplete?.({
          wasCorrect: isCorrect,
          accusedSuspect: idx
        })
      }, 2000)
    } else {
      setConfirmAccusation(idx)
    }
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
                className={`flex-1 h-2 rounded ${caseData.difficulty === level
                    ? level === "easy"
                      ? "bg-green-600"
                      : level === "medium"
                        ? "bg-amber-600"
                        : "bg-red-600"
                    : "bg-slate-700"
                  }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Accusation Section */}
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-xs text-slate-400 uppercase">Acusar a un sospechoso</p>
          </div>

          <div className="space-y-2">
            {caseData.suspects?.map((suspect: any, idx: number) => (
              <Button
                key={idx}
                onClick={() => handleAccuseClick(idx)}
                disabled={showResult}
                variant={confirmAccusation === idx ? "destructive" : "outline"}
                className={`w-full justify-start ${confirmAccusation === idx
                    ? "bg-red-900/50 border-red-500 hover:bg-red-900"
                    : "border-slate-600 hover:bg-slate-800"
                  } disabled:opacity-50`}
              >
                {confirmAccusation === idx ? (
                  <span className="flex items-center w-full">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    ¿Confirmar acusación a {suspect.name}?
                  </span>
                ) : (
                  suspect.name
                )}
              </Button>
            ))}
          </div>
          {confirmAccusation !== null && !showResult && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              Haz clic de nuevo para confirmar. Esta acción es irreversible.
            </p>
          )}
        </div>

        {/* Result */}
        {showResult && (
          <div
            className={`border-t border-slate-700 pt-4 p-3 rounded animate-in fade-in zoom-in duration-300 ${isCorrect ? "bg-green-900/50 border-green-700" : "bg-red-900/50 border-red-700"
              }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
              <p className={`font-bold text-lg ${isCorrect ? "text-green-300" : "text-red-300"}`}>
                {isCorrect ? "¡CORRECTO!" : "¡INCORRECTO!"}
              </p>
            </div>
            <p className="text-sm text-slate-200">
              {isCorrect
                ? `Has atrapado al culpable. Generando reporte...`
                : `El verdadero culpable ha escapado. Generando reporte...`}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
