import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import DemoModeBadge from "./DemoModeBadge";

interface TopBarProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, subtitle, onMenuClick }: TopBarProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString("en-IN", { hour12: false });
  const date = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-base/90 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-md border border-line p-2 text-ink-dim hover:bg-panel-hover lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-ink sm:text-xl">{title}</h1>
            <p className="text-sm text-ink-dim">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DemoModeBadge />
          <div className="hidden rounded-md border border-line bg-panel px-3 py-1.5 font-mono text-xs text-ink-dim sm:block">
            {date} · {time} IST
          </div>
        </div>
      </div>
    </header>
  );
}
