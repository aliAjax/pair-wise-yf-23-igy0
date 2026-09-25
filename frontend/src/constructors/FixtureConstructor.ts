import type { Fixture } from "../types/Fixture";

export const createDefaultFixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  id: 1 as never,
  fixture_code: "fixture code 1" as never,
  fixture_type: "SPOT" as never,
  position_x: "position x 1" as never,
  position_y: "position y 1" as never,
  dmx_address: "dmx address 1" as never,
  channel_count: "channel count 1" as never,
  color_mode: "color mode 1" as never,
  rated_color_temp: 3200,
  measured_temps: [],
  ...overrides
});

export const createFixtureForm = createDefaultFixture;
export const createFixtureResponse = createDefaultFixture;
