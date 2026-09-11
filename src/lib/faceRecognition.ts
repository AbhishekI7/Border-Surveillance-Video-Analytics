import * as faceapi from "face-api.js";

// import.meta.env.BASE_URL matches vite.config.ts's `base` setting — "/" locally,
// "/Border-Surveillance-Video-Analytics/" on GitHub Pages. Using it here (instead of
// a hardcoded "/models") keeps this working in both places without edits.
const MODEL_URL = `${import.meta.env.BASE_URL}models`;

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Loads the three models we need, once. Safe to call repeatedly —
 * subsequent calls reuse the same in-flight or completed promise.
 */
export function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]).then(() => {
    modelsLoaded = true;
  });

  return loadingPromise;
}

export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

/**
 * Shared detector tuning. A bigger inputSize and lower scoreThreshold catches
 * faces in harder conditions (backlighting, dim rooms, slight angles) at the
 * cost of a bit more compute per frame — worth it for a demo where reliability
 * matters more than squeezing out max FPS.
 */
function detectorOptions() {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize: 608,
    scoreThreshold: 0.3,
  });
}

export interface RosterMember {
  id: string;
  name: string;
  /** Data URL of one enrollment photo, kept only for showing a thumbnail. */
  imageDataUrl: string;
  /** One 128-length descriptor per enrollment capture — more captures, more reliable matching. */
  descriptors: Float32Array[];
}

/**
 * Runs face detection + descriptor extraction on a single image.
 * Returns null if no face was found in the photo.
 */
export async function computeDescriptorFromImage(
  image: HTMLImageElement,
): Promise<Float32Array | null> {
  const detection = await faceapi
    .detectSingleFace(image, detectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  return detection ? detection.descriptor : null;
}

export interface LiveMatch {
  box: { x: number; y: number; width: number; height: number };
  label: string;
  distance: number;
}

const MATCH_THRESHOLD = 0.55; // lower distance = more confident match; face-api's typical cutoff

/**
 * Detects all faces in a video frame and matches each against the roster.
 * Each roster member may have several descriptors (one per enrollment capture);
 * we compare against all of them and keep the closest one.
 */
export async function detectAndMatch(
  video: HTMLVideoElement,
  roster: RosterMember[],
): Promise<LiveMatch[]> {
  const detections = await faceapi
    .detectAllFaces(video, detectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptors();

  return detections.map((d) => {
    let bestLabel = "Unknown";
    let bestDistance = Infinity;

    for (const member of roster) {
      for (const descriptor of member.descriptors) {
        const distance = faceapi.euclideanDistance(d.descriptor, descriptor);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestLabel = member.name;
        }
      }
    }

    const isMatch = bestDistance < MATCH_THRESHOLD;

    return {
      box: {
        x: d.detection.box.x,
        y: d.detection.box.y,
        width: d.detection.box.width,
        height: d.detection.box.height,
      },
      label: isMatch ? bestLabel : "Unknown",
      distance: bestDistance,
    };
  });
}
