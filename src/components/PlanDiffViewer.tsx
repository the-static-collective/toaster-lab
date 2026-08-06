import React, { useState } from "react";
import { GitCompare, CheckCircle2, XCircle, Sliders, Layers } from "lucide-react";
import { GenerationPlan, LockState, PlanProposal } from "../types/toaster";
import { diffPlans } from "../lib/toasterEngine";
import { ThreePlanComparison } from "./ThreePlanComparison";

interface PlanDiffViewerProps {
  proposals: PlanProposal[];
  historicalPlans: GenerationPlan[];
  lockState?: LockState;
  onToggleLock?: (axisKey: string) => void;
  onOpenEvidence?: (proposal: PlanProposal, fieldKey: string) => void;
  onOpenBreed?: (proposal: PlanProposal) => void;
  onOpenJson?: (proposal: PlanProposal) => void;
}

export const PlanDiffViewer: React.FC<PlanDiffViewerProps> = ({
  proposals,
  historicalPlans,
  lockState = {},
  onToggleLock = () => {},
  onOpenEvidence = () => {},
  onOpenBreed = () => {},
  onOpenJson = () => {},
}) => {
  const [viewMode, setViewMode] = useState<"three_plans" | "custom_diff">("three_plans");

  const allPlansMap = new Map<string, GenerationPlan>();
  (proposals || []).forEach((p) => {
    if (p && p.title && p.plan) {
      allPlansMap.set(p.title, p.plan);
    }
  });
  (historicalPlans || []).forEach((hp) => {
    if (hp && hp.meta && hp.meta.title) {
      allPlansMap.set(hp.meta.title, hp);
    }
  });

  const planTitles = Array.from(allPlansMap.keys());

  const [titleA, setTitleA] = useState<string>(planTitles[0] || "");
  const [titleB, setTitleB] = useState<string>(planTitles[1] || planTitles[0] || "");

  const planA = allPlansMap.get(titleA);
  const planB = allPlansMap.get(titleB);

  const diffs = planA && planB ? diffPlans(planA, planB) : [];
  const matchCount = diffs.filter((d) => d.equal).length;
  const matchPercentage = diffs.length > 0 ? Math.round((matchCount / diffs.length) * 100) : 100;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* View Mode Toggle Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Toaster Lab Plan Comparison Studio
            </h2>
            <p className="text-[11px] text-slate-400 font-sans">
              Compare Faithful, Mutation, and Foreign Body proposals or diff any two custom historical plans.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode("three_plans")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "three_plans"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            3-Plan Visual Comparison
          </button>

          <button
            onClick={() => setViewMode("custom_diff")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === "custom_diff"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            2-Plan Custom Diff
          </button>
        </div>
      </div>

      {/* Mode 1: 3-Plan Visual Comparison */}
      {viewMode === "three_plans" && (
        <ThreePlanComparison
          proposals={proposals}
          lockState={lockState}
          onToggleLock={onToggleLock}
          onOpenEvidence={onOpenEvidence}
          onOpenBreed={onOpenBreed}
          onOpenJson={onOpenJson}
        />
      )}

      {/* Mode 2: 2-Plan Custom Schema Diff */}
      {viewMode === "custom_diff" && (
        <div className="space-y-6">
          {/* Plan Selectors Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 min-w-[200px]">
                <label className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Plan Candidate A
                </label>
                <select
                  value={titleA}
                  onChange={(e) => setTitleA(e.target.value)}
                  className="w-full bg-slate-950 text-cyan-300 border border-slate-700 rounded p-2 focus:outline-none"
                >
                  {planTitles.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-slate-600 font-bold text-lg mt-4">VS</span>

              <div className="flex-1 min-w-[200px]">
                <label className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
                  Plan Candidate B
                </label>
                <select
                  value={titleB}
                  onChange={(e) => setTitleB(e.target.value)}
                  className="w-full bg-slate-950 text-cyan-300 border border-slate-700 rounded p-2 focus:outline-none"
                >
                  {planTitles.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Diff Similarity Metric */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center shrink-0 min-w-[160px]">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Schema Similarity</span>
              <span className="text-2xl font-bold text-cyan-300">{matchPercentage}%</span>
            </div>
          </div>

          {/* Diff Table */}
          {planA && planB ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Schema Field Comparison</span>
                <span className="text-[10px] text-slate-500">
                  {matchCount} / {diffs.length} Fields Identical
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {diffs.map((d, i) => (
                  <div
                    key={i}
                    className={`p-3 grid grid-cols-1 md:grid-cols-7 items-center gap-2 ${
                      d.equal ? "bg-slate-900/40" : "bg-cyan-950/20"
                    }`}
                  >
                    <div className="md:col-span-2 font-bold text-slate-300 flex items-center gap-1.5">
                      {d.equal ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      )}
                      <span>{d.field}</span>
                    </div>

                    <div className="md:col-span-2 text-cyan-200 bg-slate-950 p-1.5 rounded border border-slate-800 truncate">
                      {String(d.valA)}
                    </div>

                    <div className="md:col-span-1 text-center text-slate-600 text-xs">
                      {d.equal ? "==" : "!="}
                    </div>

                    <div className="md:col-span-2 text-cyan-200 bg-slate-950 p-1.5 rounded border border-slate-800 truncate">
                      {String(d.valB)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
              Select two valid plans above to compare schema fields.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
