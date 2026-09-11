import type { Alert, Camera, SystemService } from "../types";

export const cameras: Camera[] = [
  {
    id: "cam-01",
    name: "CAM-01",
    zone: "North Fence, Sector A",
    status: "online",
    personCount: 3,
    vehicleCount: 1,
    lastEvent: "Person detected 2m ago",
  },
  {
    id: "cam-02",
    name: "CAM-02",
    zone: "East Watchtower",
    status: "online",
    personCount: 0,
    vehicleCount: 0,
    lastEvent: "No activity",
  },
  {
    id: "cam-03",
    name: "CAM-03",
    zone: "River Crossing",
    status: "warning",
    personCount: 1,
    vehicleCount: 0,
    lastEvent: "Signal degraded, 4 min ago",
  },
  {
    id: "cam-04",
    name: "CAM-04",
    zone: "South Access Road",
    status: "offline",
    personCount: 0,
    vehicleCount: 0,
    lastEvent: "Connection lost 18 min ago",
  },
];

export const alerts: Alert[] = [
  {
    id: "al-01",
    severity: "critical",
    message: "Unidentified movement near perimeter fence",
    zone: "North Fence, Sector A",
    time: "14:32:08",
  },
  {
    id: "al-02",
    severity: "warning",
    message: "Camera signal degraded",
    zone: "River Crossing",
    time: "14:28:41",
  },
  {
    id: "al-03",
    severity: "warning",
    message: "Camera offline for over 15 minutes",
    zone: "South Access Road",
    time: "14:14:56",
  },
  {
    id: "al-04",
    severity: "info",
    message: "Vehicle detected approaching checkpoint",
    zone: "North Fence, Sector A",
    time: "14:03:12",
  },
  {
    id: "al-05",
    severity: "info",
    message: "Scheduled patrol drone launched",
    zone: "East Watchtower",
    time: "13:47:29",
  },
];

export const systemServices: SystemService[] = [
  {
    id: "svc-01",
    name: "Video ingestion pipeline",
    description: "Receives and buffers live feeds from all edge cameras",
    state: "operational",
    uptime: "99.98%",
  },
  {
    id: "svc-02",
    name: "Detection engine",
    description: "Runs person and vehicle detection on incoming frames",
    state: "operational",
    uptime: "99.91%",
  },
  {
    id: "svc-03",
    name: "Alert dispatcher",
    description: "Routes triggered alerts to the command console",
    state: "operational",
    uptime: "99.95%",
  },
  {
    id: "svc-04",
    name: "River Crossing link",
    description: "Network uplink for the River Crossing camera cluster",
    state: "degraded",
    uptime: "94.20%",
  },
  {
    id: "svc-05",
    name: "South Access Road link",
    description: "Network uplink for the South Access Road camera",
    state: "offline",
    uptime: "81.44%",
  },
  {
    id: "svc-06",
    name: "Storage & retention",
    description: "Archives footage clips tied to flagged events",
    state: "operational",
    uptime: "99.99%",
  },
];
