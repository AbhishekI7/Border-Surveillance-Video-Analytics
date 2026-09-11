# BorderWatch AI — Smart Border Surveillance (Demo Frontend)

A frontend dashboard prototype for a smart border surveillance system, built for Smart India Hackathon (SIH). This is **demo mode only** — every number, camera feed, and alert on screen is mock data. There is no backend and no real AI/CV model wired in yet.

## Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- React Router (page navigation)
- lucide-react (icons)

## What's included

- **Sidebar navigation** — Overview, Cameras, Live Camera, Team Roster, System Status
- **Overview page** — active camera count, person/vehicle detection counts, 4 camera feed placeholders, recent alerts
- **Cameras page** — camera tiles plus a full registry table (zone, status, counts, last event)
- **Live Camera page** — opens your device's actual webcam and runs real face detection/recognition against your enrolled team roster, entirely in the browser
- **Team Roster page** — upload a photo per person to enroll them for recognition
- **System Status page** — health of each backend service (all mocked) with uptime figures
- **DEMO MODE badge** — always visible in the top bar so nobody mistakes this for a live feed
- Fully responsive: sidebar collapses into a mobile menu below the `lg` breakpoint

All mock data (cameras, alerts, system services) lives in one place: `src/data/mockData.ts`. Edit that file to change cameras, alerts, or service status — the rest of the app reads from it.

### Live Camera & Team Roster — how it works

This part is **real**, not mock data:

- Enroll people on the **Team Roster** page — either by turning on your webcam and clicking "Capture 4 photos" (default; it takes a short burst so matching is more reliable than a single photo), or by switching to "Upload photo" if you'd rather use an existing image file. Either way, the app detects the face and stores it in memory — nothing is uploaded anywhere.
- **Lighting matters.** Face the person toward a light source, not away from one — if there's a bright window or light behind them, the camera will underexpose their face and detection will fail. Even, front-facing light works best.
- On slower or integrated GPUs, each detection pass can take a moment — the burst capture and live camera may feel less instant on lower-end laptops than on a high-end one. This is normal for in-browser AI.
- On the **Live Camera** page, click "Start camera" to open your device's webcam (your browser will ask for permission). Every video frame is checked for faces, and each detected face is compared against your enrolled roster. A green box + name means a match; an amber box + "Unknown" means no match.
- This uses [face-api.js](https://github.com/justadudewhohacks/face-api.js), which runs entirely client-side using TensorFlow.js. The model files live in `public/models`.
- Enrolled people and the roster are **not saved** between page reloads (in-memory only) — this keeps things simple for a demo. If you need it to persist, that's a small addition (e.g. saving to `localStorage`).
- The webcam requires the site to be served over HTTPS or from `localhost` — Render serves everything over HTTPS by default, so this works fine once deployed too.

### Adding a real recorded video to a camera tile

The 4 camera tiles on Overview/Cameras show a simulated placeholder by default. To show an actual video file instead:

1. Put your video file in `public/videos/`, e.g. `public/videos/north-fence.mp4`.
2. In `src/data/mockData.ts`, add a `videoSrc` field to that camera's entry:
   ```ts
   {
     id: "cam-01",
     name: "CAM-01",
     // ...other fields
     videoSrc: "/videos/north-fence.mp4",
   },
   ```
3. The tile will automatically play that video on loop instead of the placeholder.

## Run it locally

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

To build a production bundle locally:

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to the `dist/` folder.

## Deploying to Render

This repo already includes a `render.yaml` so Render can pick up the settings automatically (Blueprint deploy). If you'd rather set it up by hand in the dashboard, use these settings when creating a new **Static Site**:

1. Push this project to a GitHub (or GitLab) repository.
2. In the Render dashboard, click **New > Static Site** and connect that repository.
3. Set:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Click **Create Static Site**. Render will build and give you a live URL.

Because this is a single-page app with client-side routing (`/cameras`, `/system`), Render needs to serve `index.html` for any path it doesn't recognize as a file. The included `render.yaml` already sets up that rewrite rule. If you configure the site manually instead of via `render.yaml`, add a rewrite rule in **Settings > Redirects/Rewrites**:

- Source: `/*`
- Destination: `/index.html`
- Action: Rewrite

Without this, refreshing the page on `/cameras` or `/system` directly will 404.

## Project structure

```
src/
  components/    Reusable UI pieces (Sidebar, TopBar, StatCard, CameraTile, AlertsPanel, StatusPill, DemoModeBadge)
  pages/         One file per route (Overview, Cameras, LiveCamera, TeamRoster, SystemStatus)
  context/       RosterContext — shares enrolled faces between Team Roster and Live Camera pages
  lib/           faceRecognition.ts — face-api.js wrapper (model loading, descriptor matching)
  data/          Mock data (mockData.ts)
  types/         Shared TypeScript types
  App.tsx        Routing and page layout shell
  index.css      Tailwind import + design tokens (colors, fonts)
public/
  models/        face-api.js pretrained model weights (loaded at runtime, not bundled)
  videos/        Drop real camera footage here to replace a placeholder tile
```

## Next steps (beyond this prototype)

- Replace `src/data/mockData.ts` with real API calls once a backend exists
- Swap the camera placeholder tiles for actual `<video>` / stream players
- Wire the detection counts to a real computer-vision pipeline
- Add authentication if this will be used by more than one operator
