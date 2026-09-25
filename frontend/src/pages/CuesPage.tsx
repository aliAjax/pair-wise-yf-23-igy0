import { useEffect, useMemo, useState } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { WarmupBadge } from "../components/common/WarmupBadge";
import { evaluateCuePublish, getStableColorTemp, getWarmupStatus } from "../utils/colorTemperature";
import { formatColorTemp, formatSignedKelvin } from "../utils/formatters";
import { CuePublishBlockReasonText, WarmupStatusText } from "../constants/WarmupStatus";
import { WARMUP_DRIFT_THRESHOLD_K } from "../constants/ColorTempRule";
import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";

const PUBLISHED_STATUS = "READY";

export function CuesPage() {
  const fixtures = useFixtureStore((state) => state.rows);
  const cues = useCueSceneStore((state) => state.rows);
  const recordMeasurement = useFixtureStore((state) => state.recordMeasurement);
  const updateRatedTemp = useFixtureStore((state) => state.updateRatedTemp);
  const updateColorTempSettings = useCueSceneStore((state) => state.updateColorTempSettings);
  const publishCue = useCueSceneStore((state) => state.publishCue);

  const [readingInputs, setReadingInputs] = useState<Record<number, string>>({});
  const [ratedInputs, setRatedInputs] = useState<Record<number, string>>({});
  const [targetInputs, setTargetInputs] = useState<Record<number, string>>({});
  const [toleranceInputs, setToleranceInputs] = useState<Record<number, string>>({});
  const [fixtureErrors, setFixtureErrors] = useState<Record<number, string>>({});
  const [cueMessages, setCueMessages] = useState<Record<number, { ok: boolean; text: string }>>({});

  useEffect(() => {
    void useFixtureStore.getState().load();
    void useCueSceneStore.getState().load();
  }, []);

  const fixtureById = useMemo(() => new Map(fixtures.map((fixture) => [fixture.id, fixture])), [fixtures]);
  const unstableCount = useMemo(() => fixtures.filter((fixture) => getWarmupStatus(fixture) !== "STABLE").length, [fixtures]);
  const publishedCount = useMemo(() => cues.filter((cue) => cue.scene_status === PUBLISHED_STATUS).length, [cues]);

  const commitReading = (fixture: Fixture) => {
    const error = recordMeasurement(fixture.id, Number(readingInputs[fixture.id] ?? ""));
    setFixtureErrors((prev) => ({ ...prev, [fixture.id]: error ?? "" }));
    if (!error) setReadingInputs((prev) => ({ ...prev, [fixture.id]: "" }));
  };

  const commitRated = (fixture: Fixture) => {
    const error = updateRatedTemp(fixture.id, Number(ratedInputs[fixture.id] ?? fixture.rated_color_temp));
    setFixtureErrors((prev) => ({ ...prev, [fixture.id]: error ?? "" }));
  };

  const commitSettings = (cue: CueScene) => {
    const target = Number(targetInputs[cue.id] ?? cue.target_color_temp);
    const tolerance = Number(toleranceInputs[cue.id] ?? cue.tolerance_k);
    const error = updateColorTempSettings(cue.id, target, tolerance, fixtures);
    setCueMessages((prev) => ({
      ...prev,
      [cue.id]: error ? { ok: false, text: error } : { ok: true, text: "目标已保存，关联灯具校正量已重算" }
    }));
  };

  const handlePublish = (cue: CueScene) => {
    const result = publishCue(cue.id, fixtures);
    if (result.ok) {
      setCueMessages((prev) => ({ ...prev, [cue.id]: { ok: true, text: "发布成功，校正快照已冻结" } }));
      return;
    }
    const names = result.blockers
      .map((blocker) => `${blocker.fixture_code}（${CuePublishBlockReasonText[blocker.reason]}）`)
      .join("、");
    setCueMessages((prev) => ({
      ...prev,
      [cue.id]: { ok: false, text: names ? `${result.message}：${names}` : result.message ?? "发布失败" }
    }));
  };

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">stage-light · 色温校正台</p>
        <h1>场景编辑 · 色温校正</h1>
      </div>
      <StatusBadge value="LOCAL_DATA" />
    </section>

    <section className="metrics">
      <StatCard label="灯具总数" value={fixtures.length} />
      <StatCard label="未稳定灯具" value={unstableCount} />
      <StatCard label="已发布 Cue" value={publishedCount} />
    </section>

    <section className="panel">
      <h2>灯具色温实测与预热</h2>
      <p className="muted">最近两次实测相差超过 {WARMUP_DRIFT_THRESHOLD_K}K 视为预热中，继续预热，暂不生成稳定结果。</p>
      <table className="ktable">
        <thead>
          <tr><th>灯具</th><th>额定色温</th><th>最近两次实测</th><th>预热状态</th><th>稳定结果</th><th>录入读数</th></tr>
        </thead>
        <tbody>
          {fixtures.map((fixture) => {
            const status = getWarmupStatus(fixture);
            const stable = getStableColorTemp(fixture);
            return <tr key={fixture.id}>
              <td><strong>{fixture.fixture_code}</strong> <span className="muted">{fixture.fixture_type}</span></td>
              <td>
                <div className="inline-field">
                  <input
                    className="kinput"
                    type="number"
                    step={50}
                    value={ratedInputs[fixture.id] ?? String(fixture.rated_color_temp)}
                    onChange={(event) => setRatedInputs((prev) => ({ ...prev, [fixture.id]: event.target.value }))}
                  />
                  <button className="btn" onClick={() => commitRated(fixture)}>保存</button>
                </div>
              </td>
              <td>{fixture.measured_temps.length > 0 ? fixture.measured_temps.map(formatColorTemp).join(" / ") : "—"}</td>
              <td><WarmupBadge status={status} /></td>
              <td>{stable === null ? <span className="muted">—（预热中不生成结果）</span> : <strong>{formatColorTemp(stable)}</strong>}</td>
              <td>
                <div className="inline-field">
                  <input
                    className="kinput"
                    type="number"
                    step={10}
                    placeholder="K"
                    value={readingInputs[fixture.id] ?? ""}
                    onChange={(event) => setReadingInputs((prev) => ({ ...prev, [fixture.id]: event.target.value }))}
                  />
                  <button className="btn" onClick={() => commitReading(fixture)}>录入</button>
                </div>
                {fixtureErrors[fixture.id] ? <p className="error-text">{fixtureErrors[fixture.id]}</p> : null}
              </td>
            </tr>;
          })}
        </tbody>
      </table>
    </section>

    <section className="panel">
      <h2>Cue 目标色温与发布</h2>
      <p className="muted">关联灯具全部稳定且落在允许偏差内才可发布；调额定值只重算未发布 Cue，已发布记录不动。</p>
      <div className="cue-grid">
        {cues.map((cue) => {
          const published = cue.scene_status === PUBLISHED_STATUS;
          const blockers = published ? [] : evaluateCuePublish(cue, fixtures);
          const message = cueMessages[cue.id];
          return <article key={cue.id} className="cue-card">
            <div className="cue-card-head">
              <strong>{cue.name}</strong>
              <StatusBadge value={cue.scene_status} label={published ? "已发布" : undefined} />
            </div>

            <div className="inline-field">
              <label className="muted">目标色温</label>
              <input
                className="kinput"
                type="number"
                step={50}
                disabled={published}
                value={targetInputs[cue.id] ?? String(cue.target_color_temp)}
                onChange={(event) => setTargetInputs((prev) => ({ ...prev, [cue.id]: event.target.value }))}
              />
              <label className="muted">允许偏差</label>
              <input
                className="kinput narrow"
                type="number"
                step={10}
                disabled={published}
                value={toleranceInputs[cue.id] ?? String(cue.tolerance_k)}
                onChange={(event) => setToleranceInputs((prev) => ({ ...prev, [cue.id]: event.target.value }))}
              />
              <button className="btn" disabled={published} onClick={() => commitSettings(cue)}>保存目标</button>
            </div>

            <div>
              <p className="muted">关联灯具核对（目标 {formatColorTemp(cue.target_color_temp)} ± {formatColorTemp(cue.tolerance_k)}）</p>
              {cue.fixture_ids.map((fixtureId) => {
                const fixture = fixtureById.get(fixtureId);
                if (!fixture) {
                  return <div key={fixtureId} className="check-line bad"><span>#{fixtureId}</span><span>✗ 灯具记录缺失</span></div>;
                }
                const status = getWarmupStatus(fixture);
                const stable = getStableColorTemp(fixture);
                if (status !== "STABLE" || stable === null) {
                  return <div key={fixtureId} className="check-line bad"><span>{fixture.fixture_code}</span><span>✗ {WarmupStatusText[status]}</span></div>;
                }
                const deviation = Math.abs(stable - cue.target_color_temp);
                const ok = deviation <= cue.tolerance_k;
                return <div key={fixtureId} className={ok ? "check-line ok" : "check-line bad"}>
                  <span>{fixture.fixture_code}</span>
                  <span>{ok ? "✓" : "✗"} {formatColorTemp(stable)} · 偏差 {formatColorTemp(deviation)}</span>
                </div>;
              })}
            </div>

            <div>
              <p className="muted">校正快照（目标 − 额定）{published ? "· 已发布，冻结不动" : ""}</p>
              {cue.calibration_results.map((entry) => {
                const fixture = fixtureById.get(entry.fixture_id);
                return <div key={entry.fixture_id} className="check-line">
                  <span>{fixture?.fixture_code ?? `#${entry.fixture_id}`}</span>
                  <span>额定 {formatColorTemp(entry.rated_color_temp)} · 校正 {formatSignedKelvin(entry.correction_k)}</span>
                </div>;
              })}
            </div>

            {!published && blockers.length > 0 ? (
              <div className="blockers">
                发布被拦截：{blockers.map((blocker) => (
                  <span key={blocker.fixture_id} className="blocker-item">
                    {blocker.fixture_code}（{CuePublishBlockReasonText[blocker.reason]}{blocker.reason === "OUT_OF_TOLERANCE" && blocker.deviation_k !== null ? ` ${formatColorTemp(blocker.deviation_k)}` : ""}）
                  </span>
                ))}
              </div>
            ) : null}

            {message ? <div className={message.ok ? "notice-ok" : "blockers"}>{message.text}</div> : null}

            <div>
              <button className="btn" disabled={published} onClick={() => handlePublish(cue)}>
                {published ? "已发布" : "发布"}
              </button>
            </div>
          </article>;
        })}
      </div>
    </section>
  </main>;
}
