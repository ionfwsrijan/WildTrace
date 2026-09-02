import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  UserCheck, 
  ArrowRight, 
  ShieldAlert, 
  Check, 
  Layers 
} from 'lucide-react'
import { api } from '../api/client'
import { TopHeaderBar } from '../components/Navigation'
import { formatDateTime } from '../lib/format'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('open')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    api.alerts().then(setAlerts).catch(() => setAlerts([]))
  }, [])

  const filtered = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((alert) => alert.status === filter)),
    [alerts, filter]
  )

  const openCount = alerts.filter((a) => a.status === 'open').length
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length

  async function resolve(alert) {
    setBusyId(alert.id)
    try {
      const updated = await api.resolveAlert(alert.id, 'Ranger Unit Alpha', 'resolved')
      setAlerts((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <TopHeaderBar 
        title="Ranger Verification & Alerts" 
        subtitle="Human-in-the-loop decision support for biological anomalies and territorial absence flags" 
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#0f1511] border border-white/5">
        <div className="flex items-center gap-2">
          {['open', 'resolved', 'all'].map((tabKey) => {
            const active = filter === tabKey
            const count = tabKey === 'all' ? alerts.length : tabKey === 'open' ? openCount : resolvedCount
            return (
              <button
                key={tabKey}
                onClick={() => setFilter(tabKey)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tabKey}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-emerald-500 text-black font-extrabold' : 'bg-white/10 text-white/70'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        <div className="text-xs text-white/50">
          Auto-Flag Threshold: <span className="text-emerald-400 font-semibold">14 Days Absence</span>
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((alert) => {
            const isResolved = alert.status === 'resolved'
            return (
              <div
                key={alert.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#0f1511] border border-white/5 hover:border-emerald-500/30 transition-all shadow-lg space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                      isResolved 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                    }`}>
                      {isResolved ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-syne text-base font-bold text-white">
                          {alert.individual_id ? `Individual ${alert.individual_id}` : 'General Anomaly'}
                        </h4>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                          isResolved 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 mt-0.5">
                        Logged: {formatDateTime(alert.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/70 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5 font-body-md">
                  {alert.description}
                </p>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  {alert.individual_id ? (
                    <Link
                      to={`/individuals/${alert.individual_id}`}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 text-[11px]"
                    >
                      View Profile <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-white/40 text-[11px]">System Record</span>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => resolve(alert)}
                      disabled={busyId === alert.id}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {busyId === alert.id ? 'Resolving...' : 'Verify & Resolve'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Resolved by {alert.reviewed_by || 'Ranger Team'}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-2 py-16 text-center rounded-2xl bg-[#0f1511] border border-white/5 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="font-syne text-lg font-bold text-white">No active alerts in this view</p>
            <p className="text-xs text-white/50">All anomalies for this filter have been reviewed and verified.</p>
          </div>
        )}
      </div>
    </div>
  )
}