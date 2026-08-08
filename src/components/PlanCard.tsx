import React from "react";
import {
  Lock,
  Unlock,
  RotateCcw,
  Info,
  GitBranch,
  FileCode,
  AlertTriangle,
  Download,
  Zap,
} from "lucide-react";
import { GenerationPlan, LockState, PlanProposal } from "../types/toaster";

interface PlanCardProps {
  proposal: PlanProposal;
  lockState: LockState;
  onToggleLock: (axisKey: string) => void;
  onRerollAxis: (axisKey: keyof GenerationPlan) => void;
  onOpenEvidence: (proposal: PlanProposal, fieldKey: string) => void;
  onOpenBreed: (proposal: PlanProposal) => void;
  onOpenJson: (proposal: PlanProposal) => void;
  onExportProposal: (proposal: PlanProposal) => void;
  isRerollingAxis?: string | null;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  proposal,
  lockState,
  onToggleLock,
  onRerollAxis,
  onOpenEvidence,
  onOpenBreed,
  onOpenJson,
  onExportProposal,
  isRerollingAxis,
}) => {
  const { plan, proposalType, title, tagline, confidence, foreignElement } = proposal;

  const getProposalBadge = () => {
    switch (proposalType) {
      case "faithful":
        return {
          bg: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
          label: "1. Faithful Evidence",
        };
      case "mutation":
        return {
          bg: "bg-cyan-950/80 text-cyan-300 border-cyan-800",
          label: "2. Legal Mutation",
        };
      case "foreign_body":
        return {
          bg: "bg-purple-950/80 text-purple-300 border-purple-800",
          label: "3. Foreign Body Element",
        };
      default:
        return {
          bg: "bg-slate-900 text-slate-300 border-slate-700",
          label: proposalType ? proposalType.toUpperCase() : "CUSTOM PLAN",
        };
    }
  };

  const badge = getProposalBadge();

  const axes: { key: keyof GenerationPlan; label: string; value: string }[] = [
    { key: "topology", label: "Topology", value: plan.topology },
    { key: "material", label: "Material", value: plan.material },
    { key: "motionGrammar", label: "Motion Grammar", value: plan.motionGrammar },
    { key: "cameraGrammar", label: "Camera Trajectory", value: plan.cameraGrammar },
    { key: "lyricBehavior", label: "Lyric Behavior", value: plan.lyricBehavior },
    { key: "temporalDensity", label: "Temporal Density", value: plan.temporalDensity },
  ];

  return (
    <div className="border border-slate-800 bg-slate-950/90 rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-slate-700 transition-all font-mono text-xs">
      {/* Card Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest ${badge.bg}`}>
            {badge.label}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Confidence:</span>
            <span className="text-cyan-300 font-bold">{Math.round(confidence * 100)}%</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-slate-100 tracking-wide font-mono">{title}</h3>
        <p className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-2">{tagline}</p>

        {foreignElement && (
          <div className="mt-2.5 p-2 rounded bg-purple-950/50 border border-purple-800/80 text-[11px] text-purple-200 flex items-start gap-1.5 font-sans">
            <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-mono text-purple-300 uppercase text-[10px] block">
                Unexplained Foreign Element:
              </strong>
              {foreignElement}
            </div>
          </div>
        )}
      </div>

      {/* Plan Parameters & Lock/Reroll Table */}
      <div className="p-4 space-y-2.5 divide-y divide-slate-800/60">
        {axes.map((axis) => {
          const isLocked = !!lockState[axis.key];
          const isRerolling = isRerollingAxis === axis.key;

          return (
            <div key={axis.key} className="pt-2 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider">{axis.label}</span>
                  <button
                    onClick={() => onOpenEvidence(proposal, axis.key)}
                    className="p-0.5 text-slate-500 hover:text-cyan-300 transition-colors"
                    title="View causal evidence trail for this parameter"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-cyan-200 font-bold truncate mt-0.5">{axis.value}</div>
              </div>

              {/* Controls: Lock & Reroll */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onRerollAxis(axis.key)}
                  disabled={isLocked || !!isRerollingAxis}
                  title={isLocked ? "Unlock parameter to reroll" : "Reroll only this axis"}
                  className={`p-1.5 rounded transition-all ${
                    isLocked
                      ? "text-slate-600 bg-slate-900 cursor-not-allowed"
                      : "text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-cyan-300 border border-slate-700"
                  }`}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRerolling ? "animate-spin text-cyan-400" : ""}`} />
                </button>

                <button
                  onClick={() => onToggleLock(axis.key)}
                  title={isLocked ? "Locked (Preserved across regenerations)" : "Lock axis"}
                  className={`p-1.5 rounded transition-all ${
                    isLocked
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold shadow"
                      : "bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800"
                  }`}
                >
                  {isLocked ? <Lock className="w-3.5 h-3.5 text-cyan-400" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}

        {/* Palette Logic */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Palette Mood</div>
            <div className="text-cyan-200 font-bold">{plan.paletteLogic.mood}</div>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="w-4 h-4 rounded-full border border-slate-700"
              style={{ backgroundColor: plan.paletteLogic.primary }}
              title={`Primary: ${plan.paletteLogic.primary}`}
            ></div>
            <div
              className="w-4 h-4 rounded-full border border-slate-700"
              style={{ backgroundColor: plan.paletteLogic.secondary }}
              title={`Secondary: ${plan.paletteLogic.secondary}`}
            ></div>
            <div
              className="w-4 h-4 rounded-full border border-slate-700"
              style={{ backgroundColor: plan.paletteLogic.accent }}
              title={`Accent: ${plan.paletteLogic.accent}`}
            ></div>
          </div>
        </div>

        {/* Garment Stiffness */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider">Garment Physics</div>
            <div className="text-cyan-200 font-bold">
              Fit: {plan.garmentParams.fitMode} • Stiffness: {plan.garmentParams.maxStiffness}
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            {plan.garmentParams.seamStressLimit} MPa
          </span>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => onOpenBreed(proposal)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-all hover:text-cyan-300"
        >
          <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
          Breed Plan
        </button>

        <button
          onClick={() => onOpenJson(proposal)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-all hover:text-cyan-300"
        >
          <FileCode className="w-3.5 h-3.5 text-sky-400" />
          JSON Spec
        </button>

        <button
          onClick={() => onExportProposal(proposal)}
          title="Download a proposal-only transfer document for Haunted Toaster admission"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950/70 hover:bg-cyan-900/70 text-cyan-200 font-mono text-xs border border-cyan-800 transition-all"
        >
          <Download className="w-3.5 h-3.5 text-cyan-300" />
          Export to Toaster
        </button>
      </div>
    </div>
  );
};

interface ProposalsGridProps {
  proposals: PlanProposal[];
  lockState: LockState;
  onToggleLock: (axisKey: string) => void;
  onRerollAxis: (proposalId: string, axisKey: keyof GenerationPlan) => void;
  onOpenEvidence: (proposal: PlanProposal, fieldKey: string) => void;
  onOpenBreed: (proposal: PlanProposal) => void;
  onOpenJson: (proposal: PlanProposal) => void;
  onExportProposal: (proposal: PlanProposal) => void;
  isRerollingProposalId?: string | null;
  isRerollingAxisKey?: string | null;
}

export const ProposalsGrid: React.FC<ProposalsGridProps> = ({
  proposals,
  lockState,
  onToggleLock,
  onRerollAxis,
  onOpenEvidence,
  onOpenBreed,
  onOpenJson,
  onExportProposal,
  isRerollingProposalId,
  isRerollingAxisKey,
}) => {
  if (!proposals || proposals.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 font-mono">
        <Zap className="w-10 h-10 mx-auto mb-3 text-slate-600 animate-pulse" />
        <p className="text-sm font-semibold">No GenerationPlan proposals synthesized yet.</p>
        <p className="text-xs text-slate-600 mt-1">
          Click "Synthesize 3 Generation Plans" above or select a preset to generate recipes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {proposals.map((prop) => (
        <PlanCard
          key={prop.id}
          proposal={prop}
          lockState={lockState}
          onToggleLock={onToggleLock}
          onRerollAxis={(axisKey) => onRerollAxis(prop.id, axisKey)}
          onOpenEvidence={onOpenEvidence}
          onOpenBreed={onOpenBreed}
          onOpenJson={onOpenJson}
          onExportProposal={onExportProposal}
          isRerollingAxis={isRerollingProposalId === prop.id ? isRerollingAxisKey : null}
        />
      ))}
    </div>
  );
};
