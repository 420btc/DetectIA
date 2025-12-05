"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    FileText, Bookmark, Clock, Users, MapPin,
    ChevronDown, ChevronUp, Save, StickyNote, AlertTriangle
} from "lucide-react"

interface CaseFileProps {
    caseData: any
    notes?: string
    onNotesChange?: (notes: string) => void
}

export function CaseFile({ caseData, notes = '', onNotesChange }: CaseFileProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('summary')
    const [localNotes, setLocalNotes] = useState(notes)

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    const handleSaveNotes = () => {
        onNotesChange?.(localNotes)
    }

    const Section = ({
        id,
        icon: Icon,
        title,
        badge,
        children
    }: {
        id: string
        icon: any
        title: string
        badge?: string
        children: React.ReactNode
    }) => {
        const isExpanded = expandedSection === id

        return (
            <div className="border border-slate-700 rounded-lg overflow-hidden">
                <button
                    onClick={() => toggleSection(id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition"
                >
                    <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold text-slate-200">{title}</span>
                        {badge && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                {badge}
                            </Badge>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                </button>
                {isExpanded && (
                    <div className="p-4 bg-slate-900/50">
                        {children}
                    </div>
                )}
            </div>
        )
    }

    return (
        <Card className="bg-slate-900 border-slate-700 p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-6 w-6 text-amber-500" />
                        <h2 className="text-xl font-bold text-amber-500">EXPEDIENTE DEL CASO</h2>
                    </div>
                    <p className="text-sm text-slate-400">#{caseData.caseId}</p>
                </div>
                <Badge className={`${caseData.difficulty === 'easy' ? 'bg-green-600' :
                        caseData.difficulty === 'medium' ? 'bg-amber-600' : 'bg-red-600'
                    }`}>
                    {caseData.difficulty === 'easy' ? 'Fácil' :
                        caseData.difficulty === 'medium' ? 'Medio' : 'Difícil'}
                </Badge>
            </div>

            {/* Sections */}
            <div className="space-y-3">
                {/* Summary Section */}
                <Section id="summary" icon={FileText} title="Resumen del Caso">
                    <div className="space-y-3">
                        <div>
                            <h3 className="text-lg font-bold text-slate-100 mb-2">{caseData.title}</h3>
                            <p className="text-sm text-slate-300">{caseData.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span className="text-slate-400">Ubicación:</span>
                            <span className="text-slate-200">{caseData.location}</span>
                        </div>
                    </div>
                </Section>

                {/* Suspects Section */}
                <Section
                    id="suspects"
                    icon={Users}
                    title="Sospechosos"
                    badge={`${caseData.suspects?.length || 0} personas`}
                >
                    <div className="space-y-3">
                        {caseData.suspects?.map((suspect: any, idx: number) => (
                            <div
                                key={idx}
                                className="p-3 bg-slate-800/50 rounded border border-slate-700"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-slate-200">{suspect.name}</p>
                                        <p className="text-xs text-slate-500">{suspect.role}</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs border-slate-600">
                                        {suspect.personality}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-400 mb-2">{suspect.backstory}</p>
                                <div className="text-xs">
                                    <span className="text-slate-500">Coartada: </span>
                                    <span className="text-slate-300">{suspect.alibi}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Evidence Section */}
                <Section
                    id="evidence"
                    icon={Bookmark}
                    title="Evidencia"
                    badge={`${caseData.evidence?.length || 0} piezas`}
                >
                    <div className="space-y-2">
                        {caseData.evidence?.map((ev: any, idx: number) => (
                            <div
                                key={idx}
                                className="p-3 bg-slate-800/50 rounded border border-slate-700"
                            >
                                <p className="font-semibold text-amber-400 text-sm">{ev.name}</p>
                                <p className="text-sm text-slate-300 mt-1">{ev.description}</p>
                                {ev.linkedTo && ev.linkedTo.length > 0 && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                                        <span className="text-xs text-slate-500">
                                            Vinculado a: {ev.linkedTo.map((i: number) =>
                                                caseData.suspects?.[i]?.name
                                            ).filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Timeline Section */}
                <Section id="timeline" icon={Clock} title="Línea de Tiempo">
                    <div className="text-sm text-slate-300 whitespace-pre-wrap">
                        {caseData.timeline}
                    </div>
                </Section>

                {/* Notes Section */}
                <Section id="notes" icon={StickyNote} title="Mis Notas">
                    <div className="space-y-3">
                        <Textarea
                            value={localNotes}
                            onChange={(e) => setLocalNotes(e.target.value)}
                            placeholder="Escribe tus notas sobre el caso aquí..."
                            className="min-h-[150px] bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500 resize-none"
                        />
                        <Button
                            onClick={handleSaveNotes}
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Notas
                        </Button>
                    </div>
                </Section>
            </div>
        </Card>
    )
}
