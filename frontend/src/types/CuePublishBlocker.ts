export const CuePublishBlockReason = ["INSUFFICIENT_DATA","WARMING_UP","OUT_OF_TOLERANCE"] as const;
export type CuePublishBlockReason = (typeof CuePublishBlockReason)[number];

export interface CuePublishBlocker {
  fixture_id: number;
  fixture_code: string;
  reason: CuePublishBlockReason;
  stable_color_temp: number | null;
  deviation_k: number | null;
}
