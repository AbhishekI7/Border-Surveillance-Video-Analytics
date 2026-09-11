import { Camera as CameraIcon, Users, Truck, ShieldAlert } from "lucide-react";
import StatCard from "../components/StatCard";
import CameraTile from "../components/CameraTile";
import AlertsPanel from "../components/AlertsPanel";
import { cameras, alerts } from "../data/mockData";

export default function Overview() {
  const onlineCount = cameras.filter((c) => c.status !== "offline").length;
  const totalPersons = cameras.reduce((sum, c) => sum + c.personCount, 0);
  const totalVehicles = cameras.reduce((sum, c) => sum + c.vehicleCount, 0);
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active cameras"
          value={`${onlineCount}/${cameras.length}`}
          hint="Feeds currently transmitting"
          icon={CameraIcon}
          tone="signal"
        />
        <StatCard
          label="Persons detected"
          value={String(totalPersons)}
          hint="Across all active zones, last 5 min"
          icon={Users}
          tone="active"
        />
        <StatCard
          label="Vehicles detected"
          value={String(totalVehicles)}
          hint="Across all active zones, last 5 min"
          icon={Truck}
          tone="vehicle"
        />
        <StatCard
          label="Critical alerts"
          value={String(criticalAlerts)}
          hint="Requiring immediate review"
          icon={ShieldAlert}
          tone="danger"
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Live camera feeds</h2>
          <span className="font-mono text-xs text-ink-faint">
            {cameras.length} cameras · simulated feed
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cameras.map((camera) => (
            <CameraTile key={camera.id} camera={camera} />
          ))}
        </div>
      </div>

      <AlertsPanel alerts={alerts} />
    </div>
  );
}
