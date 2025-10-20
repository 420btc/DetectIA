"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface RiddleGameProps {
  caseData: any
}

export function RiddleGame({ caseData }: RiddleGameProps) {
  const [riddles, setRiddles] = useState<any[]>([])
  const [currentRiddle, setCurrentRiddle] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState("")
  const [answered, setAnswered] = useState(false)
  const [showHints, setShowHints] = useState(0)
  const [correct, setCorrect] = useState(false)

  useEffect(() => {
    const loadRiddles = async () => {
      try {
        const response = await fetch("/api/minigames/riddles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseData, count: 3 }),
        })
        const data = await response.json()
        setRiddles(data.riddles)
      } catch (error) {
        console.error("Error loading riddles:", error)
      } finally {
        setLoading(false)
      }
    }
    loadRiddles()
  }, [caseData])

  const handleSubmit = () => {
    const riddle = riddles[currentRiddle]
    const isCorrect = input.toLowerCase().trim() === riddle.answer.toLowerCase().trim()
    setCorrect(isCorrect)
    setAnswered(true)
    if (isCorrect) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentRiddle < riddles.length - 1) {
      setCurrentRiddle(currentRiddle + 1)
      setAnswered(false)
      setInput("")
      setShowHints(0)
      setCorrect(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700 p-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </Card>
    )
  }

  if (riddles.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700 p-6">
        <p className="text-slate-400">No se pudieron cargar las adivinanzas.</p>
      </Card>
    )
  }

  const riddle = riddles[currentRiddle]
  const isLastRiddle = currentRiddle === riddles.length - 1

  return (
    <Card className="bg-slate-900 border-slate-700 p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-amber-500">
            Adivinanza {currentRiddle + 1} de {riddles.length}
          </h3>
          <span className="text-sm text-slate-400">Puntuación: {score}</span>
        </div>
        <div className="w-full bg-slate-800 rounded h-2">
          <div
            className="bg-amber-600 h-2 rounded transition-all"
            style={{ width: `${((currentRiddle + 1) / riddles.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded p-4 mb-6">
        <p className="text-lg text-slate-100 italic">{riddle.riddle}</p>
      </div>

      {showHints > 0 && (
        <div className="bg-slate-800 border border-amber-700 rounded p-4 mb-4 space-y-2">
          {riddle.hints.slice(0, showHints).map((hint: string, idx: number) => (
            <p key={idx} className="text-sm text-amber-300">
              Pista {idx + 1}: {hint}
            </p>
          ))}
        </div>
      )}

      {!answered ? (
        <div className="space-y-3 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Escribe tu respuesta..."
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-600"
          />

          <div className="flex gap-2">
            <Button onClick={handleSubmit} className="flex-1 bg-amber-600 hover:bg-amber-700">
              Responder
            </Button>
            {showHints < riddle.hints.length && (
              <Button
                onClick={() => setShowHints(showHints + 1)}
                variant="outline"
                className="border-slate-600 hover:bg-slate-800"
              >
                Pista ({showHints}/{riddle.hints.length})
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <div
            className={`p-4 rounded border ${correct ? "bg-gray-800 border-gray-600" : "bg-gray-700 border-gray-500"}`}
          >
            <p className={`font-bold ${correct ? "text-green-200" : "text-red-200"}`}>
              {correct ? "¡Correcto!" : "Incorrecto"}
            </p>
            <p className={`text-sm mt-1 ${correct ? "text-green-300" : "text-red-300"}`}>
              La respuesta es: <span className="font-semibold">{riddle.answer}</span>
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded p-4">
            <p className="text-sm text-slate-300">{riddle.explanation}</p>
          </div>

          <Button onClick={handleNext} className="w-full bg-amber-600 hover:bg-amber-700" disabled={isLastRiddle}>
            {isLastRiddle ? "Finalizar" : "Siguiente Adivinanza"}
          </Button>
        </div>
      )}

      {isLastRiddle && answered && (
        <div className="mt-6 p-4 bg-amber-900 border border-amber-700 rounded text-center">
          <p className="text-amber-200 font-bold">
            Puntuación Final: {score} de {riddles.length}
          </p>
        </div>
      )}
    </Card>
  )
}
