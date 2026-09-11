export default function DemoModeBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-signal/40 bg-signal/10 px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
      </span>
      <span className="font-mono text-xs font-semibold tracking-wide text-signal">
        DEMO MODE — Simulated data, no live feeds
      </span>
    </div>
  );
}
