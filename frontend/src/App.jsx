import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ExplorerLayout } from './components/Navigation'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const UploadSighting = lazy(() => import('./pages/UploadSighting'))
const IndividualProfile = lazy(() => import('./pages/IndividualProfile'))
const MovementMap = lazy(() => import('./pages/MovementMap'))
const Alerts = lazy(() => import('./pages/Alerts'))
const PopulationInsights = lazy(() => import('./pages/PopulationInsights'))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-on-surface-variant">
      Loading section...
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<ExplorerLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<UploadSighting />} />
          <Route path="/individuals/:id" element={<IndividualProfile />} />
          <Route path="/map" element={<MovementMap />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/insights" element={<PopulationInsights />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}