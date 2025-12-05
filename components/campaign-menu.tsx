"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    CHAPTERS,
    getCurrentChapter,
    getChapterIntro,
    loadGameState,
    createInitialGameState,
    saveGameState
} from "@/lib/campaign-system"
import type { GameState, Chapter } from "@/lib/game-types"
import { Lock, Unlock, Star, Trophy, BookOpen } from "lucide-react"

interface CampaignMenuProps {
    onStartCase: (gameState: GameState, chapter: Chapter) => void
    onBack: () => void
}

export function CampaignMenu({ onStartCase, onBack }: CampaignMenuProps) {
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
    const [showIntro, setShowIntro] = useState(false)

    useEffect(() => {
        const saved = loadGameState()
        if (saved) {
            setGameState(saved)
        } else {
            const newState = createInitialGameState()
            setGameState(newState)
            saveGameState(newState)
        }
    }, [])

    const handleNewGame = () => {
        const newState = createInitialGameState()
        setGameState(newState)
        saveGameState(newState)
    }

    const handleSelectChapter = (chapter: Chapter) => {
        if (!chapter.isUnlocked && gameState) {
            // Check if should be unlocked based on progress
            const shouldBeUnlocked = gameState.campaign.chaptersCompleted.includes(chapter.number - 1) || chapter.number === 1
            if (!shouldBeUnlocked) return
        }
        setSelectedChapter(chapter)
        setShowIntro(true)
    }

    const handleStartChapter = () => {
        if (gameState && selectedChapter) {
            onStartCase(gameState, selectedChapter)
        }
    }

    if (!gameState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-amber-500 animate-pulse">Cargando...</div>
            </div>
        )
    }

    const { detective, campaign } = gameState
    const currentChapter = getCurrentChapter(gameState)

    // Chapter intro modal
    if (showIntro && selectedChapter) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 flex items-center justify-center">
                <Card className="max-w-2xl w-full bg-slate-900/95 border-amber-700/50 p-8">
                    <div className="text-center mb-6">
                        <div className="text-6xl mb-4">
                            {selectedChapter.number === 1 && "🔍"}
                            {selectedChapter.number === 2 && "🏢"}
                            {selectedChapter.number === 3 && "🕸️"}
                            {selectedChapter.number === 4 && "💀"}
                            {selectedChapter.number === 5 && "⚔️"}
                        </div>
                        <h2 className="text-2xl font-bold text-amber-500 mb-2">
                            Capítulo {selectedChapter.number}
                        </h2>
                        <h3 className="text-xl text-slate-200 mb-4">{selectedChapter.title}</h3>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                        <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                            {getChapterIntro(selectedChapter)}
                        </p>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <Button
                            onClick={() => setShowIntro(false)}
                            variant="outline"
                            className="border-slate-600 hover:bg-slate-800"
                        >
                            Volver
                        </Button>
                        <Button
                            onClick={handleStartChapter}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8"
                        >
                            Comenzar Caso
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header with Detective Profile */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-amber-500 mb-2">MODO CAMPAÑA</h1>
                        <p className="text-slate-400">Desentraña la conspiración de El Arquitecto</p>
                    </div>
                    <Button onClick={onBack} variant="outline" className="border-slate-600 hover:bg-slate-800">
                        Volver al Menú
                    </Button>
                </div>

                {/* Detective Profile Card */}
                <Card className="bg-slate-900/80 border-slate-700 p-6 mb-8">
                    <div className="flex flex-wrap md:flex-nowrap gap-6 items-center">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-4xl border-4 border-amber-500/30">
                            🕵️
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-slate-100">{detective.name}</h2>
                                <Badge variant="outline" className="bg-amber-900/50 border-amber-600 text-amber-300">
                                    {detective.rank}
                                </Badge>
                            </div>

                            {/* XP Bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Nivel {detective.level}</span>
                                    <span>{detective.experience} XP</span>
                                </div>
                                <Progress
                                    value={(detective.experience % 100) * 100 / 100}
                                    className="h-2 bg-slate-800"
                                />
                            </div>

                            {/* Stats Row */}
                            <div className="flex gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-amber-500" />
                                    <span className="text-slate-300">{detective.casesWon}/{detective.casesCompleted} casos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-amber-500" />
                                    <span className="text-slate-300">{detective.achievements.length} logros</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-amber-500" />
                                    <span className="text-slate-300">Cap. {campaign.currentChapter}</span>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-800 rounded px-3 py-2">
                                <span className="text-slate-400">👁️ Percepción</span>
                                <span className="text-amber-400 ml-2">{detective.skills.perception}</span>
                            </div>
                            <div className="bg-slate-800 rounded px-3 py-2">
                                <span className="text-slate-400">💬 Persuasión</span>
                                <span className="text-amber-400 ml-2">{detective.skills.persuasion}</span>
                            </div>
                            <div className="bg-slate-800 rounded px-3 py-2">
                                <span className="text-slate-400">🧠 Lógica</span>
                                <span className="text-amber-400 ml-2">{detective.skills.logic}</span>
                            </div>
                            <div className="bg-slate-800 rounded px-3 py-2">
                                <span className="text-slate-400">🔍 Investigación</span>
                                <span className="text-amber-400 ml-2">{detective.skills.investigation}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Mastermind Clues (if any) */}
                {campaign.mastermindCluesFound.length > 0 && (
                    <Card className="bg-red-950/30 border-red-900/50 p-4 mb-8">
                        <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                            <span>🎭</span> Pistas sobre El Arquitecto
                        </h3>
                        <ul className="space-y-1 text-sm text-red-200/80">
                            {campaign.mastermindCluesFound.map((clue, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>{clue}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {/* Chapters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {CHAPTERS.map((chapter) => {
                        const isCompleted = campaign.chaptersCompleted.includes(chapter.number)
                        const isCurrent = chapter.number === campaign.currentChapter
                        const isUnlocked = chapter.number <= campaign.currentChapter

                        return (
                            <Card
                                key={chapter.id}
                                onClick={() => isUnlocked && handleSelectChapter(chapter)}
                                className={`p-5 cursor-pointer transition-all duration-300 ${isCompleted
                                        ? "bg-green-950/30 border-green-700/50 hover:border-green-600"
                                        : isCurrent
                                            ? "bg-amber-950/30 border-amber-600/50 hover:border-amber-500 ring-2 ring-amber-600/20"
                                            : isUnlocked
                                                ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                                                : "bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">
                                            {chapter.number === 1 && "🔍"}
                                            {chapter.number === 2 && "🏢"}
                                            {chapter.number === 3 && "🕸️"}
                                            {chapter.number === 4 && "💀"}
                                            {chapter.number === 5 && "⚔️"}
                                        </span>
                                        <span className="text-xs text-slate-500 uppercase">
                                            Capítulo {chapter.number}
                                        </span>
                                    </div>
                                    {isCompleted ? (
                                        <Badge className="bg-green-600 text-green-100">✓ Completo</Badge>
                                    ) : isUnlocked ? (
                                        <Unlock className="h-5 w-5 text-amber-500" />
                                    ) : (
                                        <Lock className="h-5 w-5 text-slate-600" />
                                    )}
                                </div>

                                <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? "text-slate-100" : "text-slate-500"}`}>
                                    {chapter.title}
                                </h3>
                                <p className={`text-sm mb-3 ${isUnlocked ? "text-slate-400" : "text-slate-600"}`}>
                                    {chapter.description}
                                </p>

                                {/* Progress Bar for Current Chapter */}
                                {isCurrent && !isCompleted && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>Progreso</span>
                                            <span>{campaign.casesInChapter}/{chapter.casesRequired} casos</span>
                                        </div>
                                        <Progress
                                            value={(campaign.casesInChapter / chapter.casesRequired) * 100}
                                            className="h-2 bg-slate-800"
                                        />
                                    </div>
                                )}

                                {/* Theme Badge */}
                                <div className="mt-3">
                                    <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                                        {chapter.theme === 'passion' && '💔 Crimen Pasional'}
                                        {chapter.theme === 'corporate' && '💼 Corporativo'}
                                        {chapter.theme === 'organized' && '🎰 Crimen Organizado'}
                                        {chapter.theme === 'revenge' && '🔪 Venganza'}
                                        {chapter.theme === 'conspiracy' && '🕵️ Conspiración'}
                                    </Badge>
                                </div>
                            </Card>
                        )
                    })}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-center gap-4">
                    <Button
                        onClick={handleNewGame}
                        variant="outline"
                        className="border-red-800 text-red-400 hover:bg-red-950/50"
                    >
                        Nueva Partida
                    </Button>
                </div>
            </div>
        </div>
    )
}
