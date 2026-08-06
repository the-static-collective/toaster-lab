import React, { useState } from "react";
import { X, GitBranch, Sparkles, Check, Sliders } from "lucide-react";
import { GenerationPlan, PlanProposal } from "../types/toaster";
import { breedPlans } from "../lib/toasterEngine";

interface PlanBreederModalProps {
  proposals: PlanProposal[];
  initialParentA: PlanProposal | null;
  onClose: () => void;
  onBreedComplete: (hybridPlan: GenerationPlan) => void;
}

export const PlanBreederModal: React.FC<PlanBreederModalProps> = ({
  proposals,
  initialParentA,
  onClose,
  onBreedComplete,
}) => {
  const [parentAId, setParentAId] = useState<string>(
    initialParentA?.id || proposals[0]?.id || ""
  );
  const [parentBId, setParentBId] = useState<string>(
    proposals.find((p) => p.id !== (initialParentA?.id || proposals[0]?.id))?.id || proposals[1]?.id || ""
  );
  const [blend, setBlend] = useState<number>(0.5);

  const parentA = proposals.find((p) => p?.id === parentAId) || proposals[0];
  const parentB = proposals.find((p) => p?.id === parentBId) || proposals[1] || proposals[0];

  if (!parentA || !parentB) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center text-slate-400">
          <p>At least two proposals are required for breeding.</p>
          <button onClick={onClose} className="mt-4 px-4 py-1.5 rounded bg-slate-800 text-slate-200">
            Close
          </button>
        </div>
      </div>
    );
  }

  const blendedPlan = breedPlans(parentA.plan, parentB.plan, blend);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Plan Breeding Studio (Cross Candidate Recipes)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Parent Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <label className="text-slate-400 block mb-1 uppercase text-[10px]">Parent Candidate A</label>
              <select
                value={parentAId}
                onChange={(e) => setParentAId(e.target.value)}
                className="w-full bg-slate-900 text-cyan-300 border border-slate-700 rounded p-2 focus:outline-none"
              >
                {proposals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.proposalType})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <label className="text-slate-400 block mb-1 uppercase text-[10px]">Parent Candidate B</label>
              <select
                value={parentBId}
                onChange={(e) => setParentBId(e.target.value)}
                className="w-full bg-slate-900 text-cyan-300 border border-slate-700 rounded p-2 focus:outline-none"
              >
                {proposals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.proposalType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Blend Slider */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span>Blend Ratio: {Math.round((1 - blend) * 100)}% A / {Math.round(blend * 100)}% B</span>
              <span className="text-cyan-400 font-mono">Blend Value: {blend.toFixed(2)}</span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={blend}
              onChange={(e) => setBlend(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>100% {parentA.title}</span>
              <span>Hybrid Equilibrium</span>
              <span>100% {parentB.title}</span>
            </div>
          </div>

          {/* Blended Result Schema Preview */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Hybrid Candidate Plan Preview
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Interpolated Schema
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block uppercase text-[9px]">Topology</span>
                <span className="text-cyan-200 font-bold">{blendedPlan.topology}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block uppercase text-[9px]">Material</span>
                <span className="text-cyan-200 font-bold">{blendedPlan.material}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block uppercase text-[9px]">Motion Grammar</span>
                <span className="text-cyan-200 font-bold">{blendedPlan.motionGrammar}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block uppercase text-[9px]">Camera Trajectory</span>
                <span className="text-cyan-200 font-bold">{blendedPlan.cameraGrammar}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block uppercase text-[9px]">Garment Stiffness</span>
                <span className="text-cyan-200 font-bold">{blendedPlan.garmentParams.maxStiffness}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-500 block uppercase text-[9px]">Palette Mood</span>
                <span className="text-cyan-200 font-bold">{blendedPlan.paletteLogic.mood}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onBreedComplete(blendedPlan);
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2 rounded bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs shadow-lg"
          >
            <Check className="w-4 h-4" />
            Synthesize Hybrid Plan Into Studio
          </button>
        </div>
      </div>
    </div>
  );
};
