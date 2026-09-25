export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "SPOT-01",
      "fixture_type": "SPOT",
      "position_x": "position x 1",
      "position_y": "position y 1",
      "dmx_address": "dmx address 1",
      "channel_count": "channel count 1",
      "color_mode": "color mode 1",
      "rated_cct_k": 3200,
      "measured_cct_k": [3180, 3195]
    },
    {
      "id": 2,
      "fixture_code": "WASH-02",
      "fixture_type": "WASH",
      "position_x": "position x 2",
      "position_y": "position y 2",
      "dmx_address": "dmx address 2",
      "channel_count": "channel count 2",
      "color_mode": "color mode 2",
      "rated_cct_k": 5600,
      "measured_cct_k": [5470, 5615]
    },
    {
      "id": 3,
      "fixture_code": "BEAM-03",
      "fixture_type": "BEAM",
      "position_x": "position x 3",
      "position_y": "position y 3",
      "dmx_address": "dmx address 3",
      "channel_count": "channel count 3",
      "color_mode": "color mode 3",
      "rated_cct_k": 4000,
      "measured_cct_k": [3985]
    },
    {
      "id": 4,
      "fixture_code": "PAR-04",
      "fixture_type": "PAR",
      "position_x": "position x 4",
      "position_y": "position y 4",
      "dmx_address": "dmx address 4",
      "channel_count": "channel count 4",
      "color_mode": "color mode 4",
      "rated_cct_k": 3200,
      "measured_cct_k": [3210, 3225]
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "暖光开场",
      "fixture_states": "fixture states 1",
      "fade_in_ms": "fade in ms 1",
      "hold_ms": "hold ms 1",
      "priority": "priority 1",
      "scene_status": "READY",
      "target_cct_k": 3200,
      "cct_tolerance_k": 150,
      "fixture_ids": [1, 4],
      "cct_check_status": "PASSED",
      "cct_check_detail": "",
      "cct_checked_at": "2026-09-20T10:00:00Z"
    },
    {
      "id": 2,
      "name": "冷色逆光",
      "fixture_states": "fixture states 2",
      "fade_in_ms": "fade in ms 2",
      "hold_ms": "hold ms 2",
      "priority": "priority 2",
      "scene_status": "DRAFT",
      "target_cct_k": 5600,
      "cct_tolerance_k": 200,
      "fixture_ids": [2],
      "cct_check_status": "UNCHECKED",
      "cct_check_detail": "",
      "cct_checked_at": ""
    },
    {
      "id": 3,
      "name": "混合面光",
      "fixture_states": "fixture states 3",
      "fade_in_ms": "fade in ms 3",
      "hold_ms": "hold ms 3",
      "priority": "priority 3",
      "scene_status": "DRAFT",
      "target_cct_k": null,
      "cct_tolerance_k": 120,
      "fixture_ids": [1, 2, 3],
      "cct_check_status": "UNCHECKED",
      "cct_check_detail": "",
      "cct_checked_at": ""
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": "start ms 1",
      "duration_ms": "duration ms 1",
      "layer": "layer 1",
      "locked": "locked 1"
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": "start ms 2",
      "duration_ms": "duration ms 2",
      "layer": "layer 2",
      "locked": "locked 2"
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": "start ms 3",
      "duration_ms": "duration ms 3",
      "layer": "layer 3",
      "locked": "locked 3"
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "title 1",
      "venue_name": "venue name 1",
      "fixture_ids": [
        1,
        2
      ],
      "track_ids": [
        1,
        2
      ],
      "updated_at": "2026-06-11T09:00:00Z"
    },
    {
      "id": 2,
      "title": "title 2",
      "venue_name": "venue name 2",
      "fixture_ids": [
        1,
        2
      ],
      "track_ids": [
        1,
        2
      ],
      "updated_at": "2026-06-12T09:00:00Z"
    },
    {
      "id": 3,
      "title": "title 3",
      "venue_name": "venue name 3",
      "fixture_ids": [
        1,
        2
      ],
      "track_ids": [
        1,
        2
      ],
      "updated_at": "2026-06-13T09:00:00Z"
    }
  ]
} as const;
