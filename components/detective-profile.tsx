"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { DetectiveProfile } from "@/lib/game-types"
import { getRankForLevel, LEVEL_THRESHOLDS } from "@/lib/game-types"
import { Trophy, Star, Target, Brain, Eye, MessageSquare, Search } from "lucide-react"

interface DetectiveProfileCardProps {
    detective: DetectiveProfile
    compact?: boolean
}

export function DetectiveProfileCard({ detective, compact = false }: DetectiveProfileCardProps) {
    const nextLevelXP = LEVEL_THRESHOLDS[detective.level + 1] || detective.experience
    const currentLevelXP = LEVEL_THRESHOLDS[detective.level] || 0
    const progressToNextLevel = ((detective.experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

    if (compact) {
        return (
            <div className="flex items-center gap-3 bg-slate-900/80 rounded-lg px-4 py-2 border border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-lg">
                    🕵️
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100 text-sm">{detective.name}</span>
                        <Badge variant="outline" className="text-xs bg-amber-900/50 border-amber-600 text-amber-300">
                            Nv.{detective.level}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <Progress value={progressToNextLevel} className="h-1 flex-1 bg-slate-800" />
                        <span className="text-xs text-slate-500">{detective.experience} XP</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Card className="bg-slate-900/80 border-slate-700 p-6">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-5xl border-4 border-amber-500/30 mb-3">
                        🕵️
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">{detective.name}</h2>
                    <Badge className="mt-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white">
                        {detective.rank}
                    </Badge>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-4">
                    {/* Level & XP */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Nivel {detective.level}</span>
                            <span className="text-sm text-amber-400">{detective.experience} / {nextLevelXP} XP</span>
                        </div>
                        <Progress value={progressToNextLevel} className="h-3 bg-slate-800" />
                    </div>

                    {/* Case Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-100">{detective.casesWon}</div>
                            <div className="text-xs text-slate-500">Resueltos</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <Target className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-100">{detective.casesCompleted}</div>
                            <div className="text-xs text-slate-500">Total</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                            <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                            <div className="text-xl font-bold text-slate-100">{detective.achievements.length}</div>
                            <div className="text-xs text-slate-500">Logros</div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Habilidades</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <SkillBar icon={<Eye className="h-4 w-4" />} name="Percepción" value={detective.skills.perception} />
                            <SkillBar icon={<MessageSquare className="h-4 w-4" />} name="Persuasión" value={detective.skills.persuasion} />
                            <SkillBar icon={<Brain className="h-4 w-4" />} name="Lógica" value={detective.skills.logic} />
                            <SkillBar icon={<Search className="h-4 w-4" />} name="Investigación" value={detective.skills.investigation} />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function SkillBar({ icon, name, value }: { icon: React.ReactNode; name: string; value: number }) {
    const maxSkill = 10
    const percentage = (value / maxSkill) * 100

    return (
        <div className="bg-slate-800/50 rounded px-3 py-2">
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-slate-400">
                    {icon}
                    <span className="text-xs">{name}</span>
                </div>
                <span className="text-sm font-bold text-amber-400">{value}</span>
            </div>
            <div className="h-1 bg-slate-700 rounded">
                <div
                    className="h-1 bg-gradient-to-r from-amber-600 to-amber-400 rounded transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
