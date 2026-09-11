interface StatusPillProps {
  label: string;
  tone: "active" | "signal" | "danger" | "neutral";
}

const toneStyles: Record<StatusPillProps["tone"], string> = {
  active: "bg-active/10 text-active border-active/30",
  signal: "bg-signal/10 text-signal border-signal/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  neutral: "bg-ink-faint/10 text-ink-dim border-line",
};

const dotStyles: Record<StatusPillProps["tone"], string> = {
  active: "bg-active",
  signal: "bg-signal",
  danger: "bg-danger",
  neutral: "bg-ink-faint",
};

export default function StatusPill({ label, tone }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium font-mono ${toneStyles[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[tone]}`} />
      {label}
    </span>
  );
}
