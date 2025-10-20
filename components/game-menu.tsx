"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface GameMenuProps {
  onStartGame: (caseData: any) => void
}

export function GameMenu({ onStartGame }: GameMenuProps) {
  const [loading, setLoading] = useState(false)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [error, setError] = useState<string | null>(null)
  const [progressMessage, setProgressMessage] = useState<string>("")

  const handleStartCase = async () => {
    setLoading(true)
    setError(null)
    setProgressMessage("")
    
    try {
      const response = await fetch("/api/generate-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, stream: true }),
      })

      if (!response.ok) {
        throw new Error("Error generando caso")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.message) {
                  setProgressMessage(data.message)
                } else if (data.caseData && data.complete) {
                  onStartGame(data.caseData)
                  return
                } else if (data.error) {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                // Ignore parsing errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating case:", error)
      setError("No se pudo generar el caso. Verifica tu API key de OpenAI.")
    } finally {
      setLoading(false)
      setProgressMessage("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 to-slate-900">
      <Card className="w-full max-w-md bg-slate-900 border-amber-700 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-500 mb-2">DETECTIVE AI</h1>
          <p className="text-slate-400">Interroga a los sospechosos. Encuentra al culpable.</p>
          <p className="text-xs text-slate-500 mt-2">Cada caso es único y generado por IA</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Selecciona Dificultad</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <Button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  variant={difficulty === level ? "default" : "outline"}
                  className={`capitalize ${
                    difficulty === level ? "bg-amber-600 hover:bg-amber-700" : "border-slate-600 hover:bg-slate-800"
                  }`}
                  disabled={loading}
                >
                  {level === "easy" ? "Fácil" : level === "medium" ? "Medio" : "Difícil"}
                </Button>
              ))}
            </div>
          </div>

          {error && <div className="p-3 bg-red-900 border border-red-700 rounded text-sm text-red-200">{error}</div>}

          {loading && progressMessage && (
            <div className="p-3 bg-blue-900 border border-blue-700 rounded text-sm text-blue-200">
              {progressMessage}
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
                {progressMessage || "Iniciando..."}
              </>
            ) : (
              "Iniciar Investigación"
            )}
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 space-y-2">
          <p className="text-xs text-slate-500 text-center">Basado en IA. Cada caso es único.</p>
          <p className="text-xs text-slate-600 text-center">Requiere OPENAI_API_KEY configurada</p>
        </div>
      </Card>
    </div>
  )
}
