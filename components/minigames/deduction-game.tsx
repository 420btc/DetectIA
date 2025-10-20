"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface DeductionGameProps {
  caseData: any
}

export function DeductionGame({ caseData }: DeductionGameProps) {
  const [tests, setTests] = useState<any[]>([])
  const [currentTest, setCurrentTest] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  useEffect(() => {
    const loadTests = async () => {
      try {
        const response = await fetch("/api/minigames/deduction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseData, count: 3 }),
        })
        const data = await response.json()
        setTests(data.tests)
      } catch (error) {
        console.error("Error loading tests:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTests()
  }, [caseData])

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
    setAnswered(true)
    if (optionIndex === tests[currentTest].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentTest < tests.length - 1) {
      setCurrentTest(currentTest + 1)
      setAnswered(false)
      setSelectedAnswer(null)
    }
  }

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700 p-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </Card>
    )
  }

  if (tests.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700 p-6">
        <p className="text-slate-400">No se pudieron cargar los tests de deducción.</p>
      </Card>
    )
  }

  const test = tests[currentTest]
  const isLastTest = currentTest === tests.length - 1

  return (
    <Card className="bg-slate-900 border-slate-700 p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-amber-500">
            Test {currentTest + 1} de {tests.length}
          </h3>
          <span className="text-sm text-slate-400">Puntuación: {score}</span>
        </div>
        <div className="w-full bg-slate-800 rounded h-2">
          <div
            className="bg-amber-600 h-2 rounded transition-all"
            style={{ width: `${((currentTest + 1) / tests.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded p-4 mb-6">
        <p className="text-sm text-slate-300 mb-4">{test.scenario}</p>
        <p className="text-lg font-semibold text-slate-100">{test.question}</p>
      </div>

      <div className="space-y-3 mb-6">
        {test.options.map((option: string, idx: number) => (
          <Button
            key={idx}
            onClick={() => !answered && handleAnswer(idx)}
            disabled={answered}
            variant="outline"
            className={`w-full justify-start text-left h-auto py-3 px-4 ${
              answered
                ? idx === test.correctAnswer
                  ? "bg-gray-800 border-gray-600 text-gray-200"
                  : idx === selectedAnswer
                    ? "bg-gray-700 border-gray-500 text-gray-300"
                    : "border-slate-700 text-slate-300"
                : "border-slate-700 hover:bg-slate-800"
            }`}
          >
            {option}
          </Button>
        ))}
      </div>

      {answered && (
        <div className="bg-slate-800 border border-slate-700 rounded p-4 mb-6">
          <p className="text-sm text-slate-300">{test.reasoning}</p>
        </div>
      )}

      {answered && (
        <Button
          onClick={handleNext}
          className="w-full bg-amber-600 hover:bg-amber-700"
          disabled={isLastTest && answered}
        >
          {isLastTest ? "Finalizar" : "Siguiente Test"}
        </Button>
      )}

      {isLastTest && answered && (
        <div className="mt-6 p-4 bg-amber-900 border border-amber-700 rounded text-center">
          <p className="text-amber-200 font-bold">
            Puntuación Final: {score} de {tests.length}
          </p>
        </div>
      )}
    </Card>
  )
}
