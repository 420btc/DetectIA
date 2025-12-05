"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Trophy, Star, Target, Award, BarChart3,
    Clock, MessageSquare, Lightbulb, TrendingUp,
    Medal, Crown
} from "lucide-react"
import type { GameState, CaseResult, CaseGrade } from "@/lib/game-types"
import { getAchievementDetails } from "@/lib/campaign-system"

interface StatsDashboardProps {
    gameState: GameState
}

export function StatsDashboard({ gameState }: StatsDashboardProps) {
    const { detective, caseHistory, campaign } = gameState

    // Calculate statistics
    const totalTime = caseHistory.reduce((acc, c) => acc + c.timeSpent, 0)
    const avgTime = caseHistory.length > 0 ? totalTime / caseHistory.length : 0
    const totalQuestions = caseHistory.reduce((acc, c) => acc + c.questionsAsked, 0)
    const totalHints = caseHistory.reduce((acc, c) => acc + c.hintsUsed, 0)
    const totalMinigames = caseHistory.reduce((acc, c) => acc + c.minigamesCompleted, 0)
    const winRate = detective.casesCompleted > 0
        ? Math.round((detective.casesWon / detective.casesCompleted) * 100)
        : 0

    // Grade distribution
    const gradeDistribution = caseHistory.reduce((acc, c) => {
        acc[c.grade] = (acc[c.grade] || 0) + 1
        return acc
    }, {} as Record<CaseGrade, number>)

    const formatTime = (ms: number): string => {
        const minutes = Math.floor(ms / 60000)
        const hours = Math.floor(minutes / 60)
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`
        }
        return `${minutes}m`
    }

    const getGradeColor = (grade: CaseGrade): string => {
        const colors: Record<CaseGrade, string> = {
            'S': 'bg-yellow-500',
            'A': 'bg-green-500',
            'B': 'bg-blue-500',
            'C': 'bg-amber-500',
            'D': 'bg-orange-500',
            'F': 'bg-red-500'
        }
        return colors[grade] || 'bg-slate-500'
    }

    return (
        <Card className="bg-slate-900 border-slate-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-bold text-amber-500">ESTADÍSTICAS</h2>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<Trophy className="h-6 w-6 text-amber-500" />}
                    label="Casos Resueltos"
                    value={detective.casesWon}
                    subtext={`de ${detective.casesCompleted} total`}
                />
                <StatCard
                    icon={<Target className="h-6 w-6 text-green-500" />}
                    label="Tasa de Éxito"
                    value={`${winRate}%`}
                    subtext="acusaciones correctas"
                />
                <StatCard
                    icon={<Star className="h-6 w-6 text-yellow-500" />}
                    label="Experiencia"
                    value={detective.experience}
                    subtext={`Nivel ${detective.level}`}
                />
                <StatCard
                    icon={<Award className="h-6 w-6 text-purple-500" />}
                    label="Logros"
                    value={detective.achievements.length}
                    subtext="desbloqueados"
                />
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Time & Activity Stats */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase">Actividad</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-blue-400" />
                                <span className="text-sm text-slate-300">Tiempo Total</span>
                            </div>
                            <span className="font-semibold text-slate-200">{formatTime(totalTime)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                                <span className="text-sm text-slate-300">Tiempo Promedio</span>
                            </div>
                            <span className="font-semibold text-slate-200">{formatTime(avgTime)}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-purple-400" />
                                <span className="text-sm text-slate-300">Preguntas Realizadas</span>
                            </div>
                            <span className="font-semibold text-slate-200">{totalQuestions}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                            <div className="flex items-center gap-3">
                                <Lightbulb className="h-5 w-5 text-yellow-400" />
                                <span className="text-sm text-slate-300">Pistas Usadas</span>
                            </div>
                            <span className="font-semibold text-slate-200">{totalHints}</span>
                        </div>
                    </div>
                </div>

                {/* Grade Distribution */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase">Distribución de Calificaciones</h3>

                    {caseHistory.length > 0 ? (
                        <div className="space-y-2">
                            {(['S', 'A', 'B', 'C', 'D', 'F'] as CaseGrade[]).map((grade) => {
                                const count = gradeDistribution[grade] || 0
                                const percentage = (count / caseHistory.length) * 100

                                return (
                                    <div key={grade} className="flex items-center gap-3">
                                        <Badge className={`${getGradeColor(grade)} w-8 justify-center`}>
                                            {grade}
                                        </Badge>
                                        <div className="flex-1">
                                            <Progress
                                                value={percentage}
                                                className="h-2 bg-slate-800"
                                            />
                                        </div>
                                        <span className="text-sm text-slate-400 w-12 text-right">
                                            {count}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">
                            Completa casos para ver estadísticas
                        </p>
                    )}
                </div>
            </div>

            {/* Skills Progress */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Habilidades</h3>
                <div className="grid grid-cols-2 gap-4">
                    <SkillBar name="Percepción" value={detective.skills.perception} icon="👁️" />
                    <SkillBar name="Persuasión" value={detective.skills.persuasion} icon="💬" />
                    <SkillBar name="Lógica" value={detective.skills.logic} icon="🧠" />
                    <SkillBar name="Investigación" value={detective.skills.investigation} icon="🔍" />
                </div>
            </div>

            {/* Achievements */}
            <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">
                    Logros ({detective.achievements.length})
                </h3>
                {detective.achievements.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {detective.achievements.map((achievementId) => {
                            const achievement = getAchievementDetails(achievementId)
                            return (
                                <div
                                    key={achievementId}
                                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded border border-slate-700"
                                >
                                    <span className="text-2xl">{achievement.icon}</span>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-200">{achievement.name}</p>
                                        <p className="text-xs text-slate-500">{achievement.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                        Aún no has desbloqueado ningún logro
                    </p>
                )}
            </div>
        </Card>
    )
}

function StatCard({ icon, label, value, subtext }: {
    icon: React.ReactNode
    label: string
    value: string | number
    subtext: string
}) {
    return (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs text-slate-400 uppercase">{label}</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">{value}</div>
            <div className="text-xs text-slate-500">{subtext}</div>
        </div>
    )
}

function SkillBar({ name, value, icon }: { name: string; value: number; icon: string }) {
    const maxSkill = 10
    const percentage = (value / maxSkill) * 100

    return (
        <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="text-sm text-slate-300">{name}</span>
                </div>
                <span className="text-sm font-bold text-amber-400">{value}/{maxSkill}</span>
            </div>
            <Progress value={percentage} className="h-2 bg-slate-700" />
        </div>
    )
}
