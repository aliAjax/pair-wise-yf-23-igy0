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
      "rated_color_temp": 3200,
      "measured_temps": [3204, 3196]
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
      "rated_color_temp": 3200,
      "measured_temps": [3310, 3170]
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
      "rated_color_temp": 3200,
      "measured_temps": [3180]
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
      "rated_color_temp": 3200,
      "measured_temps": [3412, 3408]
    },
    {
      "id": 5,
      "fixture_code": "STROBE-05",
      "fixture_type": "STROBE",
      "position_x": "position x 5",
      "position_y": "position y 5",
      "dmx_address": "dmx address 5",
      "channel_count": "channel count 5",
      "color_mode": "color mode 5",
      "rated_color_temp": 6500,
      "measured_temps": [6510, 6490]
    },
    {
      "id": 6,
      "fixture_code": "WASH-06",
      "fixture_type": "WASH",
      "position_x": "position x 6",
      "position_y": "position y 6",
      "dmx_address": "dmx address 6",
      "channel_count": "channel count 6",
      "color_mode": "color mode 6",
      "rated_color_temp": 3200,
      "measured_temps": []
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "大幕开场",
      "fixture_states": "fixture states 1",
      "fade_in_ms": "fade in ms 1",
      "hold_ms": "hold ms 1",
      "priority": "priority 1",
      "scene_status": "READY",
      "target_color_temp": 3200,
      "tolerance_k": 150,
      "fixture_ids": [1],
      "calibration_results": [
        { "fixture_id": 1, "rated_color_temp": 3400, "correction_k": -200 }
      ]
    },
    {
      "id": 2,
      "name": "独白聚光",
      "fixture_states": "fixture states 2",
      "fade_in_ms": "fade in ms 2",
      "hold_ms": "hold ms 2",
      "priority": "priority 2",
      "scene_status": "DRAFT",
      "target_color_temp": 3200,
      "tolerance_k": 150,
      "fixture_ids": [1, 2, 3],
      "calibration_results": [
        { "fixture_id": 1, "rated_color_temp": 3200, "correction_k": 0 },
        { "fixture_id": 2, "rated_color_temp": 3200, "correction_k": 0 },
        { "fixture_id": 3, "rated_color_temp": 3200, "correction_k": 0 }
      ]
    },
    {
      "id": 3,
      "name": "冷色逆光",
      "fixture_states": "fixture states 3",
      "fade_in_ms": "fade in ms 3",
      "hold_ms": "hold ms 3",
      "priority": "priority 3",
      "scene_status": "DRAFT",
      "target_color_temp": 3200,
      "tolerance_k": 100,
      "fixture_ids": [4, 5],
      "calibration_results": [
        { "fixture_id": 4, "rated_color_temp": 3200, "correction_k": 0 },
        { "fixture_id": 5, "rated_color_temp": 6500, "correction_k": -3300 }
      ]
    },
    {
      "id": 4,
      "name": "频闪高潮",
      "fixture_states": "fixture states 4",
      "fade_in_ms": "fade in ms 4",
      "hold_ms": "hold ms 4",
      "priority": "priority 4",
      "scene_status": "DRAFT",
      "target_color_temp": 6500,
      "tolerance_k": 200,
      "fixture_ids": [5],
      "calibration_results": [
        { "fixture_id": 5, "rated_color_temp": 6500, "correction_k": 0 }
      ]
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
