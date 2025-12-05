"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface MemoryGameProps {
    caseData: any
}

interface MemoryQuestion {
    question: string
    correctAnswer: string
    options: string[]
    category: 'victim' | 'suspect' | 'evidence' | 'timeline' | 'location'
}

export function MemoryGame({ caseData }: MemoryGameProps) {
    const [phase, setPhase] = useState<'study' | 'quiz' | 'results'>('study')
    const [studyTime, setStudyTime] = useState(60) // 60 seconds to study
    const [questions, setQuestions] = useState<MemoryQuestion[]>([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<(string | null)[]>([])
    const [score, setScore] = useState(0)
    const [loading, setLoading] = useState(false)

    // Generate questions from case data
    useEffect(() => {
        const generateQuestions = () => {
            const qs: MemoryQuestion[] = []

            // Questions about suspects
            if (caseData.suspects) {
                caseData.suspects.forEach((suspect: any, idx: number) => {
                    qs.push({
                        question: `¿Cuál es el rol/ocupación de ${suspect.name}?`,
                        correctAnswer: suspect.role,
                        options: shuffleArray([
                            suspect.role,
                            ...caseData.suspects.filter((_: any, i: number) => i !== idx).slice(0, 3).map((s: any) => s.role)
                        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)),
                        category: 'suspect'
                    })

                    if (suspect.alibi) {
                        qs.push({
                            question: `¿Cuál era la coartada de ${suspect.name}?`,
                            correctAnswer: suspect.alibi,
                            options: shuffleArray([
                                suspect.alibi,
                                ...caseData.suspects.filter((_: any, i: number) => i !== idx).slice(0, 3).map((s: any) => s.alibi)
                            ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)),
                            category: 'suspect'
                        })
                    }
                })
            }

            // Questions about evidence
            if (caseData.evidence) {
                caseData.evidence.slice(0, 3).forEach((ev: any) => {
                    qs.push({
                        question: `¿Qué descripción corresponde a "${ev.name}"?`,
                        correctAnswer: ev.description,
                        options: shuffleArray([
                            ev.description,
                            ...caseData.evidence.filter((e: any) => e.name !== ev.name).slice(0, 3).map((e: any) => e.description)
                        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)),
                        category: 'evidence'
                    })
                })
            }

            // Question about location
            if (caseData.location) {
                qs.push({
                    question: '¿Dónde ocurrió el crimen?',
                    correctAnswer: caseData.location,
                    options: shuffleArray([
                        caseData.location,
                        'Un almacén abandonado',
                        'La mansión del alcalde',
                        'El puerto industrial'
                    ]),
                    category: 'location'
                })
            }

            // Question about case title
            qs.push({
                question: '¿Cuál es el título de este caso?',
                correctAnswer: caseData.title,
                options: shuffleArray([
                    caseData.title,
                    'El Misterio del Diamante',
                    'Muerte en el Río',
                    'La Última Cena'
                ]),
                category: 'victim'
            })

            // Limit to 8 questions and shuffle
            setQuestions(shuffleArray(qs).slice(0, 8))
            setAnswers(new Array(8).fill(null))
        }

        generateQuestions()
    }, [caseData])

    // Study timer countdown
    useEffect(() => {
        if (phase === 'study' && studyTime > 0) {
            const timer = setInterval(() => {
                setStudyTime(t => t - 1)
            }, 1000)
            return () => clearInterval(timer)
        } else if (phase === 'study' && studyTime === 0) {
            setPhase('quiz')
        }
    }, [phase, studyTime])

    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array]
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
        }
        return newArray
    }

    const handleAnswer = (answer: string) => {
        const newAnswers = [...answers]
        newAnswers[currentQuestion] = answer
        setAnswers(newAnswers)

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        } else {
            // Calculate score
            let correct = 0
            questions.forEach((q, idx) => {
                if (newAnswers[idx] === q.correctAnswer) correct++
            })
            setScore(correct)
            setPhase('results')
        }
    }

    const handleRestart = () => {
        setPhase('study')
        setStudyTime(60)
        setCurrentQuestion(0)
        setAnswers(new Array(8).fill(null))
        setScore(0)
    }

    // Study Phase
    if (phase === 'study') {
        return (
            <Card className="bg-slate-900 border-slate-700 p-6">
                <div className="text-center mb-6">
                    <Brain className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-amber-500 mb-2">DESAFÍO DE MEMORIA</h2>
                    <p className="text-slate-400">Memoriza los detalles del caso. Serás evaluado después.</p>
                </div>

                {/* Timer */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Tiempo de estudio</span>
                        <span className={`font-mono font-bold ${studyTime <= 10 ? 'text-red-400' : 'text-amber-400'}`}>
                            {studyTime}s
                        </span>
                    </div>
                    <Progress value={(studyTime / 60) * 100} className="h-2 bg-slate-800" />
                </div>

                {/* Case Info to Memorize */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Case Title & Location */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
                        <h3 className="text-amber-400 font-semibold mb-2">📋 Información del Caso</h3>
                        <p className="text-slate-300 text-sm"><strong>Título:</strong> {caseData.title}</p>
                        <p className="text-slate-300 text-sm"><strong>Ubicación:</strong> {caseData.location}</p>
                        <p className="text-slate-300 text-sm mt-2">{caseData.description}</p>
                    </div>

                    {/* Suspects */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
                        <h3 className="text-amber-400 font-semibold mb-2">👥 Sospechosos</h3>
                        <div className="space-y-2">
                            {caseData.suspects?.map((suspect: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                    <p className="text-slate-200"><strong>{suspect.name}</strong> - {suspect.role}</p>
                                    <p className="text-slate-400 text-xs">Coartada: {suspect.alibi}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Evidence */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded p-4">
                        <h3 className="text-amber-400 font-semibold mb-2">🔍 Evidencia</h3>
                        <div className="space-y-2">
                            {caseData.evidence?.slice(0, 4).map((ev: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                    <p className="text-slate-200"><strong>{ev.name}</strong></p>
                                    <p className="text-slate-400 text-xs">{ev.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setPhase('quiz')}
                    className="w-full mt-6 bg-amber-600 hover:bg-amber-700"
                >
                    Comenzar Evaluación
                </Button>
            </Card>
        )
    }

    // Quiz Phase
    if (phase === 'quiz' && questions.length > 0) {
        const question = questions[currentQuestion]

        return (
            <Card className="bg-slate-900 border-slate-700 p-6">
                <div className="flex justify-between items-center mb-6">
                    <Badge variant="outline" className="border-amber-600 text-amber-400">
                        Pregunta {currentQuestion + 1} / {questions.length}
                    </Badge>
                    <Badge className={`${question.category === 'suspect' ? 'bg-red-600' :
                            question.category === 'evidence' ? 'bg-blue-600' :
                                question.category === 'location' ? 'bg-green-600' : 'bg-purple-600'
                        }`}>
                        {question.category === 'suspect' && '👥 Sospechoso'}
                        {question.category === 'evidence' && '🔍 Evidencia'}
                        {question.category === 'location' && '📍 Ubicación'}
                        {question.category === 'victim' && '📋 Caso'}
                        {question.category === 'timeline' && '⏰ Timeline'}
                    </Badge>
                </div>

                <Progress
                    value={((currentQuestion + 1) / questions.length) * 100}
                    className="h-2 mb-6 bg-slate-800"
                />

                <h3 className="text-xl text-slate-100 mb-6">{question.question}</h3>

                <div className="space-y-3">
                    {question.options.map((option, idx) => (
                        <Button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-3 px-4 border-slate-700 hover:border-amber-600 hover:bg-slate-800"
                        >
                            <span className="mr-3 text-amber-500">{String.fromCharCode(65 + idx)}.</span>
                            <span className="text-slate-200 whitespace-normal">{option}</span>
                        </Button>
                    ))}
                </div>
            </Card>
        )
    }

    // Results Phase
    if (phase === 'results') {
        const percentage = (score / questions.length) * 100

        return (
            <Card className="bg-slate-900 border-slate-700 p-6">
                <div className="text-center mb-6">
                    {percentage >= 80 ? (
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-3" />
                    ) : percentage >= 50 ? (
                        <Brain className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                    ) : (
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-3" />
                    )}

                    <h2 className="text-2xl font-bold text-slate-100 mb-2">
                        {percentage >= 80 ? '¡Memoria Excelente!' :
                            percentage >= 50 ? 'Buena Memoria' :
                                'Necesitas Practicar'}
                    </h2>

                    <div className="text-5xl font-bold text-amber-500 mb-2">
                        {score} / {questions.length}
                    </div>
                    <p className="text-slate-400">{percentage.toFixed(0)}% correcto</p>
                </div>

                {/* Answer Review */}
                <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                    {questions.map((q, idx) => {
                        const isCorrect = answers[idx] === q.correctAnswer
                        return (
                            <div
                                key={idx}
                                className={`p-3 rounded border ${isCorrect ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
                                    }`}
                            >
                                <p className="text-sm text-slate-300 mb-1">{q.question}</p>
                                <p className={`text-xs ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCorrect ? '✓ Correcto' : `✗ Tu respuesta: ${answers[idx]}`}
                                </p>
                                {!isCorrect && (
                                    <p className="text-xs text-slate-500">Respuesta correcta: {q.correctAnswer}</p>
                                )}
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

    return null
}
