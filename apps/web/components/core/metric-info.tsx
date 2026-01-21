export function MetricInfo({
  label,
  value,
  sub = "",
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex w-full flex-col">
      <span className="text-muted-foreground">{label}</span>
      <div className="inline-flex gap-2">
        <p className="font-medium text-sm">{value}</p>
        <span className="text-muted-foreground text-sm">{sub}</span>
      </div>
    </div>
  );
}
