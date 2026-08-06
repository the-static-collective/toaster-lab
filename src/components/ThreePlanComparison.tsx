import React, { useState } from "react";
import {
  Sparkles,
  Info,
  GitBranch,
  FileCode,
  AlertTriangle,
  Radio,
  Dices,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  Layers,
} from "lucide-react";
import { GenerationPlan, LockState, PlanProposal } from "../types/toaster";

interface ThreePlanComparisonProps {
  proposals: PlanProposal[];
  lockState: LockState;
  onToggleLock: (axisKey: string) => void;
  onOpenEvidence: (proposal: PlanProposal, fieldKey: string) => void;
  onOpenBreed: (proposal: PlanProposal) => void;
  onOpenJson: (proposal: PlanProposal) => void;
}

export const ThreePlanComparison: React.FC<ThreePlanComparisonProps> = ({
  proposals,
  lockState,
  onToggleLock,
  onOpenEvidence,
  onOpenBreed,
  onOpenJson,
}) => {
  const [highlightDiffsOnly, setHighlightDiffsOnly] = useState(false);

  if (!proposals || proposals.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 font-mono">
        <Sliders className="w-10 h-10 mx-auto mb-3 text-slate-600 animate-pulse" />
        <p className="text-sm font-semibold">No Generation Plan proposals available for comparison.</p>
        <p className="text-xs text-slate-600 mt-1">
          Generate plans in the Studio or load a preset above to unlock 3-Plan side-by-side comparison.
        </p>
      </div>
    );
  }

  // Get Faithful (1), Mutation (2), Foreign Body (3) or fallback to indexed proposals
  const faithfulProp = proposals.find((p) => p.proposalType === "faithful") || proposals[0];
  const mutationProp = proposals.find((p) => p.proposalType === "mutation") || proposals[1] || proposals[0];
  const foreignProp = proposals.find((p) => p.proposalType === "foreign_body") || proposals[2] || proposals[0];

  const threePlans = [
    { prop: faithfulProp, typeLabel: "1. Faithful Evidence", color: "emerald", border: "border-emerald-800/80", bg: "bg-emerald-950/20" },
    { prop: mutationProp, typeLabel: "2. Legal Mutation", color: "cyan", border: "border-cyan-800/80", bg: "bg-cyan-950/20" },
    { prop: foreignProp, typeLabel: "3. Foreign Body", color: "purple", border: "border-purple-800/80", bg: "bg-purple-950/20" },
  ];

  // Helper to compare values to Faithful baseline
  const isDifferentFromFaithful = (
    fieldGetter: (plan: GenerationPlan) => any,
    currentProp: PlanProposal
  ) => {
    if (currentProp.id === faithfulProp?.id) return false;
    if (!faithfulProp?.plan || !currentProp?.plan) return false;
    const valA = JSON.stringify(fieldGetter(faithfulProp.plan));
    const valB = JSON.stringify(fieldGetter(currentProp.plan));
    return valA !== valB;
  };

  const axes: {
    key: keyof GenerationPlan;
    label: string;
    getter: (p: GenerationPlan) => any;
    formatter?: (val: any) => string;
  }[] = [
    { key: "topology", label: "Topology", getter: (p) => p.topology },
    { key: "material", label: "Material Surface", getter: (p) => p.material },
    { key: "motionGrammar", label: "Motion Grammar", getter: (p) => p.motionGrammar },
    { key: "cameraGrammar", label: "Camera Trajectory", getter: (p) => p.cameraGrammar },
    { key: "lyricBehavior", label: "Lyric Behavior", getter: (p) => p.lyricBehavior },
    { key: "temporalDensity", label: "Temporal Density", getter: (p) => p.temporalDensity },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Comparison Controls Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              3-Plan Side-by-Side Visual Comparison
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-sans mt-0.5">
            Compare <span className="text-emerald-400 font-bold">Faithful</span>,{" "}
            <span className="text-cyan-400 font-bold">Mutation</span>, and{" "}
            <span className="text-purple-400 font-bold">Foreign Body</span> recipes side-by-side to drill into parameter evidence trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={highlightDiffsOnly}
              onChange={(e) => setHighlightDiffsOnly(e.target.checked)}
              className="accent-cyan-400 rounded"
            />
            <span className="text-slate-300 font-bold">Highlight Differences Only</span>
          </label>
        </div>
      </div>

      {/* 3-Column Plan Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {threePlans.map(({ prop, typeLabel, color, border, bg }, idx) => {
          if (!prop) return null;
          return (
            <div
              key={prop.id || idx}
              className={`border ${border} bg-slate-950/90 rounded-xl p-4 shadow-2xl flex flex-col justify-between space-y-3 relative overflow-hidden`}
            >
              {/* Type Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${
                    color === "emerald"
                      ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                      : color === "cyan"
                      ? "bg-cyan-950 text-cyan-300 border-cyan-800"
                      : "bg-purple-950 text-purple-300 border-purple-800"
                  }`}
                >
                  {typeLabel}
                </span>

                <div className="text-[11px] text-slate-400">
                  Confidence: <span className="text-cyan-300 font-bold">{Math.round((prop.confidence || 0.8) * 100)}%</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100 tracking-wide font-mono mt-1">
                  {prop.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-2">
                  {prop.tagline}
                </p>
              </div>

              {prop.foreignElement && (
                <div className="p-2 rounded bg-purple-950/60 border border-purple-800 text-[11px] text-purple-200 flex items-start gap-1.5 font-sans">
                  <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-mono text-purple-300 uppercase text-[10px] block">
                      Unexplained Foreign Body Element:
                    </strong>
                    {prop.foreignElement}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => onOpenBreed(prop)}
                  className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                >
                  <GitBranch className="w-3 h-3 text-cyan-400" />
                  Breed
                </button>
                <button
                  onClick={() => onOpenJson(prop)}
                  className="flex-1 py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono flex items-center justify-center gap-1 transition-colors"
                >
                  <FileCode className="w-3 h-3 text-sky-400" />
                  JSON
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parameter Matrix Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Parameter Divergence & Evidence Matrix
          </span>
          <span className="text-[10px] text-slate-400">
            Click <Info className="w-3.5 h-3.5 inline text-cyan-400 mx-0.5" /> to inspect evidence
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {/* Axis Rows */}
          {axes.map((axis) => {
            const isLocked = !!lockState[axis.key];

            return (
              <div key={axis.key} className="p-4 space-y-2 hover:bg-slate-900/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                      {axis.label}
                    </span>
                    <button
                      onClick={() => onToggleLock(axis.key)}
                      title={isLocked ? "Axis locked across regenerations" : "Lock axis"}
                      className={`p-1 rounded text-[10px] flex items-center gap-1 ${
                        isLocked
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                          : "bg-slate-950 text-slate-500 hover:text-slate-300 border border-slate-800"
                      }`}
                    >
                      {isLocked ? <Lock className="w-3 h-3 text-cyan-400" /> : <Unlock className="w-3 h-3" />}
                      <span>{isLocked ? "LOCKED" : "LOCK"}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {threePlans.map(({ prop, color }, idx) => {
                    if (!prop || !prop.plan) return null;
                    const val = axis.getter(prop.plan);
                    const isDiff = isDifferentFromFaithful(axis.getter, prop);

                    if (highlightDiffsOnly && idx !== 0 && !isDiff) {
                      return (
                        <div key={prop.id || idx} className="p-2.5 rounded bg-slate-950/40 border border-slate-800/40 opacity-40">
                          <span className="text-slate-600 text-[10px] italic">Matches Faithful Baseline</span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={prop.id || idx}
                        className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 transition-all ${
                          isDiff
                            ? color === "cyan"
                              ? "bg-cyan-950/40 border-cyan-700/80 shadow-md shadow-cyan-950/50"
                              : "bg-purple-950/40 border-purple-700/80 shadow-md shadow-purple-950/50"
                            : "bg-slate-950 border-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-cyan-200 font-bold truncate text-xs">{String(val)}</div>
                          </div>

                          {/* Evidence Inspector Drill Down Button */}
                          <button
                            onClick={() => onOpenEvidence(prop, axis.key)}
                            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-200 border border-slate-700 shrink-0 transition-colors"
                            title={`Inspect causal evidence trail for ${axis.label} in ${prop.title}`}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          {isDiff ? (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Mutated
                            </span>
                          ) : (
                            <span className="text-slate-500 font-sans text-[10px]">Faithful Baseline</span>
                          )}

                          <button
                            onClick={() => onOpenEvidence(prop, axis.key)}
                            className="text-slate-400 hover:text-cyan-300 underline font-sans text-[10px]"
                          >
                            Drill into Evidence →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Color Palette Logic Comparison */}
          <div className="p-4 space-y-2 hover:bg-slate-900/60 transition-colors">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-xs mb-2">
              Color Palette & Mood Logic
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {threePlans.map(({ prop }, idx) => {
                if (!prop || !prop.plan) return null;
                const palette = prop.plan.paletteLogic;
                const isDiff = isDifferentFromFaithful((p) => p?.paletteLogic?.mood, prop);

                return (
                  <div
                    key={prop.id || idx}
                    className={`p-3 rounded-lg border flex flex-col justify-between space-y-2.5 ${
                      isDiff ? "bg-cyan-950/30 border-cyan-800" : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-[10px] uppercase">Palette Mood</span>
                        <button
                          onClick={() => onOpenEvidence(prop, "paletteLogic")}
                          className="text-slate-500 hover:text-cyan-300"
                          title="Inspect palette evidence"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-cyan-200 font-bold text-xs">{palette?.mood || "default"}</div>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-5 h-5 rounded border border-slate-700 shadow"
                          style={{ backgroundColor: palette?.primary }}
                          title={`Primary: ${palette?.primary}`}
                        />
                        <div
                          className="w-5 h-5 rounded border border-slate-700 shadow"
                          style={{ backgroundColor: palette?.secondary }}
                          title={`Secondary: ${palette?.secondary}`}
                        />
                        <div
                          className="w-5 h-5 rounded border border-slate-700 shadow"
                          style={{ backgroundColor: palette?.accent }}
                          title={`Accent: ${palette?.accent}`}
                        />
                        <div
                          className="w-5 h-5 rounded border border-slate-700 shadow"
                          style={{ backgroundColor: palette?.background }}
                          title={`Background: ${palette?.background}`}
                        />
                      </div>

                      <span className="text-[10px] text-slate-400 font-sans truncate">
                        Shift: {palette?.shiftTrigger}
                      </span>
                    </div>

                    <button
                      onClick={() => onOpenEvidence(prop, "paletteLogic")}
                      className="text-right text-slate-400 hover:text-cyan-300 underline font-sans text-[10px]"
                    >
                      View Color Rationale →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Garment Physics Comparison */}
          <div className="p-4 space-y-2 hover:bg-slate-900/60 transition-colors">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-xs mb-2">
              Garment & Fabric Physics Constraints
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {threePlans.map(({ prop }, idx) => {
                if (!prop || !prop.plan) return null;
                const g = prop.plan.garmentParams;
                const isDiff = isDifferentFromFaithful((p) => p?.garmentParams?.maxStiffness, prop);

                return (
                  <div
                    key={prop.id || idx}
                    className={`p-3 rounded-lg border flex flex-col justify-between space-y-2 ${
                      isDiff ? "bg-cyan-950/30 border-cyan-800" : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span>FIT: <strong className="text-slate-200 uppercase">{g?.fitMode}</strong></span>
                        <span>SEAM: <strong className="text-cyan-300">{g?.seamStressLimit} MPa</strong></span>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">Stiffness</span>
                          <span className="text-cyan-300 font-bold">{g?.maxStiffness}</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden border border-slate-800">
                          <div
                            className="bg-cyan-400 h-full rounded"
                            style={{ width: `${Math.min(100, (g?.maxStiffness || 0) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenEvidence(prop, "garmentParams")}
                      className="text-right text-slate-400 hover:text-cyan-300 underline font-sans text-[10px]"
                    >
                      Inspect Physics Evidence →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
