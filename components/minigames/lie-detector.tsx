"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Shield, AlertTriangle, CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface LieDetectorProps {
    caseData: any
}

interface Statement {
    id: string
    suspectName: string
    text: string
    isLie: boolean
    explanation: string
}

export function LieDetector({ caseData }: LieDetectorProps) {
    const [statements, setStatements] = useState<Statement[]>([])
    const [currentStatement, setCurrentStatement] = useState(0)
    const [answers, setAnswers] = useState<(boolean | null)[]>([])
    const [phase, setPhase] = useState<'playing' | 'results'>('playing')
    const [score, setScore] = useState(0)
    const [loading, setLoading] = useState(false)
    const [showExplanation, setShowExplanation] = useState(false)

    // Generate statements from case data
    useEffect(() => {
        const generateStatements = () => {
            const generatedStatements: Statement[] = []

            if (caseData.suspects) {
                caseData.suspects.forEach((suspect: any, idx: number) => {
                    const isCulprit = idx === caseData.culprit

                    // Alibi statement
                    if (suspect.alibi) {
                        generatedStatements.push({
                            id: `alibi-${idx}`,
                            suspectName: suspect.name,
                            text: `"${suspect.alibi}"`,
                            isLie: isCulprit, // Culprit's alibi is a lie
                            explanation: isCulprit
                                ? `Esta coartada es falsa. ${suspect.name} no estuvo donde dice.`
                                : `Esta coartada parece ser verificable y consistente.`
                        })
                    }

                    // About their motive (suspicious if they deny)
                    generatedStatements.push({
                        id: `motive-${idx}`,
                        suspectName: suspect.name,
                        text: `"No tengo ningún motivo para haber cometido el crimen."`,
                        isLie: !!suspect.motive && isCulprit,
                        explanation: suspect.motive && isCulprit
                            ? `Mentira. Su motivo: ${suspect.motive}`
                            : `Aunque tiene un posible motivo (${suspect.motive}), no hay evidencia de que mintiera.`
                    })

                    // Knowledge statement
                    if (isCulprit) {
                        generatedStatements.push({
                            id: `knowledge-${idx}`,
                            suspectName: suspect.name,
                            text: `"No sé nada sobre cómo ocurrió exactamente el crimen."`,
                            isLie: true,
                            explanation: `Como culpable, ${suspect.name} conoce exactamente cómo ocurrió.`
                        })
                    }
                })

                // Add some truths from innocent suspects
                const innocent = caseData.suspects.find((_: any, i: number) => i !== caseData.culprit)
                if (innocent) {
                    generatedStatements.push({
                        id: 'innocent-truth',
                        suspectName: innocent.name,
                        text: `"Estoy cooperando plenamente con la investigación porque quiero que se descubra la verdad."`,
                        isLie: false,
                        explanation: `Esta declaración es consistente con el comportamiento de ${innocent.name}.`
                    })
                }
            }

            // Shuffle and limit
            const shuffled = generatedStatements.sort(() => Math.random() - 0.5).slice(0, 6)
            setStatements(shuffled)
            setAnswers(new Array(shuffled.length).fill(null))
        }

        generateStatements()
    }, [caseData])

    const handleAnswer = (isLie: boolean) => {
        const newAnswers = [...answers]
        newAnswers[currentStatement] = isLie
        setAnswers(newAnswers)
        setShowExplanation(true)
    }

    const handleNext = () => {
        setShowExplanation(false)
        if (currentStatement < statements.length - 1) {
            setCurrentStatement(currentStatement + 1)
        } else {
            // Calculate score
            let correct = 0
            statements.forEach((stmt, idx) => {
                if (answers[idx] === stmt.isLie) correct++
            })
            setScore(correct)
            setPhase('results')
        }
    }

    const handleRestart = () => {
        const shuffled = [...statements].sort(() => Math.random() - 0.5)
        setStatements(shuffled)
        setAnswers(new Array(shuffled.length).fill(null))
        setCurrentStatement(0)
        setPhase('playing')
        setScore(0)
        setShowExplanation(false)
    }

    // Results Phase
    if (phase === 'results') {
        const percentage = (score / statements.length) * 100

        return (
            <Card className="bg-slate-900 border-slate-700 p-6">
                <div className="text-center mb-6">
                    {percentage >= 80 ? (
                        <Shield className="h-16 w-16 text-green-500 mx-auto mb-3" />
                    ) : percentage >= 50 ? (
                        <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                    ) : (
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-3" />
                    )}

                    <h2 className="text-2xl font-bold text-slate-100 mb-2">
                        {percentage >= 80 ? '¡Detector de Mentiras Experto!' :
                            percentage >= 50 ? 'Buen Instinto' :
                                'Necesitas Entrenar Tu Instinto'}
                    </h2>

                    <div className="text-5xl font-bold text-amber-500 mb-2">
                        {score} / {statements.length}
                    </div>
                    <p className="text-slate-400">{percentage.toFixed(0)}% de precisión</p>
                </div>

                {/* Results Review */}
                <div className="space-y-3 mb-6 max-h-72 overflow-y-auto">
                    {statements.map((stmt, idx) => {
                        const wasCorrect = answers[idx] === stmt.isLie
                        return (
                            <div
                                key={stmt.id}
                                className={`p-3 rounded border ${wasCorrect ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <span className="text-sm font-semibold text-slate-300">{stmt.suspectName}</span>
                                    <Badge className={stmt.isLie ? 'bg-red-600' : 'bg-green-600'}>
                                        {stmt.isLie ? 'MENTIRA' : 'VERDAD'}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-400 italic mb-2">{stmt.text}</p>
                                <p className="text-xs text-slate-500">{stmt.explanation}</p>
                            </div>
                        )
                    })}
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
    if (statements.length === 0) {
        return (
            <Card className="bg-slate-900 border-slate-700 p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
            </Card>
        )
    }

    const statement = statements[currentStatement]
    const userAnswer = answers[currentStatement]
    const isCorrect = userAnswer === statement.isLie

    return (
        <Card className="bg-slate-900 border-slate-700 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-amber-500">DETECTOR DE MENTIRAS</h2>
                    <p className="text-sm text-slate-400">¿Verdad o mentira?</p>
                </div>
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                    {currentStatement + 1} / {statements.length}
                </Badge>
            </div>

            <Progress
                value={((currentStatement + 1) / statements.length) * 100}
                className="h-2 mb-6 bg-slate-800"
            />

            {/* Statement Card */}
            <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xl">
                        🗣️
                    </div>
                    <div>
                        <span className="font-semibold text-slate-200">{statement.suspectName}</span>
                        <p className="text-xs text-slate-500">Sospechoso</p>
                    </div>
                </div>

                <p className="text-lg text-slate-100 italic leading-relaxed">
                    {statement.text}
                </p>
            </div>

            {/* Explanation (after answering) */}
            {showExplanation && (
                <div className={`p-4 rounded-lg mb-6 border ${isCorrect ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
                    }`}>
                    <div className="flex items-center gap-2 mb-2">
                        {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                        </span>
                        <Badge className={statement.isLie ? 'bg-red-600 ml-auto' : 'bg-green-600 ml-auto'}>
                            Era {statement.isLie ? 'MENTIRA' : 'VERDAD'}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-300">{statement.explanation}</p>
                </div>
            )}

            {/* Action Buttons */}
            {!showExplanation ? (
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={() => handleAnswer(false)}
                        className="h-16 bg-green-700 hover:bg-green-600 text-lg font-bold"
                    >
                        <CheckCircle className="mr-2 h-6 w-6" />
                        VERDAD
                    </Button>
                    <Button
                        onClick={() => handleAnswer(true)}
                        className="h-16 bg-red-700 hover:bg-red-600 text-lg font-bold"
                    >
                        <XCircle className="mr-2 h-6 w-6" />
                        MENTIRA
                    </Button>
                </div>
            ) : (
                <Button
                    onClick={handleNext}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                >
                    {currentStatement < statements.length - 1 ? 'Siguiente Declaración' : 'Ver Resultados'}
                </Button>
            )}
        </Card>
    )
}
