export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return <span className={"badge " + String(value).toLowerCase().replace(/_/g, "-")}>{label ?? String(value).replace(/_/g, " ")}</span>;
}
