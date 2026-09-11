export type CameraStatus = "online" | "offline" | "warning";

export interface Camera {
  id: string;
  name: string;
  zone: string;
  status: CameraStatus;
  personCount: number;
  vehicleCount: number;
  lastEvent: string;
  /** Optional path to a real video file in /public, e.g. "/videos/north-fence.mp4" */
  videoSrc?: string;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  zone: string;
  time: string;
}

export type ServiceState = "operational" | "degraded" | "offline";

export interface SystemService {
  id: string;
  name: string;
  description: string;
  state: ServiceState;
  uptime: string;
}
