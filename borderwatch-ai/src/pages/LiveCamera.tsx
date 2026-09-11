import { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, Loader2, AlertTriangle } from "lucide-react";
import { useRoster } from "../context/RosterContext";
import { detectAndMatch, loadFaceModels } from "../lib/faceRecognition";

type CameraState = "idle" | "starting" | "loading-models" | "running" | "error";

export default function LiveCamera() {
  const { roster } = useRoster();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [state, setState] = useState<CameraState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastLabels, setLastLabels] = useState<string[]>([]);

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setState("idle");
    setLastLabels([]);
  };

  const startCamera = async () => {
    setErrorMsg("");
    setState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState("loading-models");
      await loadFaceModels();

      setState("running");
      runDetectionLoop();
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser and try again."
          : "Couldn't access the camera. Make sure no other app is using it.";
      setErrorMsg(message);
      setState("error");
    }
  };

  const runDetectionLoop = () => {
    const tick = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      try {
        const matches = await detectAndMatch(video, roster);
        setLastLabels(matches.map((m) => m.label));

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // scale line/font sizes relative to the actual video resolution so
          // the overlay stays readable at any camera resolution
          const scale = canvas.width / 640;

          for (const match of matches) {
            const isKnown = match.label !== "Unknown";
            const color = isKnown ? "#34d38c" : "#e7a13a";

            ctx.strokeStyle = color;
            ctx.lineWidth = 4 * scale;
            ctx.strokeRect(match.box.x, match.box.y, match.box.width, match.box.height);

            const label = isKnown ? match.label : "UNKNOWN";
            const fontSize = Math.round(22 * scale);
            ctx.font = `700 ${fontSize}px JetBrains Mono, monospace`;
            const textWidth = ctx.measureText(label).width;
            const padX = 10 * scale;
            const bannerHeight = fontSize + 14 * scale;

            ctx.fillStyle = color;
            ctx.fillRect(
              match.box.x,
              match.box.y - bannerHeight,
              textWidth + padX * 2,
              bannerHeight,
            );
            ctx.fillStyle = "#0a0d11";
            ctx.fillText(label, match.box.x + padX, match.box.y - bannerHeight / 2 + fontSize / 3);
          }
        }
      } catch {
        // skip this frame silently, keep the loop alive
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
  };

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {roster.length === 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-signal/25 bg-signal/10 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-signal" />
          <p className="text-sm text-ink">
            No one is enrolled yet, so every detected face will show as{" "}
            <span className="font-mono">Unknown</span>. Add your team on the Team
            Roster page first for named matches.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-line bg-panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Live webcam feed</h2>
            <p className="text-xs text-ink-faint">
              Detection and matching run locally in your browser
            </p>
          </div>
          {state === "idle" || state === "error" ? (
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-2 rounded-md border border-active/40 bg-active/10 px-4 py-2 text-sm font-medium text-active hover:bg-active/20"
            >
              <CameraIcon size={15} />
              Start camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="inline-flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-medium text-danger hover:bg-danger/20"
            >
              Stop camera
            </button>
          )}
        </div>

        {errorMsg && (
          <p className="mb-3 rounded-md border border-danger/25 bg-danger/10 px-3 py-2 text-xs text-danger">
            {errorMsg}
          </p>
        )}

        <div className="relative aspect-[4/3] max-h-[70vh] overflow-hidden rounded-md border border-line bg-base-raised sm:aspect-video">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />

          {(state === "starting" || state === "loading-models") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-base/90 text-ink-dim">
              <Loader2 size={22} className="animate-spin" />
              <p className="font-mono text-xs">
                {state === "starting" ? "Requesting camera access…" : "Loading recognition model…"}
              </p>
            </div>
          )}

          {state === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-faint">
              <CameraIcon size={26} />
              <p className="font-mono text-xs">Camera is off</p>
            </div>
          )}
        </div>

        {state === "running" && (
          <p
            className={`mt-3 font-mono text-sm ${
              lastLabels.length === 0 ? "text-ink-faint" : "text-active"
            }`}
          >
            {lastLabels.length === 0
              ? "No face detected in frame — face a light source, not a bright window behind you"
              : `Detected: ${lastLabels.join(", ")}`}
          </p>
        )}
      </div>
    </div>
  );
}
