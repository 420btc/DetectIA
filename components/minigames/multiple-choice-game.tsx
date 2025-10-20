"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface MultipleChoiceGameProps {
  caseData: any
}

export function MultipleChoiceGame({ caseData }: MultipleChoiceGameProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/minigames/multiple-choice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseData, count: 4 }),
        })
        const data = await response.json()
        setQuestions(data.questions)
      } catch (error) {
        console.error("Error loading questions:", error)
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [caseData])

  const handleAnswer = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
    setAnswered(true)
    if (optionIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
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

  if (questions.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700 p-6">
        <p className="text-slate-400">No se pudieron cargar las preguntas.</p>
      </Card>
    )
  }

  const question = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  return (
    <Card className="bg-slate-900 border-slate-700 p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-amber-500">
            Pregunta {currentQuestion + 1} de {questions.length}
          </h3>
          <span className="text-sm text-slate-400">Puntuación: {score}</span>
        </div>
        <div className="w-full bg-slate-800 rounded h-2">
          <div
            className="bg-amber-600 h-2 rounded transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <p className="text-lg text-slate-100 mb-6">{question.question}</p>

      <div className="space-y-3 mb-6">
        {question.options.map((option: string, idx: number) => (
          <Button
            key={idx}
            onClick={() => !answered && handleAnswer(idx)}
            disabled={answered}
            variant="outline"
            className={`w-full justify-start text-left h-auto py-3 px-4 ${
              answered
                ? idx === question.correctAnswer
                  ? "bg-green-900 border-green-700 text-green-200"
                  : idx === selectedAnswer
                    ? "bg-red-900 border-red-700 text-red-200"
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
          <p className="text-sm text-slate-300">{question.explanation}</p>
        </div>
      )}

      {answered && (
        <Button
          onClick={handleNext}
          className="w-full bg-amber-600 hover:bg-amber-700"
          disabled={isLastQuestion && answered}
        >
          {isLastQuestion ? "Finalizar" : "Siguiente Pregunta"}
        </Button>
      )}

      {isLastQuestion && answered && (
        <div className="mt-6 p-4 bg-amber-900 border border-amber-700 rounded text-center">
          <p className="text-amber-200 font-bold">
            Puntuación Final: {score} de {questions.length}
          </p>
        </div>
      )}
    </Card>
  )
}
