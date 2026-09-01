import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BellRing, ShieldCheck, MapPin, UserPlus, Clock, AlertTriangle, Check } from 'lucide-react'
import { api } from '../api/client'
import PageHeader from '../components/PageHeader'
import TabBar from '../components/ui/tab-bar'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'

const TYPE_META = {
  absence_anomaly: { label: 'Absence anomaly', icon: Clock, tone: 'amber' },
  new_individual: { label: 'New individual', icon: UserPlus, tone: 'blue' },
  location_jump: { label: 'Location jump', icon: MapPin, tone: 'violet' },
}

function StatusBadge({ status }) {
  const map = {
    open: { label: 'Open', variant: 'red' },
    reviewed: { label: 'Reviewed', variant: 'amber' },
    resolved: { label: 'Resolved', variant: 'green' },
  }
  const m = map[status] || { label: status, variant: 'neutral' }
  return <Badge variant={m.variant} dot>{m.label}</Badge>
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('open')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    api.alerts(filter === 'all' ? null : filter).then(setAlerts).catch(console.error)
  }, [filter])

  const tabs = useMemo(() => {
    const count = (s) => alerts.filter((a) => a.status === s).length
    return [
      { value: 'open', label: 'Open', count: count('open') },
      { value: 'reviewed', label: 'Reviewed', count: count('reviewed') },
      { value: 'all', label: 'All' },
      { value: 'resolved', label: 'Resolved', count: count('resolved') },
    ]
  }, [alerts, filter])

  async function resolve(a) {
    setBusyId(a.id)
    try {
      await api.resolveAlert(a.id, 'Demo Ranger', 'resolved')
      setAlerts((prev) => prev.map((x) => x.id === a.id ? { ...x, status: 'resolved', reviewed_by: 'Demo Ranger' } : x))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Verification Workflow"
        title="Ranger Alerts"
        description="Human verification — WildTrace flags anomalies, rangers review and act."
        icon={BellRing}
        actions={<TabBar tabs={tabs} active={filter} onChange={setFilter} />}
      />

      {alerts.length === 0 && !busyId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="mt-4 font-semibold text-white">No {filter} alerts</p>
            <p className="mt-1 text-sm text-ink-500">The monitoring workflow is currently quiet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 animate-fade-up">
          {alerts.length === 0 && [1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
          {alerts.map((a) => {
            const meta = TYPE_META[a.alert_type] || { label: a.alert_type, icon: AlertTriangle, tone: 'neutral' }
            return (
              <Card key={a.id} className={`overflow-hidden transition-shadow hover:shadow-cardHover ${a.status === 'open' ? 'border-l-4 border-l-red-400' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          a.status === 'resolved' ? 'bg-green-500/15 text-green-300' : a.status === 'reviewed' ? 'bg-accent-500/15 text-accent-300' : 'bg-red-500/15 text-red-300'
                        }`}>
                          {a.status === 'resolved' ? <Check className="h-4 w-4" /> : <meta.icon className="h-4 w-4" />}
                        </span>
                        <StatusBadge status={a.status} />
                        <Badge variant={meta.tone}>{meta.label}</Badge>
                        {a.individual_id && (
                          <Link to={`/individuals/${a.individual_id}`} className="text-sm font-semibold text-brand-400 hover:underline">
                            {a.individual_id}
                          </Link>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-ink-200">{a.description}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(a.created_at).toLocaleString()}
                        {a.reviewed_by ? ` · reviewed by ${a.reviewed_by}` : ''}
                      </p>
                    </div>

                    {a.status !== 'resolved' && (
                      <div className="shrink-0 sm:pl-4">
                        <Button
                          size="sm"
                          variant={a.status === 'open' ? 'default' : 'secondary'}
                          onClick={() => resolve(a)}
                          disabled={busyId === a.id}
                        >
                          {busyId === a.id ? 'Resolving…' : 'Resolve'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}