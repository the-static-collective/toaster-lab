import React from "react";
import {
  Sparkles,
  Compass,
  RotateCcw,
  FileCode,
  Layers,
  GitCompare,
  FileText,
  Activity,
  Sliders,
} from "lucide-react";

interface HeaderProps {
  seed: number;
  onSeedChange: (seed: number) => void;
  onRandomSeed: () => void;
  onLoadSamples: () => void;
  onTakeMeSomewhereUnvisited: () => void;
  activeTab: "studio" | "coverage" | "receipt" | "diff";
  onTabChange: (tab: "studio" | "coverage" | "receipt" | "diff") => void;
  isGenerating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  seed,
  onSeedChange,
  onRandomSeed,
  onLoadSamples,
  onTakeMeSomewhereUnvisited,
  activeTab,
  onTabChange,
  isGenerating,
}) => {
  return (
    <header className="border-b border-cyan-900/50 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-4 py-3 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Brand Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 via-sky-800 to-slate-900 border border-cyan-400/40 shadow-inner">
            <Sliders className="w-5 h-5 text-cyan-200 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-mono text-cyan-300">
                TOASTER LAB
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                v2.4 Workbench
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Multimodal Creative Plan Cartographer for Haunted Toaster Renderer
            </p>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => onTabChange("studio")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "studio"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Plan Studio
          </button>
          <button
            onClick={() => onTabChange("coverage")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "coverage"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Mutation Memory
          </button>
          <button
            onClick={() => onTabChange("receipt")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "receipt"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Receipt Comparison
          </button>
          <button
            onClick={() => onTabChange("diff")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              activeTab === "diff"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold shadow"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Plan Diff
          </button>
        </div>

        {/* Action Controls & Seed */}
        <div className="flex items-center gap-3">
          {/* Seed Input */}
          <div className="flex items-center bg-slate-900 rounded-md border border-slate-700/80 px-2 py-1 text-xs font-mono">
            <span className="text-slate-400 mr-1.5 select-none">SEED:</span>
            <input
              type="number"
              value={seed}
              onChange={(e) => onSeedChange(parseInt(e.target.value) || 0)}
              className="w-16 bg-transparent text-cyan-300 focus:outline-none font-mono text-xs"
            />
            <button
              onClick={onRandomSeed}
              title="Randomize seed"
              className="ml-1 p-1 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Sample Preset Loader */}
          <button
            onClick={onLoadSamples}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-all"
            title="Load Haunted Resonance track & sample assets"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            Sample Preset
          </button>

          {/* "Take me somewhere the Toaster has not gone yet" Button */}
          <button
            onClick={onTakeMeSomewhereUnvisited}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-slate-900 font-mono text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all border border-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            <Compass className="w-4 h-4 animate-spin-slow text-slate-950" />
            <span>Take me somewhere unvisited</span>
          </button>
        </div>
      </div>
    </header>
  );
};
