import { useEffect, useMemo, useState } from "react";
import { useFixtureStore } from "../stores/FixtureStore";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useCctCalibration } from "../hooks/useCctCalibration";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { WarmupStatusText } from "../constants/WarmupStatus";
import { CctCheckStatusText } from "../constants/CctCheckStatus";
import { CCT_CONFIG } from "../constants/cctConfig";
import { PUBLISHED_CUE_STATUSES } from "../constants/CueStatus";
import { formatCct, formatCctDiff, formatDate } from "../utils/formatters";
import { assessFixtureWarmup } from "../utils/cctCalibration";
import type { CueScene } from "../types/CueScene";

export function CuesPage() {
  const fixtures = useFixtureStore((s) => s.rows);
  const fixtureError = useFixtureStore((s) => s.error);
  const loadFixtures = useFixtureStore((s) => s.load);
  const recordReading = useFixtureStore((s) => s.recordReading);
  const updateRatedCct = useFixtureStore((s) => s.updateRatedCct);

  const cues = useCueSceneStore((s) => s.rows);
  const publishError = useCueSceneStore((s) => s.publishError);
  const publishNotice = useCueSceneStore((s) => s.publishNotice);
  const loadCues = useCueSceneStore((s) => s.load);
  const setCueTarget = useCueSceneStore((s) => s.setCueTarget);
  const publishCue = useCueSceneStore((s) => s.publishCue);
  const recalcUnpublished = useCueSceneStore((s) => s.recalcUnpublished);

  const [selectedCueId, setSelectedCueId] = useState<number | null>(null);
  const [readingDrafts, setReadingDrafts] = useState<Record<number, string>>({});
  const [ratedDrafts, setRatedDrafts] = useState<Record<number, string>>({});
  const [targetDraft, setTargetDraft] = useState("");
  const [toleranceDraft, setToleranceDraft] = useState("");

  useEffect(() => {
    void (async () => {
      await Promise.all([loadFixtures(), loadCues()]);
      recalcUnpublished(useFixtureStore.getState().rows);
    })();
  }, [loadFixtures, loadCues, recalcUnpublished]);

  const { warmupRows, evaluations, summary } = useCctCalibration(fixtures, cues);

  const selectedCue: CueScene | null = useMemo(
    () => cues.find((c) => c.id === selectedCueId) ?? cues[0] ?? null,
    [cues, selectedCueId]
  );
  const selectedEvaluation = selectedCue ? evaluations.get(selectedCue.id) ?? null : null;
  const selectedPublished = selectedCue
    ? (PUBLISHED_CUE_STATUSES as string[]).includes(selectedCue.scene_status)
    : false;

  useEffect(() => {
    if (selectedCue) {
      setTargetDraft(selectedCue.target_cct_k == null ? "" : String(selectedCue.target_cct_k));
      setToleranceDraft(String(selectedCue.cct_tolerance_k));
    }
  }, [selectedCue?.id, selectedCue?.target_cct_k, selectedCue?.cct_tolerance_k]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitReading = async (fixtureId: number) => {
    const ok = await recordReading(fixtureId, Number(readingDrafts[fixtureId]));
    if (ok) setReadingDrafts((d) => ({ ...d, [fixtureId]: "" }));
  };

  const submitRated = async (fixtureId: number) => {
    const ok = await updateRatedCct(fixtureId, Number(ratedDrafts[fixtureId]));
    if (ok) setRatedDrafts((d) => ({ ...d, [fixtureId]: "" }));
  };

  const submitTarget = async () => {
    if (!selectedCue) return;
    const target = targetDraft.trim() === "" ? null : Number(targetDraft);
    await setCueTarget(selectedCue.id, target, Number(toleranceDraft), fixtures);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>场景编辑 · 色温校正台</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>

      <section className="metrics">
        <StatCard label="预热中灯具" value={summary.warming} />
        <StatCard label="已稳定灯具" value={summary.stable} />
        <StatCard label="缺实测值灯具" value={summary.insufficient} />
      </section>

      <section className="panel wide">
        <h2>灯具色温校正</h2>
        <p className="hint">
          每盏灯保留最近两次实测值；两次相差超过 {CCT_CONFIG.WARMUP_TOLERANCE_K}K 视为仍在预热，不生成稳定结果。
          调整额定色温只会重算引用它的未发布 Cue，已发布记录不动。
        </p>
        {fixtureError ? <p className="blockers">{fixtureError}</p> : null}
        {fixtures.length === 0 ? <EmptyState title="暂无灯具" /> : null}
        <div className="fixture-grid">
          {warmupRows.map((row) => {
            const f = row.fixture;
            return (
              <article key={f.id} className="fixture-row">
                <div>
                  <span className="code">{f.fixture_code}</span>
                  <p className="hint">额定 {formatCct(f.rated_cct_k)}</p>
                </div>
                <div className="field">
                  <label>额定色温（K）</label>
                  <div className="inline-form">
                    <input
                      type="number"
                      value={ratedDrafts[f.id] ?? ""}
                      placeholder={String(f.rated_cct_k)}
                      onChange={(e) => setRatedDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                    />
                    <button className="btn" onClick={() => void submitRated(f.id)}>保存</button>
                  </div>
                </div>
                <div className="kv">
                  <span>最近两次实测</span>
                  <strong>{f.measured_cct_k.length ? f.measured_cct_k.map((v) => formatCct(v)).join(" / ") : "—"}</strong>
                </div>
                <div className="kv">
                  <span>差值</span>
                  <strong>{formatCctDiff(row.diffK)}</strong>
                </div>
                <div className="kv">
                  <span>预热状态</span>
                  <StatusBadge value={row.status} />
                </div>
                <div className="kv">
                  <span>稳定结果</span>
                  <strong>{formatCct(row.resultCctK)}</strong>
                </div>
                <div className="field">
                  <label>录入读数（K）</label>
                  <div className="inline-form">
                    <input
                      type="number"
                      value={readingDrafts[f.id] ?? ""}
                      placeholder="如 3200"
                      onChange={(e) => setReadingDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                    />
                    <button className="btn btn-primary" onClick={() => void submitReading(f.id)}>录入</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="workbench">
        <div className="panel wide">
          <h2>Cue 校验与发布</h2>
          {!selectedCue ? <EmptyState title="暂无 Cue，请先在种子数据中配置" /> : (
            <>
              <div className="cue-head">
                <strong>{selectedCue.name}</strong>
                <StatusBadge value={selectedCue.scene_status} />
                <StatusBadge value={selectedCue.cct_check_status} />
              </div>
              <div className="cue-form">
                <div className="field">
                  <label>目标色温（K），留空取关联灯具额定均值</label>
                  <input
                    type="number"
                    value={targetDraft}
                    placeholder={selectedEvaluation?.targetCctK != null ? `当前生效 ${selectedEvaluation.targetCctK}K` : "如 3200"}
                    disabled={selectedPublished}
                    onChange={(e) => setTargetDraft(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>允许偏差（K）</label>
                  <input
                    type="number"
                    value={toleranceDraft}
                    disabled={selectedPublished}
                    onChange={(e) => setToleranceDraft(e.target.value)}
                  />
                </div>
                <button className="btn" disabled={selectedPublished} onClick={() => void submitTarget()}>保存目标</button>
              </div>
              <p className="hint">
                生效目标 {formatCct(selectedEvaluation?.targetCctK ?? null)}，允许偏差 ±{selectedEvaluation?.toleranceK ?? "—"}K。
              </p>

              <h3>关联灯具</h3>
              {selectedCue.fixture_ids.length === 0 ? <EmptyState title="该 Cue 尚未关联灯具" /> : (
                <div className="table">
                  {selectedCue.fixture_ids.map((id) => {
                    const fixture = fixtures.find((f) => f.id === id);
                    if (!fixture) {
                      return <article key={id} className="row"><strong>#{id}</strong><span>灯具不存在</span><StatusBadge value="BLOCKED" /></article>;
                    }
                    const warmup = assessFixtureWarmup(fixture);
                    const deviation = warmup.resultCctK != null && selectedEvaluation?.targetCctK != null
                      ? Math.abs(warmup.resultCctK - selectedEvaluation.targetCctK)
                      : null;
                    return (
                      <article key={id} className="row">
                        <strong>{fixture.fixture_code}</strong>
                        <span>稳定结果 {formatCct(warmup.resultCctK)}，偏差 {formatCctDiff(deviation)}</span>
                        <StatusBadge value={warmup.status} />
                      </article>
                    );
                  })}
                </div>
              )}

              {selectedEvaluation && selectedEvaluation.blockers.length > 0 ? (
                <div className="blockers">
                  以下灯具挡住发布：
                  <ul>
                    {selectedEvaluation.blockers.map((b, i) => <li key={`${b.fixtureId}-${i}`}><strong>{b.fixtureCode}</strong>：{b.reason}</li>)}
                  </ul>
                </div>
              ) : (
                <p className="notice">全部关联灯具稳定且落在允许偏差内，可以发布。</p>
              )}
              {publishError ? <p className="blockers">{publishError}</p> : null}
              {publishNotice ? <p className="notice">{publishNotice}</p> : null}

              <div className="cue-actions">
                <button
                  className="btn btn-primary"
                  disabled={selectedPublished}
                  onClick={() => selectedCue && void publishCue(selectedCue.id, fixtures)}
                >
                  {selectedPublished ? "已发布" : "发布"}
                </button>
                {selectedPublished ? <span className="hint">该 Cue 已发布，色温快照已冻结，调整额定值不会重算此记录。</span> : null}
              </div>
              <p className="hint">
                上次校验：{CctCheckStatusText[selectedCue.cct_check_status as keyof typeof CctCheckStatusText] ?? selectedCue.cct_check_status}
                {selectedCue.cct_checked_at ? ` · ${formatDate(selectedCue.cct_checked_at)}` : ""}
                {selectedCue.cct_check_detail ? ` · ${selectedCue.cct_check_detail}` : ""}
              </p>
            </>
          )}
        </div>

        <div className="panel">
          <h2>Cue 总览</h2>
          {cues.length === 0 ? <EmptyState title="暂无 Cue" /> : null}
          <div className="table cue-list">
            {cues.map((cue) => {
              const evaluation = evaluations.get(cue.id);
              const published = (PUBLISHED_CUE_STATUSES as string[]).includes(cue.scene_status);
              return (
                <article key={cue.id} className={"row" + (cue.id === selectedCue?.id ? " selected" : "")}>
                  <strong>{cue.name}</strong>
                  <StatusBadge value={cue.scene_status} />
                  <StatusBadge value={cue.cct_check_status} />
                  <span className="hint">
                    目标 {cue.target_cct_k == null ? `额定均值 ${formatCct(evaluation?.targetCctK ?? null)}` : formatCct(cue.target_cct_k)} ±{cue.cct_tolerance_k}K
                    {published ? " · 已发布冻结" : ""}
                  </span>
                  <button className="btn" onClick={() => setSelectedCueId(cue.id)}>选择</button>
                </article>
              );
            })}
          </div>
          <p className="hint">
            预热状态：{WarmupStatusText.WARMING} {summary.warming} · {WarmupStatusText.STABLE} {summary.stable} · {WarmupStatusText.INSUFFICIENT_DATA} {summary.insufficient}
          </p>
        </div>
      </section>
    </main>
  );
}
