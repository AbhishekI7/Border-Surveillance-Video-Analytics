import { Users, Truck, VideoOff, RadioTower } from "lucide-react";
import type { Camera } from "../types";
import StatusPill from "./StatusPill";

const statusTone: Record<Camera["status"], "active" | "signal" | "danger"> = {
  online: "active",
  warning: "signal",
  offline: "danger",
};

const statusLabel: Record<Camera["status"], string> = {
  online: "LIVE",
  warning: "UNSTABLE",
  offline: "OFFLINE",
};

/**
 * Turns an author-friendly path like "/videos/north-fence.mp4" (as written in
 * mockData.ts) into one that resolves correctly under the app's base path —
 * "/" locally, "/Border-Surveillance-Video-Analytics/" on GitHub Pages.
 */
function resolvePublicPath(path: string): string {
  const base = import.meta.env.BASE_URL; // e.g. "/" or "/Border-Surveillance-Video-Analytics/"
  return path.startsWith("/") ? base.replace(/\/$/, "") + path : path;
}

export default function CameraTile({ camera }: { camera: Camera }) {
  const isOffline = camera.status === "offline";

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-panel">
      <div className="relative aspect-video bg-base-raised">
        {isOffline ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-ink-faint">
            <VideoOff size={26} />
            <p className="font-mono text-xs">NO SIGNAL</p>
          </div>
        ) : camera.videoSrc ? (
          <video
            className="h-full w-full object-cover"
            src={resolvePublicPath(camera.videoSrc)}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div className="scanlines grid-fade flex h-full items-center justify-center">
            <RadioTower
              size={30}
              strokeWidth={1.5}
              className="text-ink-faint/60"
            />
          </div>
        )}

        {/* corner frame marks, like a viewfinder */}
        <div className="pointer-events-none absolute inset-2 border border-ink/10" />

        <div className="absolute left-2 top-2">
          <StatusPill label={statusLabel[camera.status]} tone={statusTone[camera.status]} />
        </div>
        <div className="absolute right-2 top-2 rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-ink-dim">
          {camera.name}
        </div>

        {!isOffline && (
          <div className="absolute bottom-2 left-2 flex gap-2">
            <span className="flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-ink">
              <Users size={12} /> {camera.personCount}
            </span>
            <span className="flex items-center gap-1 rounded bg-black/50 px-2 py-0.5 font-mono text-[11px] text-ink">
              <Truck size={12} /> {camera.vehicleCount}
            </span>
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <p className="text-sm font-medium text-ink">{camera.zone}</p>
        <p className="mt-0.5 text-xs text-ink-faint">{camera.lastEvent}</p>
      </div>
    </div>
  );
}
