import { useEffect, useRef, useState } from "react";
import {
  UserPlus,
  Trash2,
  Loader2,
  CheckCircle2,
  Camera as CameraIcon,
  Upload,
} from "lucide-react";
import { useRoster } from "../context/RosterContext";
import { computeDescriptorFromImage, loadFaceModels } from "../lib/faceRecognition";

type EnrollMode = "upload" | "camera";
type Status = "idle" | "loading-models" | "processing" | "error";

const BURST_SHOTS = 4;
const BURST_INTERVAL_MS = 350;

export default function TeamRoster() {
  const { roster, addMember, removeMember } = useRoster();
  const [mode, setMode] = useState<EnrollMode>("camera");
  const [name, setName] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [capturedDescriptors, setCapturedDescriptors] = useState<Float32Array[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // webcam refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [burstProgress, setBurstProgress] = useState<{ current: number; total: number } | null>(
    null,
  );

  useEffect(() => {
    loadFaceModels().catch(() => {
      /* surfaced later if enrollment is attempted */
    });
  }, []);

  useEffect(() => {
    if (mode !== "camera") stopCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setCameraError(
        "Couldn't access the camera. Allow camera permission in your browser and try again.",
      );
    }
  };

  const grabFrameDataUrl = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  };

  const runBurstCapture = async () => {
    setErrorMsg("");
    setStatus("loading-models");
    await loadFaceModels().catch(() => {});
    setStatus("processing");

    const descriptors: Float32Array[] = [];
    let lastGoodFrame: string | null = null;

    for (let i = 0; i < BURST_SHOTS; i++) {
      setBurstProgress({ current: i + 1, total: BURST_SHOTS });
      const dataUrl = grabFrameDataUrl();
      if (dataUrl) {
        try {
          const image = await dataUrlToImage(dataUrl);
          const descriptor = await computeDescriptorFromImage(image);
          if (descriptor) {
            descriptors.push(descriptor);
            lastGoodFrame = dataUrl;
          }
        } catch {
          // skip this frame, keep going
        }
      }
      if (i < BURST_SHOTS - 1) {
        await new Promise((r) => setTimeout(r, BURST_INTERVAL_MS));
      }
    }

    setBurstProgress(null);

    if (descriptors.length === 0) {
      setErrorMsg(
        "Couldn't find a face in any of the shots. Move closer to a light source (don't stand in front of a bright window) and try again.",
      );
      setStatus("error");
      return;
    }

    setCapturedDescriptors(descriptors);
    setPreview(lastGoodFrame);
    setStatus("idle");
  };

  const retake = () => {
    setPreview(null);
    setCapturedDescriptors([]);
    setErrorMsg("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setErrorMsg("");
    setUploadFile(selected);
    if (!selected) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const handleEnroll = async () => {
    if (!name.trim()) return;

    // camera mode already has descriptors ready from the burst capture
    if (mode === "camera") {
      if (capturedDescriptors.length === 0 || !preview) return;
      addMember({
        id: crypto.randomUUID(),
        name: name.trim(),
        imageDataUrl: preview,
        descriptors: capturedDescriptors,
      });
      resetForm();
      return;
    }

    // upload mode computes a single descriptor at enroll time
    if (!preview) return;
    setErrorMsg("");
    setStatus("loading-models");
    try {
      await loadFaceModels();
      setStatus("processing");
      const image = await dataUrlToImage(preview);
      const descriptor = await computeDescriptorFromImage(image);

      if (!descriptor) {
        setErrorMsg(
          "No face was detected in that photo. Try a clear, front-facing photo with good, even lighting.",
        );
        setStatus("error");
        return;
      }

      addMember({
        id: crypto.randomUUID(),
        name: name.trim(),
        imageDataUrl: preview,
        descriptors: [descriptor],
      });
      resetForm();
    } catch {
      setErrorMsg("Something went wrong processing that photo. Try again.");
      setStatus("error");
    }
  };

  const resetForm = () => {
    setName("");
    setPreview(null);
    setUploadFile(null);
    setCapturedDescriptors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setStatus("idle");
  };

  const isBusy = status === "loading-models" || status === "processing";
  const canEnroll =
    !!name.trim() &&
    !isBusy &&
    (mode === "camera" ? capturedDescriptors.length > 0 : !!uploadFile && !!preview);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-line bg-panel p-5">
        <h2 className="text-sm font-semibold text-ink">Enroll a team member</h2>
        <p className="mt-1 text-sm text-ink-dim">
          Capture a few photos with your webcam, or upload one. This runs entirely in
          your browser — nothing is uploaded anywhere.
        </p>

        <div className="mt-4 inline-flex rounded-md border border-line bg-base-raised p-1">
          <button
            onClick={() => {
              setMode("camera");
              setPreview(null);
              setCapturedDescriptors([]);
              setErrorMsg("");
            }}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "camera" ? "bg-signal/15 text-signal" : "text-ink-dim hover:text-ink"
            }`}
          >
            <CameraIcon size={14} />
            Use webcam
          </button>
          <button
            onClick={() => {
              setMode("upload");
              setPreview(null);
              setCapturedDescriptors([]);
              setErrorMsg("");
            }}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "upload" ? "bg-signal/15 text-signal" : "text-ink-dim hover:text-ink"
            }`}
          >
            <Upload size={14} />
            Upload photo
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="w-full shrink-0 sm:w-64">
            {mode === "camera" ? (
              preview ? (
                <div className="space-y-2">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md border border-active/40">
                    <img src={preview} alt="Captured" className="h-full w-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 bg-black/60 px-2 py-1">
                      <CheckCircle2 size={12} className="text-active" />
                      <span className="font-mono text-[11px] text-active">
                        {capturedDescriptors.length} sample
                        {capturedDescriptors.length === 1 ? "" : "s"} captured
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={retake}
                    className="w-full rounded-md border border-line bg-base-raised px-3 py-1.5 text-xs font-medium text-ink-dim hover:bg-panel-hover"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative aspect-square w-full overflow-hidden rounded-md border border-line bg-base-raised">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                    {!cameraOn && (
                      <div className="absolute inset-0 flex items-center justify-center text-ink-faint">
                        <CameraIcon size={22} />
                      </div>
                    )}
                    {burstProgress && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70">
                        <Loader2 size={20} className="animate-spin text-signal" />
                        <p className="font-mono text-xs text-signal">
                          Capturing {burstProgress.current}/{burstProgress.total}…
                        </p>
                      </div>
                    )}
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                  {cameraError && <p className="text-xs text-danger">{cameraError}</p>}
                  {cameraOn ? (
                    <button
                      onClick={runBurstCapture}
                      disabled={isBusy}
                      className="w-full rounded-md border border-active/40 bg-active/10 px-3 py-1.5 text-xs font-medium text-active hover:bg-active/20 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Capture {BURST_SHOTS} photos
                    </button>
                  ) : (
                    <button
                      onClick={startCamera}
                      className="w-full rounded-md border border-line bg-base-raised px-3 py-1.5 text-xs font-medium text-ink-dim hover:bg-panel-hover"
                    >
                      Turn on camera
                    </button>
                  )}
                  <p className="text-[11px] leading-snug text-ink-faint">
                    Face a light source, not a bright window behind you — backlighting
                    makes faces too dark to detect.
                  </p>
                </div>
              )
            ) : (
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-md border border-line bg-base-raised sm:h-64 sm:w-64">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <UserPlus className="text-ink-faint" size={24} />
                )}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-ink-dim">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full rounded-md border border-line bg-base-raised px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-signal/50 focus:outline-none"
              />
            </div>

            {mode === "upload" && (
              <div>
                <label className="mb-1 block text-xs text-ink-dim">Photo</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-ink-dim file:mr-3 file:rounded-md file:border file:border-line file:bg-base-raised file:px-3 file:py-1.5 file:text-sm file:text-ink hover:file:bg-panel-hover"
                />
              </div>
            )}

            {errorMsg && <p className="text-xs text-danger">{errorMsg}</p>}

            <button
              onClick={handleEnroll}
              disabled={!canEnroll}
              className="inline-flex items-center gap-2 rounded-md border border-signal/40 bg-signal/10 px-4 py-2 text-sm font-medium text-signal transition-colors hover:bg-signal/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBusy ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {status === "loading-models" ? "Loading model…" : "Reading face…"}
                </>
              ) : (
                <>
                  <UserPlus size={15} />
                  Enroll
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Enrolled roster</h2>
          <span className="font-mono text-xs text-ink-faint">{roster.length} enrolled</span>
        </div>

        {roster.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-faint">
            Nobody enrolled yet. Add your team above, then head to Live Camera to test
            recognition.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-4">
            {roster.map((member) => (
              <li
                key={member.id}
                className="group relative overflow-hidden rounded-md border border-line bg-base-raised"
              >
                <img
                  src={member.imageDataUrl}
                  alt={member.name}
                  className="aspect-square w-full object-cover"
                />
                <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                  <span className="truncate text-xs font-medium text-ink">{member.name}</span>
                  <span className="flex shrink-0 items-center gap-1 text-active">
                    <CheckCircle2 size={13} />
                    <span className="font-mono text-[10px]">{member.descriptors.length}</span>
                  </span>
                </div>
                <button
                  onClick={() => removeMember(member.id)}
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-ink opacity-0 transition-opacity hover:bg-danger/80 group-hover:opacity-100"
                  aria-label={`Remove ${member.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}
