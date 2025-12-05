"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Trophy, Star, Clock, MessageSquare, Lightbulb,
    Target, CheckCircle, XCircle, Award, Share2
} from "lucide-react"
import type { CaseGrade, CaseResult } from "@/lib/game-types"
import { calculateGrade } from "@/lib/game-types"

interface CaseReportProps {
    caseData: any
    result: {
        wasCorrect: boolean
        timeSpent: number
        questionsAsked: number
        hintsUsed: number
        minigamesCompleted: number
        accusedSuspect: number
    }
    onContinue: () => void
    onPlayAgain: () => void
}

export function CaseReport({ caseData, result, onContinue, onPlayAgain }: CaseReportProps) {
    const [showDetails, setShowDetails] = useState(false)
    const [animatedScore, setAnimatedScore] = useState(0)

    // Calculate grade
    const grade = calculateGrade({
        correctAccusation: result.wasCorrect,
        timeSpent: result.timeSpent,
        questionsAsked: result.questionsAsked,
        hintsUsed: result.hintsUsed,
        minigamesCompleted: result.minigamesCompleted
    })

    // Animate score
    useEffect(() => {
        const targetScore = getScoreFromGrade(grade)
        const increment = targetScore / 30
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= targetScore) {
                setAnimatedScore(targetScore)
                clearInterval(timer)
            } else {
                setAnimatedScore(Math.floor(current))
            }
        }, 50)

        return () => clearInterval(timer)
    }, [grade])

    const getScoreFromGrade = (g: CaseGrade): number => {
        const scores: Record<CaseGrade, number> = {
            'S': 100, 'A': 90, 'B': 75, 'C': 60, 'D': 45, 'F': 25
        }
        return scores[g]
    }

    const getGradeColor = (g: CaseGrade): string => {
        const colors: Record<CaseGrade, string> = {
            'S': 'text-yellow-400',
            'A': 'text-green-400',
            'B': 'text-blue-400',
            'C': 'text-amber-400',
            'D': 'text-orange-400',
            'F': 'text-red-400'
        }
        return colors[g]
    }

    const getGradeBg = (g: CaseGrade): string => {
        const colors: Record<CaseGrade, string> = {
            'S': 'from-yellow-600/30 to-yellow-800/30 border-yellow-500',
            'A': 'from-green-600/30 to-green-800/30 border-green-500',
            'B': 'from-blue-600/30 to-blue-800/30 border-blue-500',
            'C': 'from-amber-600/30 to-amber-800/30 border-amber-500',
            'D': 'from-orange-600/30 to-orange-800/30 border-orange-500',
            'F': 'from-red-600/30 to-red-800/30 border-red-500'
        }
        return colors[g]
    }

    const getGradeMessage = (g: CaseGrade): string => {
        const messages: Record<CaseGrade, string> = {
            'S': '¡DETECTIVE LEGENDARIO! Resolución perfecta del caso.',
            'A': '¡EXCELENTE! Trabajo de detective de primera clase.',
            'B': '¡BUEN TRABAJO! Caso resuelto con competencia.',
            'C': 'CASO CERRADO. Hay margen de mejora.',
            'D': 'RESOLUCIÓN PARCIAL. Necesitas más práctica.',
            'F': 'CASO FALLIDO. El culpable escapó.'
        }
        return messages[g]
    }

    const formatTime = (ms: number): string => {
        const seconds = Math.floor(ms / 1000)
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const calculateXP = (): number => {
        let xp = 50 // base
        if (result.wasCorrect) xp += 50
        xp += result.minigamesCompleted * 15
        if (result.hintsUsed === 0) xp += 25
        if (result.timeSpent < 600000) xp += 20 // Under 10 min
        xp *= getScoreFromGrade(grade) / 100
        return Math.round(xp)
    }

    const culprit = caseData.suspects?.[caseData.culprit]
    const accused = caseData.suspects?.[result.accusedSuspect]

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center">
            <Card className={`max-w-2xl w-full bg-gradient-to-b ${getGradeBg(grade)} border-2 p-8`}>
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        {result.wasCorrect ? (
                            <div className="w-20 h-20 rounded-full bg-green-600/30 flex items-center justify-center">
                                <CheckCircle className="h-12 w-12 text-green-400" />
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-red-600/30 flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-red-400" />
                            </div>
                        )}
                    </div>

                    <h1 className={`text-4xl font-bold mb-2 ${result.wasCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {result.wasCorrect ? '¡CASO RESUELTO!' : 'CASO CERRADO'}
                    </h1>
                    <p className="text-slate-300">{caseData.title}</p>
                </div>

                {/* Grade Display */}
                <div className="flex justify-center mb-8">
                    <div className="text-center">
                        <div className={`text-8xl font-bold ${getGradeColor(grade)} mb-2`}>
                            {grade}
                        </div>
                        <p className="text-slate-400 text-sm">{getGradeMessage(grade)}</p>
                    </div>
                </div>

                {/* Score Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Puntuación</span>
                        <span className={`font-bold ${getGradeColor(grade)}`}>{animatedScore}%</span>
                    </div>
                    <Progress value={animatedScore} className="h-3 bg-slate-800" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <Clock className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                        <div className="text-xl font-bold text-slate-100">{formatTime(result.timeSpent)}</div>
                        <div className="text-xs text-slate-500">Tiempo</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <MessageSquare className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                        <div className="text-xl font-bold text-slate-100">{result.questionsAsked}</div>
                        <div className="text-xs text-slate-500">Preguntas</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <Lightbulb className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                        <div className="text-xl font-bold text-slate-100">{result.hintsUsed}</div>
                        <div className="text-xs text-slate-500">Pistas</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                        <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                        <div className="text-xl font-bold text-slate-100">{result.minigamesCompleted}</div>
                        <div className="text-xs text-slate-500">Minijuegos</div>
                    </div>
                </div>

                {/* XP Gained */}
                <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Star className="h-8 w-8 text-amber-400" />
                        <div>
                            <span className="text-amber-300 font-semibold">Experiencia Ganada</span>
                            <p className="text-xs text-amber-400/70">Subir de nivel desbloquea habilidades</p>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-amber-400">+{calculateXP()} XP</div>
                </div>

                {/* Case Summary */}
                <div className="bg-slate-800/30 rounded-lg p-4 mb-8">
                    <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase">Resumen del Caso</h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Culpable real:</span>
                            <span className="text-slate-200 font-semibold">{culprit?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Tu acusación:</span>
                            <span className={result.wasCorrect ? 'text-green-400' : 'text-red-400'}>
                                {accused?.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Motivo:</span>
                            <span className="text-slate-200">{culprit?.motive?.substring(0, 50)}...</span>
                        </div>
                    </div>
                </div>

                {/* Achievements (if any unlocked) */}
                {(result.hintsUsed === 0 || result.wasCorrect) && (
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Logros Desbloqueados
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {result.wasCorrect && (
                                <Badge className="bg-green-600">🎯 Caso Resuelto</Badge>
                            )}
                            {result.hintsUsed === 0 && (
                                <Badge className="bg-purple-600">🧠 Intuición Pura</Badge>
                            )}
                            {result.timeSpent < 300000 && (
                                <Badge className="bg-blue-600">⚡ Velocidad</Badge>
                            )}
                            {result.minigamesCompleted >= 3 && (
                                <Badge className="bg-amber-600">🎮 Maestro de Minijuegos</Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        onClick={onPlayAgain}
                        variant="outline"
                        className="flex-1 border-slate-600 hover:bg-slate-800"
                    >
                        Nuevo Caso
                    </Button>
                    <Button
                        onClick={onContinue}
                        className="flex-1 bg-amber-600 hover:bg-amber-700"
                    >
                        <Trophy className="mr-2 h-4 w-4" />
                        Continuar Campaña
                    </Button>
                </div>
            </Card>
        </div>
    )
}
