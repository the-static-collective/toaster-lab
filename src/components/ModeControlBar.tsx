import React from "react";
import {
  Sparkles,
  Sliders,
  EyeOff,
  Music,
  FileText,
  Image as ImageIcon,
  Dices,
  Radio,
} from "lucide-react";
import { AnalysisMode } from "../types/toaster";

interface ModeControlBarProps {
  analysisMode: AnalysisMode;
  counterfactualRemovedModality: "audio" | "lyrics" | "image";
  onModeChange: (mode: AnalysisMode) => void;
  onCounterfactualModalityChange: (modality: "audio" | "lyrics" | "image") => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const ModeControlBar: React.FC<ModeControlBarProps> = ({
  analysisMode,
  counterfactualRemovedModality,
  onModeChange,
  onCounterfactualModalityChange,
  onGenerate,
  isGenerating,
}) => {
  return (
    <div className="border border-cyan-900/60 bg-slate-950/90 rounded-lg p-4 shadow-xl mb-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Analysis Modes List */}
        <div className="w-full lg:w-auto">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-2">
            Multimodal Influence Mode
          </span>
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            <button
              onClick={() => onModeChange("full")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                analysisMode === "full"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-md shadow-cyan-950"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Full Influence
            </button>

            <button
              onClick={() => onModeChange("audio_only")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                analysisMode === "audio_only"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-md shadow-cyan-950"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              Audio Only
            </button>

            <button
              onClick={() => onModeChange("lyrics_only")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                analysisMode === "lyrics_only"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-md shadow-cyan-950"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Lyrics Only
            </button>

            <button
              onClick={() => onModeChange("image_only")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                analysisMode === "image_only"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-md shadow-cyan-950"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              Image Only
            </button>

            <button
              onClick={() => onModeChange("seed_only")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                analysisMode === "seed_only"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-md shadow-amber-950"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
              title="Blind bake: generates plan purely from seed, ignoring semantic interpretation"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              Seed Only / Blind Bake
            </button>

            <button
              onClick={() => onModeChange("counterfactual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                analysisMode === "counterfactual"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold shadow-md shadow-rose-950"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              Counterfactual
            </button>
          </div>
        </div>

        {/* Counterfactual Sub-Selector if counterfactual mode is active */}
        {analysisMode === "counterfactual" && (
          <div className="flex items-center gap-2 bg-rose-950/40 p-2 rounded border border-rose-900/60 text-xs font-mono">
            <span className="text-rose-300 font-semibold">Exclude Modality:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onCounterfactualModalityChange("audio")}
                className={`px-2 py-0.5 rounded ${
                  counterfactualRemovedModality === "audio"
                    ? "bg-rose-600 text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                Audio
              </button>
              <button
                onClick={() => onCounterfactualModalityChange("lyrics")}
                className={`px-2 py-0.5 rounded ${
                  counterfactualRemovedModality === "lyrics"
                    ? "bg-rose-600 text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                Lyrics
              </button>
              <button
                onClick={() => onCounterfactualModalityChange("image")}
                className={`px-2 py-0.5 rounded ${
                  counterfactualRemovedModality === "image"
                    ? "bg-rose-600 text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                Image
              </button>
            </div>
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full lg:w-auto px-6 py-2.5 rounded-md bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-cyan-950/50 transition-all border border-cyan-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Sliders className="w-4 h-4 animate-spin text-slate-950" />
              <span>Analyzing Signals & Synthesizing Plans...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Synthesize 3 Generation Plans</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
