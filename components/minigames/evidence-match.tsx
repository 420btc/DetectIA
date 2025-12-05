"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Link2, CheckCircle, XCircle, RotateCcw, HelpCircle } from "lucide-react"

interface EvidenceMatchProps {
    caseData: any
}

interface Connection {
    evidenceId: number
    suspectId: number
}

export function EvidenceMatch({ caseData }: EvidenceMatchProps) {
    const [connections, setConnections] = useState<Connection[]>([])
    const [selectedEvidence, setSelectedEvidence] = useState<number | null>(null)
    const [phase, setPhase] = useState<'playing' | 'results'>('playing')
    const [score, setScore] = useState(0)
    const [showHint, setShowHint] = useState(false)

    // Get correct connections from case data
    const getCorrectConnections = () => {
        const correct: Connection[] = []
        if (caseData.evidence) {
            caseData.evidence.forEach((ev: any, evIdx: number) => {
                if (ev.linkedTo && ev.linkedTo.length > 0) {
                    ev.linkedTo.forEach((suspectIdx: number) => {
                        correct.push({ evidenceId: evIdx, suspectId: suspectIdx })
                    })
                }
            })
        }
        return correct
    }

    const handleEvidenceClick = (evIdx: number) => {
        if (phase !== 'playing') return
        setSelectedEvidence(selectedEvidence === evIdx ? null : evIdx)
    }

    const handleSuspectClick = (suspectIdx: number) => {
        if (phase !== 'playing' || selectedEvidence === null) return

        // Toggle connection
        const existingIndex = connections.findIndex(
            c => c.evidenceId === selectedEvidence && c.suspectId === suspectIdx
        )

        if (existingIndex >= 0) {
            // Remove connection
            setConnections(connections.filter((_, i) => i !== existingIndex))
        } else {
            // Add connection
            setConnections([...connections, { evidenceId: selectedEvidence, suspectId: suspectIdx }])
        }
    }

    const isConnected = (evIdx: number, suspIdx: number) => {
        return connections.some(c => c.evidenceId === evIdx && c.suspectId === suspIdx)
    }

    const checkAnswers = () => {
        const correct = getCorrectConnections()
        let correctCount = 0

        // Check how many user connections are correct
        connections.forEach(conn => {
            if (correct.some(c => c.evidenceId === conn.evidenceId && c.suspectId === conn.suspectId)) {
                correctCount++
            }
        })

        // Penalize for missing connections  
        const maxScore = correct.length
        const accuracy = correctCount / Math.max(connections.length, correct.length)

        setScore(Math.round(accuracy * 100))
        setPhase('results')
    }

    const handleRestart = () => {
        setConnections([])
        setSelectedEvidence(null)
        setPhase('playing')
        setScore(0)
        setShowHint(false)
    }

    // Results Phase
    if (phase === 'results') {
        const correctConnections = getCorrectConnections()

        return (
            <Card className="bg-slate-900 border-slate-700 p-6">
                <div className="text-center mb-6">
                    {score >= 80 ? (
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
                    ) : score >= 50 ? (
                        <Link2 className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                    ) : (
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-3" />
                    )}

                    <h2 className="text-2xl font-bold text-slate-100 mb-2">
                        {score >= 80 ? '¡Conexiones Perfectas!' :
                            score >= 50 ? 'Buen Análisis' :
                                'Revisa la Evidencia'}
                    </h2>

                    <div className="text-5xl font-bold text-amber-500 mb-2">
                        {score}%
                    </div>
                    <p className="text-slate-400">Precisión en las conexiones</p>
                </div>

                {/* Correct Connections */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">CONEXIONES CORRECTAS:</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {correctConnections.map((conn, idx) => {
                            const evidence = caseData.evidence?.[conn.evidenceId]
                            const suspect = caseData.suspects?.[conn.suspectId]
                            const userFound = connections.some(
                                c => c.evidenceId === conn.evidenceId && c.suspectId === conn.suspectId
                            )

                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-2 p-2 rounded border ${userFound ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
                                        }`}
                                >
                                    <Badge variant="outline" className="text-xs border-amber-600 text-amber-400">
                                        {evidence?.name || `Evidencia ${conn.evidenceId + 1}`}
                                    </Badge>
                                    <Link2 className="h-4 w-4 text-slate-500" />
                                    <Badge className="bg-slate-700 text-xs">
                                        {suspect?.name || `Sospechoso ${conn.suspectId + 1}`}
                                    </Badge>
                                    {userFound ? (
                                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-500 ml-auto" />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <Button
                    onClick={handleRestart}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Intentar de Nuevo
                </Button>
            </Card>
        )
    }

    // Playing Phase
    return (
        <Card className="bg-slate-900 border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-amber-500">CONEXIÓN DE EVIDENCIA</h2>
                    <p className="text-sm text-slate-400">Conecta las evidencias con los sospechosos</p>
                </div>
                <Button
                    onClick={() => setShowHint(!showHint)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-amber-400"
                >
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </div>

            {showHint && (
                <div className="bg-amber-900/20 border border-amber-700/50 rounded p-3 mb-4 text-sm text-amber-200">
                    💡 Selecciona una evidencia y luego haz clic en los sospechosos que crees que están vinculados a ella.
                </div>
            )}

            {/* Connections Counter */}
            <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-slate-400">Conexiones realizadas:</span>
                <Badge variant="outline" className="border-amber-600 text-amber-400">
                    {connections.length}
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Evidence Column */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase">Evidencias</h3>
                    <div className="space-y-2">
                        {caseData.evidence?.slice(0, 5).map((ev: any, idx: number) => {
                            const isSelected = selectedEvidence === idx
                            const hasConnections = connections.some(c => c.evidenceId === idx)

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleEvidenceClick(idx)}
                                    className={`p-3 rounded border cursor-pointer transition-all ${isSelected
                                            ? 'bg-amber-600/20 border-amber-500 ring-2 ring-amber-500/50'
                                            : hasConnections
                                                ? 'bg-green-900/20 border-green-700 hover:border-green-600'
                                                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                        }`}
                                >
                                    <p className="text-sm font-semibold text-slate-200">{ev.name}</p>
                                    <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
                                    {hasConnections && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {connections
                                                .filter(c => c.evidenceId === idx)
                                                .map((c, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs border-green-600 text-green-400">
                                                        → {caseData.suspects?.[c.suspectId]?.name?.split(' ')[0]}
                                                    </Badge>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Suspects Column */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase">Sospechosos</h3>
                    <div className="space-y-2">
                        {caseData.suspects?.map((suspect: any, idx: number) => {
                            const connected = selectedEvidence !== null && isConnected(selectedEvidence, idx)
                            const hasAnyConnection = connections.some(c => c.suspectId === idx)

                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSuspectClick(idx)}
                                    className={`p-3 rounded border cursor-pointer transition-all ${connected
                                            ? 'bg-green-600/20 border-green-500'
                                            : selectedEvidence !== null
                                                ? 'bg-slate-800/80 border-slate-600 hover:border-amber-500'
                                                : hasAnyConnection
                                                    ? 'bg-blue-900/20 border-blue-700'
                                                    : 'bg-slate-800/50 border-slate-700'
                                        } ${selectedEvidence === null ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm">
                                            👤
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">{suspect.name}</p>
                                            <p className="text-xs text-slate-500">{suspect.role}</p>
                                        </div>
                                        {connected && <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
                <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="flex-1 border-slate-600 hover:bg-slate-800"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                </Button>
                <Button
                    onClick={checkAnswers}
                    disabled={connections.length === 0}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verificar
                </Button>
            </div>
        </Card>
    )
}
