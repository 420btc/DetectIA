"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, FileText, Play } from "lucide-react"

interface CaseStoryProps {
  caseData: any
  onContinueToGame: () => void
}

export function CaseStory({ caseData, onContinueToGame }: CaseStoryProps) {
  const [story, setStory] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    generateStory()
  }, [caseData])

  const generateStory = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-case-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseData }),
      })

      if (!response.ok) {
        throw new Error("Error generando historia")
      }

      const data = await response.json()
      setStory(data.story)
    } catch (error) {
      console.error("Error generating story:", error)
      setError("No se pudo generar el reporte del caso.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 to-slate-900">
        <Card className="w-full max-w-2xl bg-slate-900 border-amber-700 p-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-amber-500 mb-2">Preparando Reporte del Caso</h2>
            <p className="text-slate-400">Generando el informe inicial de la investigación...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 to-slate-900">
        <Card className="w-full max-w-2xl bg-slate-900 border-red-700 p-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <FileText className="mx-auto h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={generateStory} className="bg-amber-600 hover:bg-amber-700">
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 to-slate-900">
      <Card className="w-full max-w-4xl bg-slate-900 border-amber-700 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-amber-500" />
            <h1 className="text-3xl font-bold text-amber-500">REPORTE INICIAL</h1>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-1 inline-block">
            <span className="text-sm font-mono text-slate-400">CASO #{caseData.caseId}</span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-amber-400 mb-4 text-center">{caseData.title}</h2>
          
          <div className="prose prose-invert max-w-none">
            {story.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-slate-300 leading-relaxed mb-4 text-justify">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
            <p className="text-amber-200 text-sm font-medium">
              📋 Tu misión: Interroga a los sospechosos, analiza la evidencia y descubre la verdad.
            </p>
          </div>
          
          <Button
            onClick={onContinueToGame}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 text-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Comenzar Investigación
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-500">
            Departamento de Policía • División de Homicidios • Confidencial
          </p>
        </div>
      </Card>
    </div>
  )
}