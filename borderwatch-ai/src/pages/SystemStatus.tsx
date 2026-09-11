import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { systemServices } from "../data/mockData";
import type { ServiceState } from "../types";

const stateConfig: Record<
  ServiceState,
  { icon: typeof CheckCircle2; classes: string; label: string }
> = {
  operational: {
    icon: CheckCircle2,
    classes: "text-active bg-active/10 border-active/25",
    label: "Operational",
  },
  degraded: {
    icon: AlertCircle,
    classes: "text-signal bg-signal/10 border-signal/25",
    label: "Degraded",
  },
  offline: {
    icon: XCircle,
    classes: "text-danger bg-danger/10 border-danger/25",
    label: "Offline",
  },
};

export default function SystemStatus() {
  const operational = systemServices.filter((s) => s.state === "operational").length;
  const overallHealthy = operational === systemServices.length;

  return (
    <div className="space-y-6">
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-5 ${
          overallHealthy
            ? "border-active/25 bg-active/10"
            : "border-signal/25 bg-signal/10"
        }`}
      >
        <div>
          <p className={`text-sm font-semibold ${overallHealthy ? "text-active" : "text-signal"}`}>
            {overallHealthy ? "All systems operational" : "Some systems need attention"}
          </p>
          <p className="mt-1 text-sm text-ink-dim">
            {operational} of {systemServices.length} services running normally
          </p>
        </div>
        <p className="font-mono text-xs text-ink-faint">
          Last checked just now · simulated status
        </p>
      </div>

      <div className="rounded-lg border border-line bg-panel">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Service health</h2>
        </div>
        <ul className="divide-y divide-line-soft">
          {systemServices.map((service) => {
            const config = stateConfig[service.state];
            const Icon = config.icon;
            return (
              <li
                key={service.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-md border p-1.5 ${config.classes}`}>
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{service.name}</p>
                    <p className="text-xs text-ink-faint">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-9 sm:pl-0">
                  <div className="text-right">
                    <p className="font-mono text-xs text-ink-dim">{service.uptime}</p>
                    <p className="text-[11px] text-ink-faint">30-day uptime</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${config.classes}`}
                  >
                    {config.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-lg border border-line bg-panel p-5">
        <h2 className="text-sm font-semibold text-ink">Environment</h2>
        <dl className="mt-3 grid grid-cols-1 gap-4 font-mono text-xs sm:grid-cols-3">
          <div>
            <dt className="text-ink-faint">Mode</dt>
            <dd className="mt-1 text-signal">DEMO — mock data only</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Build</dt>
            <dd className="mt-1 text-ink">v0.1.0-prototype</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Deployment target</dt>
            <dd className="mt-1 text-ink">Render (static site)</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
