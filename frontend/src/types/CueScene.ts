export interface CueScene {
  id: number;
  name: string;
  fixture_states: string;
  fade_in_ms: string;
  hold_ms: string;
  priority: string;
  scene_status: string;
  /** 目标色温（K）；为 null 时取关联灯具额定色温的均值 */
  target_cct_k: number | null;
  /** 允许偏差（K） */
  cct_tolerance_k: number;
  /** 关联灯具 id 列表 */
  fixture_ids: number[];
  /** 最近一次色温校验快照：UNCHECKED / PASSED / BLOCKED */
  cct_check_status: string;
  /** 校验明细，被拦截时点名具体灯具 */
  cct_check_detail: string;
  /** 校验时间（ISO 字符串），空串表示尚未校验 */
  cct_checked_at: string;
}
