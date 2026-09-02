import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Compass, 
  Bell, 
  PawPrint, 
  LogOut, 
  TreePine, 
  Upload 
} from 'lucide-react'
import { api } from '../api/client'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/map', label: 'Map', icon: Compass },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/insights', label: 'Species', icon: PawPrint },
  { to: '/upload', label: 'Log Sighting', icon: Upload },
]

export function SideNavBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-20 xl:w-56 bg-[#060a08] border-r border-white/5 p-4 flex flex-col justify-between z-40">
      {/* Top Logo with glowing emerald leaf badge */}
      <div>
        <Link to="/" className="flex items-center gap-3 px-2 py-3 mb-6 group">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#112418] border border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-all">
            <TreePine className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="hidden xl:block">
            <p className="font-syne text-lg font-bold tracking-tight text-white leading-none">WildTrace</p>
            <p className="text-[9px] uppercase tracking-[0.24em] text-emerald-400/80 mt-1">Intelligence</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <NavLink
                key={`${to}-${label}`}
                to={to}
                className={active
                  ? 'flex items-center gap-3 rounded-2xl border border-emerald-500/60 bg-[#0c1a12] px-3.5 py-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] font-semibold transition-all'
                  : 'flex items-center gap-3 rounded-2xl border border-transparent px-3.5 py-3 text-white/50 transition-all hover:text-white hover:bg-white/5'}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-emerald-400' : 'text-white/50'}`} />
                <span className="hidden xl:inline text-sm">{label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom Logout */}
      <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="hidden xl:inline">Exit to Landing</span>
        </button>
      </div>
    </aside>
  )
}

export function TopHeaderBar({ title = "Operational Overview", subtitle }) {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    let mounted = true
    api.health().then((data) => mounted && setHealth(data)).catch(() => mounted && setHealth({ status: 'down' }))
    return () => { mounted = false }
  }, [])

  return (
    <header className="flex items-center justify-between pb-6 mb-2 border-b border-white/5">
      <div>
        <h1 className="font-syne text-2xl md:text-3xl font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-white/50 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Live System Health Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101c15] border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>{health?.status === 'ok' ? 'System Active' : 'Connecting'}</span>
        </div>

        {/* Notification Bell */}
        <Link 
          to="/alerts" 
          className="relative p-2.5 rounded-full bg-[#111814] border border-white/10 text-white/70 hover:text-white hover:border-emerald-500/40 transition-all"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        </Link>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-full bg-[#111814] border border-white/10">
          <div className="relative h-8 w-8 rounded-full overflow-hidden border border-emerald-500/50">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" 
              alt="Ranger Officer" 
              className="h-full w-full object-cover"
            />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-black" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-white leading-none">Ranger Team</p>
            <p className="text-[10px] text-emerald-400/80 leading-tight mt-0.5">Sikhote-Alin</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export function MobileDock() {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-1 rounded-full border border-white/10 bg-[#060a08]/95 px-4 py-2 shadow-[0_16px_48px_rgba(0,0,0,0.8)] backdrop-blur-2xl xl:hidden">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={`mobile-${to}-${label}`}
          to={to}
          className={({ isActive }) => (
            `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-full px-2 py-1 text-[10px] transition-colors ${
              isActive ? 'text-emerald-400 font-bold' : 'text-white/50'
            }`
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function ExplorerLayout() {
  return (
    <div className="relative min-h-screen bg-[#060a08] text-on-surface overflow-x-hidden p-3 md:p-6">
      {/* Background Soft Glow & Grid */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse at 80% 10%, rgba(16, 185, 129, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)'
        }}
      />

      <SideNavBar />
      <MobileDock />
      
      {/* Main Console Framing */}
      <div className="pl-20 xl:pl-60 pr-2 md:pr-4 pb-20 xl:pb-4 min-h-screen">
        <main className="bg-[#090d0b]/90 border border-white/5 rounded-[28px] md:rounded-[36px] p-5 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
