import React from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, BadgeCheck, ArrowRight, Cpu, ScanSearch, Database, FileSearch } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

function DetailRow({ label, children }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  )
}

export default function IdentityMatchResult({ result }) {
  const isNew = result.is_new_individual

  const stages = [
    { icon: Database, label: 'Detect', value: result.detection_meta?.fallback ? result.detection_meta.reason : `bbox ${result.detection_meta?.bbox ? result.detection_meta.bbox.join(', ') : 'auto'}` },
    { icon: ScanSearch, label: 'Embed', value: 'features → 512-d vector' },
    { icon: FileSearch, label: 'Search', value: `FAISS nearest · sim ${result.similarity != null ? (result.similarity * 100).toFixed(0) : '—'}%` },
    { icon: Cpu, label: 'Decide', value: isNew ? 'register new' : 'match existing' },
  ]

  return (
    <Card className={`overflow-hidden border-l-4 animate-fade-up ${isNew ? 'border-l-accent-400' : 'border-l-brand-500'}`}>
      <CardHeader className="flex-row items-start justify-between gap-3 border-b border-ink-700/40 bg-[#0e1114]">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${isNew ? 'bg-accent-500/15 text-accent-300' : 'bg-brand-500/15 text-brand-300'}`}>
              {isNew ? <UserPlus className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
            </span>
            <CardTitle className="text-lg">
              {isNew ? 'New Individual Registered' : 'Individual Matched'}
            </CardTitle>
          </div>
        </div>
        {!isNew && result.created_alert && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-500/15 px-2.5 py-1 text-xs font-semibold text-accent-300">
            Alert #{result.created_alert}
          </span>
        )}
      </CardHeader>

      <CardContent className="pt-5">
        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DetailRow label="Individual">
            <Link to={`/individuals/${result.individual_id}`} className="text-lg font-bold text-brand-400 hover:underline">
              {result.individual_id}
            </Link>
          </DetailRow>
          <DetailRow label="Status">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${isNew ? 'bg-accent-500/15 text-accent-300' : 'bg-brand-500/15 text-brand-300'}`}>
              {result.match_status}
            </span>
          </DetailRow>
          {!isNew && (
            <DetailRow label="Similarity">
              <span className="font-semibold text-white">
                {(result.similarity * 100).toFixed(1)}%
                <span className="ml-1.5 text-xs font-normal text-ink-500">vs {result.matched_individual}</span>
              </span>
            </DetailRow>
          )}
          <DetailRow label="Sighting record">
            <span className="font-semibold text-white">#{result.sighting_id}</span>
          </DetailRow>
        </div>

        {/* Pipeline stages */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-ink-700/40 bg-[#0e1114] p-4 sm:grid-cols-4">
          {stages.map((s, i) => (
            <div key={s.label} className="flex items-start gap-2">
              <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink-100">{s.label}</div>
                <div className="truncate text-[11px] text-ink-500" title={s.value}>{s.value}</div>
              </div>
              {i < stages.length - 1 && <ArrowRight className="ml-auto mt-1 hidden h-3.5 w-3.5 text-ink-600 sm:block" />}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-ink-500">Pipeline: detect → embed → FAISS similarity search → match/register → store</p>
          <Button size="sm" variant="secondary" asChild className="hidden sm:inline-flex">
            <Link to={`/individuals/${result.individual_id}`}>
              View profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}