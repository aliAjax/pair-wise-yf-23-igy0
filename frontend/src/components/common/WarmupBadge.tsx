import { StatusBadge } from "./StatusBadge";
import { WarmupStatusText } from "../../constants/WarmupStatus";
import type { WarmupStatus } from "../../types/WarmupStatus";

export function WarmupBadge({ status }: { status: WarmupStatus }) {
  return <StatusBadge value={status} label={WarmupStatusText[status]} />;
}
