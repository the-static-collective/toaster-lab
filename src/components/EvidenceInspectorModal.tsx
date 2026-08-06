import React from "react";
import { X, Info, Music, FileText, Image as ImageIcon, ShieldAlert, Sparkles } from "lucide-react";
import { PlanProposal } from "../types/toaster";

interface EvidenceInspectorModalProps {
  proposal: PlanProposal | null;
  fieldKey: string | null;
  onClose: () => void;
}

export const EvidenceInspectorModal: React.FC<EvidenceInspectorModalProps> = ({
  proposal,
  fieldKey,
  onClose,
}) => {
  if (!proposal || !fieldKey) return null;

  const rationaleItem = proposal.rationale?.find(
    (r) => r.field.toLowerCase() === fieldKey.toLowerCase()
  );

  const fieldValue = (proposal.plan as any)[fieldKey];

  const getSourceIcon = (src: string) => {
    switch (src) {
      case "audio":
        return <Music className="w-4 h-4 text-cyan-400" />;
      case "lyrics":
        return <FileText className="w-4 h-4 text-sky-400" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-indigo-400" />;
      case "constraint":
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Causal Evidence Trail: <span className="text-cyan-300">{fieldKey}</span>
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
        <div className="p-5 space-y-4">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">
              Active Parameter Value
            </span>
            <div className="text-base font-bold text-cyan-300">
              {typeof fieldValue === "object" ? JSON.stringify(fieldValue) : String(fieldValue)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Proposal: <span className="text-slate-200">{proposal.title}</span> ({proposal.proposalType})
            </div>
          </div>

          {/* Evidence List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Observable Evidence Signals
            </h3>

            {rationaleItem && rationaleItem.evidence?.length > 0 ? (
              <div className="space-y-3">
                {rationaleItem.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(ev.source)}
                        <span className="uppercase text-[10px] font-bold text-slate-200">
                          Source: {ev.source}
                        </span>
                      </div>

                      {ev.interval && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                          Interval: {ev.interval[0]}s – {ev.interval[1]}s
                        </span>
                      )}
                    </div>

                    {ev.excerpt && (
                      <div className="text-sky-300 italic text-[11px] bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        "{ev.excerpt}"
                      </div>
                    )}

                    <p className="text-slate-300 leading-relaxed font-sans text-xs">
                      {ev.observation}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center bg-slate-950/60 rounded border border-slate-800 text-slate-400">
                Primary evidence inferred from seed acoustics and global track density profile.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
