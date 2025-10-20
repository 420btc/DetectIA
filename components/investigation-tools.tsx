"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Map, Lightbulb } from "lucide-react"

interface InvestigationToolsProps {
  caseData: any
}

export function InvestigationTools({ caseData }: InvestigationToolsProps) {
  const [showMap, setShowMap] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [map, setMap] = useState<string | null>(null)
  const [hints, setHints] = useState<string[]>([])
  const [loadingMap, setLoadingMap] = useState(false)
  const [loadingHints, setLoadingHints] = useState(false)

  const handleGenerateMap = async () => {
    setLoadingMap(true)
    try {
      const response = await fetch("/api/case-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseData }),
      })
      const data = await response.json()
      setMap(data.map)
      setShowMap(true)
    } catch (error) {
      console.error("Error generating map:", error)
    } finally {
      setLoadingMap(false)
    }
  }

  const handleGenerateHints = async () => {
    setLoadingHints(true)
    try {
      const response = await fetch("/api/investigation-hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseData, currentProgress: {} }),
      })
      const data = await response.json()
      setHints(data.hints)
      setShowHints(true)
    } catch (error) {
      console.error("Error generating hints:", error)
    } finally {
      setLoadingHints(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleGenerateMap} disabled={loadingMap} className="flex-1 bg-slate-700 hover:bg-slate-600">
          {loadingMap ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando mapa...
            </>
          ) : (
            <>
              <Map className="mr-2 h-4 w-4" />
              Mapa de la Escena
            </>
          )}
        </Button>

        <Button
          onClick={handleGenerateHints}
          disabled={loadingHints}
          className="flex-1 bg-slate-700 hover:bg-slate-600"
        >
          {loadingHints ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando pistas...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Pistas de Investigación
            </>
          )}
        </Button>
      </div>

      {showMap && map && (
        <Card className="bg-slate-900 border-slate-700 p-4">
          <h3 className="text-lg font-bold text-amber-500 mb-3">MAPA DE LA ESCENA DEL CRIMEN</h3>
          <pre className="bg-slate-950 p-3 rounded text-xs text-slate-300 overflow-x-auto font-mono">{map}</pre>
        </Card>
      )}

      {showHints && hints.length > 0 && (
        <Card className="bg-slate-900 border-slate-700 p-4">
          <h3 className="text-lg font-bold text-amber-500 mb-3">PISTAS DE INVESTIGACIÓN</h3>
          <div className="space-y-2">
            {hints.map((hint, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded p-3 flex gap-3">
                <div className="text-amber-500 font-bold text-lg">{idx + 1}</div>
                <p className="text-sm text-slate-300">{hint}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
