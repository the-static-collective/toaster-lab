import React from "react";
import { Activity, AlertTriangle, CheckCircle2, FileText, Cpu, Clock, Layers } from "lucide-react";
import { GenerationPlan, RenderReceipt } from "../types/toaster";
import { compareReceiptWithPlan } from "../lib/toasterEngine";

interface ReceiptComparisonViewProps {
  requestedPlan: GenerationPlan | null;
  executedReceipt: RenderReceipt | null;
  historicalReceipts: RenderReceipt[];
  onSelectReceipt: (receipt: RenderReceipt) => void;
}

export const ReceiptComparisonView: React.FC<ReceiptComparisonViewProps> = ({
  requestedPlan,
  executedReceipt,
  historicalReceipts,
  onSelectReceipt,
}) => {
  if (!executedReceipt && historicalReceipts.length > 0) {
    executedReceipt = historicalReceipts[0];
  }

  if (!executedReceipt) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 font-mono">
        <Activity className="w-10 h-10 mx-auto mb-3 text-slate-600 animate-pulse" />
        <p className="text-sm font-semibold">No executed RenderReceipt available for comparison.</p>
        <p className="text-xs text-slate-600 mt-1">
          Import a <code className="text-cyan-400">RenderReceipt.json</code> file or load sample presets above.
        </p>
      </div>
    );
  }

  const activePlan = requestedPlan || executedReceipt.executedPlan;
  const comparison = compareReceiptWithPlan(activePlan, executedReceipt);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Receipt Selector & Match Score Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Requested Plan vs Executed Receipt Comparison
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-sans">
            Receipt ID: <span className="text-cyan-300 font-mono">{executedReceipt.receiptId}</span> • Renderer:{" "}
            <span className="text-slate-300 font-mono">{executedReceipt.rendererVersion}</span>
          </p>
        </div>

        {/* Match Score Indicator */}
        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Execution Fidelity</span>
            <span className="text-2xl font-bold text-emerald-400">{comparison.matchScore}% Match</span>
          </div>

          <div className="h-10 w-px bg-slate-800"></div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" /> Fallbacks
            </span>
            <span className="text-lg font-bold text-amber-300">
              {comparison.deviations.length} Detected
            </span>
          </div>
        </div>
      </div>

      {/* Performance Stats Rack */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Frame Rate
          </span>
          <div className="text-xl font-bold text-cyan-300">
            {executedReceipt.performance.actualFps} <span className="text-xs font-normal text-slate-500">/ {executedReceipt.performance.targetFps} FPS</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Dropped Frames
          </span>
          <div className="text-xl font-bold text-rose-300">
            {executedReceipt.performance.droppedFrames} <span className="text-xs font-normal text-slate-500">frames</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" /> Total Render Time
          </span>
          <div className="text-xl font-bold text-sky-300">
            {(executedReceipt.performance.renderTimeMs / 1000).toFixed(1)}s
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Active Renderer
          </span>
          <div className="text-xs font-bold text-purple-300 truncate mt-1">
            {executedReceipt.rendererVersion}
          </div>
        </div>
      </div>

      {/* Renderer Fallbacks & Shader Warnings */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Renderer Deviations & Hardware Fallbacks
        </h3>

        {comparison.deviations.length > 0 ? (
          <div className="space-y-2.5">
            {comparison.deviations.map((dev, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950 border border-amber-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold uppercase">{dev.field} Deviation</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase font-bold">
                      {dev.severity}
                    </span>
                  </div>

                  <p className="text-slate-400 text-xs font-sans mt-1">{dev.reason}</p>
                </div>

                <div className="flex items-center gap-3 text-xs bg-slate-900 p-2 rounded border border-slate-800 shrink-0">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Requested</span>
                    <span className="text-slate-300 font-bold">{String(dev.requestedValue)}</span>
                  </div>
                  <span className="text-slate-600">→</span>
                  <div>
                    <span className="text-[9px] text-amber-500 block uppercase">Executed</span>
                    <span className="text-amber-300 font-bold">{String(dev.executedValue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero renderer deviations detected. Executed plan matched requested plan precisely.</span>
          </div>
        )}

        {/* Shader Warnings */}
        {executedReceipt.shaderWarnings?.length > 0 && (
          <div className="pt-2">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider mb-2">
              Shader Compile & Runtime Warnings:
            </span>
            <div className="space-y-1">
              {executedReceipt.shaderWarnings.map((warn, i) => (
                <div key={i} className="text-amber-200/90 font-mono bg-amber-950/40 p-2 rounded border border-amber-900/50">
                  ⚠️ {warn}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
