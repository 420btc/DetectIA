"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, EyeOff } from "lucide-react"

interface InterrogationRoomProps {
  caseData: any
}

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
  confidence?: number
}

export function InterrogationRoom({ caseData }: InterrogationRoomProps) {
  const [selectedSuspect, setSelectedSuspect] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [suspectStats, setSuspectStats] = useState<Record<number, any>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuspectChange = (idx: number) => {
    setSelectedSuspect(idx)
    setMessages([])
    setShowAnalysis(false)
  }

  const handleSendQuestion = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseData,
          suspectIndex: selectedSuspect,
          question: input,
          conversationHistory: messages,
        }),
      })
      const data = await response.json()
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
        confidence: data.confidence || 0.5,
      }
      setMessages((prev) => [...prev, assistantMessage])

      setSuspectStats((prev) => ({
        ...prev,
        [selectedSuspect]: {
          questionsAsked: (prev[selectedSuspect]?.questionsAsked || 0) + 1,
          inconsistencies: data.inconsistencies || 0,
          suspicionLevel: data.suspicionLevel || 0.5,
        },
      }))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const suspect = caseData.suspects[selectedSuspect]
  const isCulprit = selectedSuspect === caseData.culprit

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900 border-slate-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-500">SALA DE INTERROGATORIO</h2>
          <Button
            onClick={() => setShowAnalysis(!showAnalysis)}
            variant="outline"
            size="sm"
            className="border-slate-600 hover:bg-slate-800"
          >
            {showAnalysis ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAnalysis ? "Ocultar" : "Análisis"}
          </Button>
        </div>

        {/* Suspect Selection */}
        <div className="mb-4 flex gap-2 flex-wrap">
          {caseData.suspects?.map((s: any, idx: number) => {
            const stats = suspectStats[idx]
            return (
              <Button
                key={idx}
                onClick={() => handleSuspectChange(idx)}
                variant={selectedSuspect === idx ? "default" : "outline"}
                className={`relative ${
                  selectedSuspect === idx ? "bg-amber-600 hover:bg-amber-700" : "border-slate-600 hover:bg-slate-800"
                }`}
              >
                {s.name}
                {stats && stats.inconsistencies > 0 && (
                  <span className="ml-2 text-xs bg-gray-600 px-2 py-1 rounded">
                    {stats.inconsistencies} inconsistencias
                  </span>
                )}
              </Button>
            )
          })}
        </div>

        {/* Suspect Info Card */}
        {suspect && (
          <div className="bg-slate-800 border border-slate-700 rounded p-3 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 uppercase">Rol</p>
                <p className="text-sm font-semibold text-slate-100">{suspect.role}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase">Personalidad</p>
                <p className="text-sm font-semibold text-slate-100">{suspect.personality}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400 uppercase">Coartada</p>
                <p className="text-sm text-slate-300">{suspect.alibi}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Panel */}
        {showAnalysis && (
          <div className="bg-slate-950 border border-amber-700 rounded p-3 mb-4">
            <h3 className="text-sm font-bold text-amber-500 mb-2">ANÁLISIS DE INTERROGATORIO</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Preguntas realizadas:</span>
                <span className="text-slate-100">{suspectStats[selectedSuspect]?.questionsAsked || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inconsistencias detectadas:</span>
                <span
                  className={suspectStats[selectedSuspect]?.inconsistencies > 0 ? "text-red-400" : "text-green-400"}
                >
                  {suspectStats[selectedSuspect]?.inconsistencies || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nivel de sospecha:</span>
                <div className="w-24 bg-slate-800 rounded h-2">
                  <div
                    className={`h-2 rounded transition-all ${
                      (suspectStats[selectedSuspect]?.suspicionLevel || 0) > 0.7
                        ? "bg-gray-600"
                        : (suspectStats[selectedSuspect]?.suspicionLevel || 0) > 0.4
                          ? "bg-gray-400"
                          : "bg-white text-black"
                    }`}
                    style={{
                      width: `${((suspectStats[selectedSuspect]?.suspicionLevel || 0) * 100).toFixed(0)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="bg-slate-950 rounded p-4 h-96 overflow-y-auto mb-4 space-y-3 border border-slate-800">
          {messages.length === 0 ? (
            <div className="text-slate-500 text-center py-8">
              <p className="mb-2">Selecciona un sospechoso e inicia el interrogatorio...</p>
              <p className="text-xs">Haz preguntas estratégicas para detectar mentiras.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded ${
                    msg.role === "user"
                      ? "bg-amber-600 text-white rounded-br-none"
                      : "bg-slate-800 text-slate-100 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.role === "assistant" && msg.confidence !== undefined && (
                    <p className="text-xs mt-1 opacity-70">Confianza: {(msg.confidence * 100).toFixed(0)}%</p>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-100 px-4 py-2 rounded rounded-bl-none flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Respondiendo...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        <div className="mb-4 p-3 bg-slate-800 border border-slate-700 rounded">
          <p className="text-xs text-slate-400 mb-2 uppercase">Preguntas sugeridas</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "¿Dónde estabas en el momento del crimen?",
              "¿Conocías a la víctima?",
              "¿Alguien puede confirmar tu coartada?",
              "¿Qué sabes sobre los otros sospechosos?",
            ].map((q, idx) => (
              <Button
                key={idx}
                onClick={() => setInput(q)}
                variant="outline"
                size="sm"
                className="text-xs border-slate-600 hover:bg-slate-700 justify-start h-auto py-2 px-2"
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendQuestion()}
            placeholder="Haz una pregunta..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-600"
            disabled={loading}
          />
          <Button
            onClick={handleSendQuestion}
            disabled={loading || !input.trim()}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Preguntar
          </Button>
        </div>
      </Card>
    </div>
  )
}
