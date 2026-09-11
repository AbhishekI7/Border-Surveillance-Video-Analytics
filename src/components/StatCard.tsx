import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "signal" | "active" | "vehicle" | "danger";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  signal: "text-signal bg-signal/10 border-signal/25",
  active: "text-active bg-active/10 border-active/25",
  vehicle: "text-vehicle bg-vehicle/10 border-vehicle/25",
  danger: "text-danger bg-danger/10 border-danger/25",
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "signal",
}: StatCardProps) {
  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-dim">{label}</p>
        <div className={`rounded-md border p-1.5 ${toneStyles[tone]}`}>
          <Icon size={16} strokeWidth={2.2} />
        </div>
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-faint">{hint}</p>
    </div>
  );
}
