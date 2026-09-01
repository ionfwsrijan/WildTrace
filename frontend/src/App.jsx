import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import UploadSighting from './pages/UploadSighting'
import IndividualProfile from './pages/IndividualProfile'
import MovementMap from './pages/MovementMap'
import Alerts from './pages/Alerts'
import PopulationInsights from './pages/PopulationInsights'

function Nav() {
  const link = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-forest-100 hover:bg-white/10 hover:text-white'}`
  return (
    <nav className="bg-forest-800 border-b border-forest-900/60">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <span className="text-white font-display font-bold text-lg tracking-wide">
            🐯 WildTrace
          </span>
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={link}>Dashboard</NavLink>
            <NavLink to="/upload" className={link}>Upload Sighting</NavLink>
            <NavLink to="/alerts" className={link}>Alerts</NavLink>
            <NavLink to="/map" className={link}>Movement Map</NavLink>
            <NavLink to="/insights" className={link}>Population</NavLink>
          </div>
        </div>
        <span className="text-xs text-forest-100/70">Decision-support for conservation teams</span>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-forest-100">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadSighting />} />
          <Route path="/individuals/:id" element={<IndividualProfile />} />
          <Route path="/map" element={<MovementMap />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/insights" element={<PopulationInsights />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}