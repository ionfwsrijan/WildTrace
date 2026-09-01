import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const TYPE_LABEL = {
  absence_anomaly: 'Absence anomaly',
  new_individual: 'New individual',
  location_jump: 'Location jump',
}

const STATUS_STYLE = {
  open: 'bg-red-100 text-red-700',
  reviewed: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [filter, setFilter] = useState('open')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    api.alerts(filter === 'all' ? null : filter).then(setAlerts).catch(console.error)
  }, [filter])

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
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest-900">Ranger Alerts</h1>
          <p className="text-sm text-gray-600">
            Human verification workflow — WildTrace flags anomalies, rangers act on them.
          </p>
        </div>
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
          {['open', 'all', 'resolved'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                filter === f ? 'bg-forest-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400">
            No {filter} alerts.
          </div>
        )}
        {alerts.map((a) => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[a.status]}`}>
                  {a.status}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {TYPE_LABEL[a.alert_type] || a.alert_type}
                </span>
                {a.individual_id && (
                  <Link to={`/individuals/${a.individual_id}`}
                    className="text-sm font-semibold text-forest-600 hover:underline">
                    {a.individual_id}
                  </Link>
                )}
              </div>
              <p className="mt-2 text-gray-700 text-sm">{a.description}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(a.created_at).toLocaleString()}
                {a.reviewed_by ? ` · reviewed by ${a.reviewed_by}` : ''}
              </p>
            </div>
            {a.status !== 'resolved' && (
              <button onClick={() => resolve(a)} disabled={busyId === a.id}
                className="shrink-0 bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg px-4 py-2 transition">
                {busyId === a.id ? '…' : 'Resolve'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}