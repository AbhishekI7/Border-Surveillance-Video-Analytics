import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import type { Alert } from "../types";

const severityConfig: Record<
  Alert["severity"],
  { icon: typeof AlertTriangle; classes: string; label: string }
> = {
  critical: {
    icon: ShieldAlert,
    classes: "text-danger bg-danger/10 border-danger/25",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    classes: "text-signal bg-signal/10 border-signal/25",
    label: "Warning",
  },
  info: {
    icon: Info,
    classes: "text-vehicle bg-vehicle/10 border-vehicle/25",
    label: "Info",
  },
};

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="rounded-lg border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">Recent alerts</h2>
        <span className="font-mono text-xs text-ink-faint">{alerts.length} total</span>
      </div>
      <ul className="divide-y divide-line-soft">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          return (
            <li key={alert.id} className="flex items-start gap-3 px-5 py-3.5">
              <div className={`mt-0.5 rounded-md border p-1.5 ${config.classes}`}>
                <Icon size={14} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">{alert.message}</p>
                <p className="mt-0.5 text-xs text-ink-faint">{alert.zone}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-xs text-ink-dim">{alert.time}</p>
                <p className={`mt-0.5 text-[11px] font-medium ${config.classes.split(" ")[0]}`}>
                  {config.label}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
