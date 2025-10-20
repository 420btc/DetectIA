"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface EvidenceBoardProps {
  caseData: any
}

export function EvidenceBoard({ caseData }: EvidenceBoardProps) {
  const [expandedEvidence, setExpandedEvidence] = useState<number | null>(null)

  return (
    <Card className="bg-slate-900 border-slate-700 p-4">
      <h2 className="text-xl font-bold text-amber-500 mb-4">TABLERO DE EVIDENCIA</h2>

      {/* Timeline */}
      <div className="mb-6 p-3 bg-slate-800 border border-slate-700 rounded">
        <h3 className="text-sm font-bold text-amber-400 mb-2">LÍNEA DE TIEMPO</h3>
        <p className="text-xs text-slate-300 whitespace-pre-wrap">{caseData.timeline}</p>
      </div>

      {/* Evidence Grid */}
      <div className="space-y-3">
        {caseData.evidence?.map((item: any, idx: number) => {
          const isExpanded = expandedEvidence === idx
          const linkedSuspects = item.linkedTo?.map((i: number) => caseData.suspects[i]?.name) || []

          return (
            <div
              key={idx}
              onClick={() => setExpandedEvidence(isExpanded ? null : idx)}
              className="bg-slate-800 border border-slate-700 rounded p-3 cursor-pointer hover:border-amber-600 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-amber-400">{item.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                </div>
                <div className="ml-2">
                  {isExpanded ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-slate-600" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                  <div>
                    <p className="text-xs text-slate-400 uppercase mb-1">Vinculado a</p>
                    <div className="flex flex-wrap gap-1">
                      {linkedSuspects.length > 0 ? (
                        linkedSuspects.map((name: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-gray-800 border-gray-600 text-gray-200">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Sin vincular</span>
                      )}
                    </div>
                  </div>

                  {item.falseLeads && item.falseLeads.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 uppercase mb-1">Pistas falsas potenciales</p>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {item.falseLeads.map((lead: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{lead}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
