"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, RotateCcw, ArrowUp, ArrowDown } from "lucide-react"

interface TimelinePuzzleProps {
    caseData: any
}

interface TimelineEvent {
    id: string
    time: string
    description: string
    order: number
}

export function TimelinePuzzle({ caseData }: TimelinePuzzleProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [userOrder, setUserOrder] = useState<TimelineEvent[]>([])
    const [phase, setPhase] = useState<'playing' | 'results'>('playing')
    const [score, setScore] = useState(0)
    const [attempts, setAttempts] = useState(3)

    // Parse timeline from case data and create events
    useEffect(() => {
        const generateEvents = () => {
            // Create events from suspects and evidence
            const generatedEvents: TimelineEvent[] = []
            let order = 0

            // Add events based on case data
            if (caseData.suspects) {
                caseData.suspects.forEach((suspect: any, idx: number) => {
                    if (suspect.alibi) {
                        generatedEvents.push({
                            id: `suspect-${idx}`,
                            time: `Durante el crimen`,
                            description: `${suspect.name} afirma: "${suspect.alibi.substring(0, 80)}..."`,
                            order: order++
                        })
                    }
                })
            }

            // Add evidence discovery events
            if (caseData.evidence) {
                caseData.evidence.slice(0, 3).forEach((ev: any, idx: number) => {
                    generatedEvents.push({
                        id: `evidence-${idx}`,
                        time: `Descubrimiento`,
                        description: `Se encuentra ${ev.name.toLowerCase()}`,
                        order: order++
                    })
                })
            }

            // Add some generic timeline events
            generatedEvents.push({
                id: 'crime',
                time: 'Momento del crimen',
                description: `El crimen ocurre en ${caseData.location}`,
                order: -1 // This should be first
            })

            generatedEvents.push({
                id: 'discovery',
                time: 'Después',
                description: 'El cuerpo/crimen es descubierto',
                order: 100 // After crime
            })

            generatedEvents.push({
                id: 'investigation',
                time: 'Investigación',
                description: 'La policía llega a la escena',
                order: 101
            })

            // Normalize orders
            const sorted = generatedEvents.sort((a, b) => a.order - b.order)
            sorted.forEach((ev, idx) => ev.order = idx)

            setEvents(sorted)
            // Shuffle for user to solve
            setUserOrder(shuffleArray([...sorted]))
        }

        generateEvents()
    }, [caseData])

    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array]
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
        }
        return newArray
    }

    const moveEvent = (index: number, direction: 'up' | 'down') => {
        if (phase !== 'playing') return

        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= userOrder.length) return

        const newOrder = [...userOrder]
            ;[newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]]
        setUserOrder(newOrder)
    }

    const checkAnswer = () => {
        let correct = 0
        userOrder.forEach((event, idx) => {
            if (event.order === idx) correct++
        })

        setScore(correct)

        if (correct === events.length) {
            setPhase('results')
        } else {
            setAttempts(a => a - 1)
            if (attempts <= 1) {
                setPhase('results')
            }
        }
    }

    const handleRestart = () => {
        setUserOrder(shuffleArray([...events]))
        setPhase('playing')
        setScore(0)
        setAttempts(3)
    }

    // Results Phase
    if (phase === 'results') {
        const percentage = (score / events.length) * 100
        const perfect = score === events.length

        return (
            <Card className="bg-slate-900 border-slate-700 p-6">
                <div className="text-center mb-6">
                    {perfect ? (
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
                    ) : (
                        <Clock className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                    )}

                    <h2 className="text-2xl font-bold text-slate-100 mb-2">
                        {perfect ? '¡Cronología Perfecta!' : 'Puzzle Completado'}
                    </h2>

                    <div className="text-5xl font-bold text-amber-500 mb-2">
                        {score} / {events.length}
                    </div>
                    <p className="text-slate-400">{percentage.toFixed(0)}% en orden correcto</p>
                </div>

                {/* Show correct order */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3">ORDEN CORRECTO:</h3>
                    <div className="space-y-2">
                        {events.map((event, idx) => (
                            <div
                                key={event.id}
                                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded border border-slate-700"
                            >
                                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-200">{event.description}</p>
                                    <p className="text-xs text-slate-500">{event.time}</p>
                                </div>
                            </div>
                        ))}
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-amber-500">PUZZLE CRONOLÓGICO</h2>
                    <p className="text-sm text-slate-400">Ordena los eventos cronológicamente</p>
                </div>
                <Badge variant="outline" className={`border-slate-600 ${attempts <= 1 ? 'text-red-400 border-red-600' : 'text-slate-400'}`}>
                    {attempts} intentos restantes
                </Badge>
            </div>

            {/* Event List */}
            <div className="space-y-2 mb-6">
                {userOrder.map((event, idx) => (
                    <div
                        key={event.id}
                        className="flex items-center gap-2 p-3 bg-slate-800/50 rounded border border-slate-700 hover:border-slate-600 transition-all"
                    >
                        {/* Position Number */}
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-amber-400">
                            {idx + 1}
                        </div>

                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 truncate">{event.description}</p>
                            <p className="text-xs text-slate-500">{event.time}</p>
                        </div>

                        {/* Move Buttons */}
                        <div className="flex flex-col gap-1">
                            <Button
                                onClick={() => moveEvent(idx, 'up')}
                                disabled={idx === 0}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-amber-400 disabled:opacity-30"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => moveEvent(idx, 'down')}
                                disabled={idx === userOrder.length - 1}
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-slate-400 hover:text-amber-400 disabled:opacity-30"
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="flex-1 border-slate-600 hover:bg-slate-800"
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Mezclar
                </Button>
                <Button
                    onClick={checkAnswer}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verificar Orden
                </Button>
            </div>
        </Card>
    )
}
