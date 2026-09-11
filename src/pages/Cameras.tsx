import CameraTile from "../components/CameraTile";
import StatusPill from "../components/StatusPill";
import { cameras } from "../data/mockData";

const statusTone = {
  online: "active",
  warning: "signal",
  offline: "danger",
} as const;

export default function Cameras() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cameras.map((camera) => (
          <CameraTile key={camera.id} camera={camera} />
        ))}
      </div>

      <div className="rounded-lg border border-line bg-panel">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Camera registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line-soft text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-5 py-3 font-medium">Camera</th>
                <th className="px-5 py-3 font-medium">Zone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Persons</th>
                <th className="px-5 py-3 font-medium">Vehicles</th>
                <th className="px-5 py-3 font-medium">Last event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {cameras.map((camera) => (
                <tr key={camera.id} className="text-ink-dim">
                  <td className="px-5 py-3 font-mono text-ink">{camera.name}</td>
                  <td className="px-5 py-3">{camera.zone}</td>
                  <td className="px-5 py-3">
                    <StatusPill
                      label={camera.status.toUpperCase()}
                      tone={statusTone[camera.status]}
                    />
                  </td>
                  <td className="px-5 py-3 font-mono">{camera.personCount}</td>
                  <td className="px-5 py-3 font-mono">{camera.vehicleCount}</td>
                  <td className="px-5 py-3">{camera.lastEvent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
