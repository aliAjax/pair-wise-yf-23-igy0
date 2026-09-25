export interface Fixture {
  id: number;
  fixture_code: string;
  fixture_type: string;
  position_x: string;
  position_y: string;
  dmx_address: string;
  channel_count: number;
  color_mode: string;
  /** 额定色温（K），调整时只重算引用它的未发布 Cue */
  rated_cct_k: number;
  /** 最近两次实测色温（K），新读数追加在末尾，最多保留两条 */
  measured_cct_k: number[];
}
