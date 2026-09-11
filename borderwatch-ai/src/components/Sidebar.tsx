import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  ActivitySquare,
  ShieldHalf,
  X,
  Video,
  Users,
} from "lucide-react";

const links = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/cameras", label: "Cameras", icon: Camera, end: false },
  { to: "/live", label: "Live Camera", icon: Video, end: false },
  { to: "/roster", label: "Team Roster", icon: Users, end: false },
  { to: "/system", label: "System Status", icon: ActivitySquare, end: false },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-panel transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-signal/40 bg-signal/10 text-signal">
              <ShieldHalf size={18} strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">BorderWatch AI</p>
              <p className="font-mono text-[11px] text-ink-faint">
                Smart Border Surveillance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-dim hover:bg-panel-hover lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-signal/10 text-signal border border-signal/30"
                    : "text-ink-dim border border-transparent hover:bg-panel-hover hover:text-ink"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line px-5 py-4">
          <p className="font-mono text-[11px] leading-relaxed text-ink-faint">
            Smart India Hackathon
            <br />
            Prototype build · v0.1.0
          </p>
        </div>
      </aside>
    </>
  );
}
