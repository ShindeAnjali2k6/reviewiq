/**
 * App layout shell for ReviewIQ.
 *
 * Combines Sidebar navigation, Topbar (with live API health indicator),
 * and the main content area into a single AppLayout component used by
 * App.tsx via React Router's <Outlet />.
 */

import { type ReactNode, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Timer,
  Brain,
  Menu,
  X,
  Activity,
  Sparkles,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useHealth } from "../hooks/useApi";
import { getHealthStyle } from "../lib/constants";

/* -------------------------------------------------------------------------- */
/* Navigation config                                                           */
/* -------------------------------------------------------------------------- */

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Contributors", path: "/contributors", icon: Users },
  { label: "Issues", path: "/issues", icon: AlertTriangle },
  { label: "Bottlenecks", path: "/bottlenecks", icon: Timer },
  { label: "ML Classifier", path: "/classifier", icon: Brain },
];

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                     */
/* -------------------------------------------------------------------------- */

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-[0_4px_20px_rgba(139,92,246,0.4)]">
          <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">ReviewIQ</p>
          <p className="text-xs leading-tight text-slate-500">PR Analytics</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/[0.07] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200",
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/5 px-5 py-4">
        <p className="text-xs text-slate-500">Built with React, TypeScript &amp; FastAPI.</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Topbar                                                                      */
/* -------------------------------------------------------------------------- */

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data, loading, error } = useHealth();

  const statusKey = error ? "down" : loading ? undefined : data?.status;
  const healthStyle = getHealthStyle(statusKey);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#0b0d13]/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:bg-white/10 lg:hidden"
        aria-label="Toggle navigation"
      >
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <div className="hidden lg:block" />

      <div
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
          healthStyle.badgeClass,
        )}
      >
        <Activity className="h-3.5 w-3.5" />
        <span className={cn("h-1.5 w-1.5 rounded-full", healthStyle.dotClass)} />
        <span>API: {loading ? "Checking…" : healthStyle.label}</span>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* AppLayout                                                                   */
/* -------------------------------------------------------------------------- */

export function AppLayout({ children }: { children?: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-slate-100">
      {/* Background gradient mesh */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-white/5 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#0b0d13] lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children ?? <Outlet />}</div>
        </main>
      </div>
    </div>
  );
}
