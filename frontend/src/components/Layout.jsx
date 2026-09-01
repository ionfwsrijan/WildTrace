import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Camera, MapPinned, BellRing, Users, Upload,
  Menu, X, PawPrint, ChevronsUpDown,
} from 'lucide-react'
import { cn } from '../lib/utils'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Sighting', icon: Upload },
  { to: '/alerts', label: 'Ranger Alerts', icon: BellRing },
  { to: '/map', label: 'Movement Map', icon: MapPinned },
  { to: '/insights', label: 'Population', icon: Users },
]

const TITLES = {
  '/': { title: 'Overview', sub: 'Conservation intelligence at a glance' },
  '/upload': { title: 'Upload Sighting', sub: 'Detect, embed and match a camera-trap photo' },
  '/alerts': { title: 'Ranger Alerts', sub: 'Human verification workflow' },
  '/map': { title: 'Movement Map', sub: 'Explore individual movement across the reserve' },
  '/insights': { title: 'Population Insights', sub: 'Aggregate patterns across tracked individuals' },
}

function NavItem({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
          isActive
            ? 'bg-white/10 text-white shadow-inner ring-1 ring-inset ring-white/10'
            : 'text-brand-100/70 hover:bg-white/5 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-accent-400" />
          )}
          <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-accent-400' : 'text-brand-200/60 group-hover:text-brand-100')} strokeWidth={2} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const current = TITLES[Object.keys(TITLES).find((k) => (k !== '/' && pathname.startsWith(k)) || pathname === k)] || TITLES['/']

  const sidebar = (
    <div className="flex h-full flex-col bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <PawPrint className="h-6 w-6 text-accent-400" />
        </div>
        <div>
          <div className="font-display text-lg font-bold leading-none text-white">WildTrace</div>
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-widest text-brand-200/60">
            Re-ID Console
          </div>
        </div>
      </div>

      <div className="mx-5 mb-4 border-t border-white/10" />

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-200/40">
          Workspace
        </p>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onNavigate={() => setOpen(false)} />
        ))}
      </nav>

      {/* Footer user card */}
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-ink-900">
            W
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-white">WildTrace Ranger</div>
            <div className="truncate text-xs text-brand-200/60">Sikhote-Alin Reserve</div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-brand-200/50" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 animate-fade-in">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main */}
      <div className="relative lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-ink-700/60 bg-black/80 backdrop-blur-md">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-700 text-ink-200 hover:bg-ink-900/10 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <h1 className="font-display text-base font-bold text-white">{current.title}</h1>
                <p className="text-xs text-ink-400">{current.sub}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
                ● Live · Panthera Tigris
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                WT
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}