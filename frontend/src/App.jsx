import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import UploadSighting from './pages/UploadSighting'
import IndividualProfile from './pages/IndividualProfile'
import MovementMap from './pages/MovementMap'
import Alerts from './pages/Alerts'
import PopulationInsights from './pages/PopulationInsights'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<UploadSighting />} />
        <Route path="/individuals/:id" element={<IndividualProfile />} />
        <Route path="/map" element={<MovementMap />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/insights" element={<PopulationInsights />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}