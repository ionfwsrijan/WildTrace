import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ArrowRight, BarChart3, MapPin, Bell, Layers, Upload, ExternalLink, Sparkles } from 'lucide-react'
import { api } from '../api/client'

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [health, setHealth] = useState(null)

  useEffect(() => {
    api.stats().then(setStats).catch(() => setStats(null))
    api.health().then(setHealth).catch(() => setHealth({ status: 'down' }))
  }, [])

  const individuals = stats?.total_individuals ?? '—'
  const sightings = stats?.total_sightings ?? '—'
  const alerts = stats?.open_alerts ?? '—'

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0a0d0c] text-white select-none">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/slide_tiger.jpg')", backgroundPosition: 'center 35%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-radial-glow mix-blend-soft-light opacity-50" />
      </div>

      {/* Volumetric Shimmer Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen"
        style={{
          background: 'radial-gradient(ellipse at 70% 20%, rgba(255, 235, 180, 0.4) 0%, rgba(212, 175, 55, 0.15) 45%, transparent 75%)'
        }}
      />

      {/* Top Header / Brand */}
      <header className="absolute top-0 left-0 right-16 md:right-24 z-40 flex items-center justify-between p-6 md:p-10">
        <Link to="/" className="group flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight text-white hover:opacity-95 transition-opacity">
          <span className="font-syne font-extrabold tracking-tight">WildTrace</span>
          <span className="h-2 w-2 rounded-full bg-earth-gold shadow-[0_0_10px_#d4af37] animate-pulse" />
        </Link>

        <div className="hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.25em] text-white/70">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${health?.status === 'ok' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
            <span>{health?.status === 'ok' ? 'Live System' : 'Connecting'}</span>
          </div>
          <Link to="/dashboard" className="rounded-full border border-white/20 bg-black/40 px-5 py-2 backdrop-blur-md hover:bg-white/10 hover:border-earth-gold transition-all">
            Enter Command Center
          </Link>
        </div>
      </header>

      {/* Center Typography */}
      <main className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none pb-24 md:pb-16 px-4">
        <div className="text-center space-y-1 md:space-y-3">
          <p className="font-syne font-bold text-xs md:text-sm tracking-[0.45em] text-white/75 uppercase drop-shadow-md">
            SIKHOTE-ALIN · RUSSIA
          </p>

          <h1
            className="font-bebas text-[80px] sm:text-[130px] md:text-[180px] lg:text-[230px] xl:text-[270px] leading-none tracking-wider text-white/90 drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)] font-extrabold select-none transition-all duration-700"
            style={{
              textShadow: '0 10px 40px rgba(0,0,0,0.7), 0 0 80px rgba(212,175,55,0.15)'
            }}
          >
            AMUR TIGER
          </h1>

          <p className="font-syne font-semibold text-xs sm:text-sm md:text-base tracking-[0.35em] text-white/80 uppercase max-w-2xl mx-auto drop-shadow-md">
            TRACK THE INDIVIDUAL, NOT JUST THE SPECIES
          </p>
        </div>
      </main>

      {/* Bottom HUD Bar */}
      <footer className="absolute bottom-0 left-0 right-16 md:right-24 z-30 p-6 md:p-10 bg-gradient-to-t from-black via-black/70 to-transparent">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Left Block: Scope */}
          <div className="lg:col-span-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-earth-gold" />
              <h3 className="font-syne font-bold text-base md:text-lg text-white tracking-wide">
                Amur Tiger Re-Identification
              </h3>
            </div>
            <p className="text-xs text-white/60 font-body-md">Sikhote-Alin Biosphere Reserve</p>
            <p className="text-xs font-semibold text-earth-gold pt-1">#wildtrace</p>
          </div>

          {/* Center Block: Narrative + CTA */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs md:text-sm leading-relaxed text-white/70 max-w-xl font-body-md line-clamp-2 md:line-clamp-3">
              Every stripe pattern is an immutable biological fingerprint. YOLOv8 detection paired with DenseNet121
              triplet embeddings and FAISS similarity search transforms raw camera-trap captures into verified ranger
              intelligence — flagging territory shifts, absence triggers, and poaching risk before it is too late.
            </p>

            <div className="flex items-center gap-3 pt-1 pointer-events-auto">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-earth-gold text-black font-semibold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:bg-[#e9c349] transition-all transform hover:-translate-y-0.5"
              >
                Launch Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                to="/upload"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-medium text-xs tracking-wider uppercase transition-all"
              >
                Log Sighting
              </Link>
            </div>
          </div>

          {/* Right Block: Real Stat Counters */}
          <div className="lg:col-span-4 grid grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <div className="font-syne text-2xl md:text-3xl font-extrabold text-[#e9c349] drop-shadow-[0_0_12px_rgba(233,195,73,0.5)]">
                {individuals}
              </div>
              <p className="text-[11px] font-medium text-white/80 leading-tight mt-0.5">Tracked Individuals</p>
            </div>
            <div>
              <div className="font-syne text-2xl md:text-3xl font-extrabold text-[#e9c349] drop-shadow-[0_0_12px_rgba(233,195,73,0.5)]">
                {sightings}
              </div>
              <p className="text-[11px] font-medium text-white/80 leading-tight mt-0.5">Sightings Indexed</p>
            </div>
            <div>
              <div className="font-syne text-2xl md:text-3xl font-extrabold text-[#e9c349] drop-shadow-[0_0_12px_rgba(233,195,73,0.5)]">
                {alerts}
              </div>
              <p className="text-[11px] font-medium text-white/80 leading-tight mt-0.5">Open Alerts</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Right Vertical Sidebar */}
      <aside className="fixed right-0 top-0 bottom-0 w-16 md:w-24 z-50 bg-[#0a0f0d]/60 backdrop-blur-xl border-l border-white/10 flex flex-col justify-between items-center py-6 md:py-8">
        <button
          onClick={() => setMenuOpen(true)}
          className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-white transition-all transform hover:scale-105"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center text-xs font-syne tracking-wider text-white/80">
            <span className="text-earth-gold font-bold">01</span>
            <div className="h-8 w-[1px] bg-white/20 my-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-earth-gold" style={{ height: '100%' }} />
            </div>
            <span className="text-white/40">01</span>
          </div>
        </div>
      </aside>

      {/* Slide-out Fullscreen Drawer Navigation */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

        <div
          className={`absolute top-0 right-0 bottom-0 w-full max-w-md bg-[#0d1411] border-l border-white/15 p-8 flex flex-col justify-between shadow-2xl transform transition-transform duration-500 ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div>
            <div className="flex items-center justify-between pb-8 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-syne font-bold text-xl text-white">WildTrace Menu</span>
                <span className="h-2 w-2 rounded-full bg-earth-gold" />
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {[
                { to: '/', label: 'Overview', icon: Sparkles, desc: 'Amur Tiger Intro' },
                { to: '/dashboard', label: 'Dashboard', icon: BarChart3, desc: 'Operational Stats & Counts' },
                { to: '/map', label: 'Movement Map', icon: MapPin, desc: 'Spatial Sighting Trails' },
                { to: '/alerts', label: 'Ranger Alerts', icon: Bell, desc: 'Absence Anomaly Queue' },
                { to: '/insights', label: 'Population Insights', icon: Layers, desc: 'Cohort & Interval Trends' },
                { to: '/upload', label: 'Log Camera Trap', icon: Upload, desc: 'Process New Capture' },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-earth-gold/20 text-white group-hover:text-earth-gold transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-base text-white group-hover:text-earth-gold transition-colors">
                          {item.label}
                        </p>
                        <p className="text-xs text-white/50">{item.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-earth-gold group-hover:translate-x-1 transition-all" />
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors"
            >
              <span>FastAPI Swagger Spec</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <div className="text-center text-xs text-white/40">
              WildTrace Conservation Platform · Decision Support Tool
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}