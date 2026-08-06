import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  AlertTriangle,
  BarChart3,
  Layers,
  Flame,
  Gem,
  CheckCircle2,
  Filter,
  Search,
  Zap,
} from "lucide-react";
import { CreativeCoverage, UnvisitedRegion, Combination } from "../types/toaster";
import { TOPOLOGIES, MATERIALS, MOTION_GRAMMARS } from "../lib/toasterEngine";

interface CreativeCoverageDashboardProps {
  coverage: CreativeCoverage;
  onTargetUnvisitedRegion: (region: UnvisitedRegion) => void;
  onTargetCombination?: (combo: Combination) => void;
}

export const CreativeCoverageDashboard: React.FC<CreativeCoverageDashboardProps> = ({
  coverage,
  onTargetUnvisitedRegion,
  onTargetCombination,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopologyFilter, setSelectedTopologyFilter] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<"matrix" | "tropes" | "pairs" | "pacing">("matrix");

  const topologyPairsUsed = coverage?.topologyPairsUsed || {};
  const paletteMotionPairsUsed = coverage?.paletteMotionPairsUsed || {};
  const unvisitedRegions = coverage?.unvisitedRegions || [];
  const rareCombinations = coverage?.rareCombinations || [];
  const overusedCombinations = coverage?.overusedCombinations || [];
  const temporalDensityDistribution = coverage?.temporalDensityDistribution || {};

  // Filtering topology pairs
  const filteredTopologyPairs = Object.entries(topologyPairsUsed).filter(([pair]) => {
    const matchesSearch = pair.toLowerCase().includes(searchTerm.toLowerCase());
    const [top] = pair.split("::");
    const matchesTop = selectedTopologyFilter === "all" || top === selectedTopologyFilter;
    return matchesSearch && matchesTop;
  });

  // Filtering palette motion pairs
  const filteredPaletteMotionPairs = Object.entries(paletteMotionPairsUsed).filter(([pair]) => {
    return pair.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Overview Banner & Memory Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Mutation Memory & Creative Coverage Map
            </h2>
          </div>
          <p className="text-slate-400 text-xs font-sans max-w-2xl leading-relaxed">
            The Toaster Lab tracks coordinate tuples across historical plans to map explored
            versus frontier creative regions, highlighting overused tropes and rare gems to prevent visual monotony.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Plans Analyzed</span>
            <span className="text-xl font-bold text-cyan-300">{coverage.totalPlansAnalyzed}</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Unvisited Frontier</span>
            <span className="text-xl font-bold text-emerald-400">{unvisitedRegions.length}</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Rare Gems</span>
            <span className="text-xl font-bold text-sky-300">{rareCombinations.length}</span>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Overused Tropes</span>
            <span className="text-xl font-bold text-amber-400">{overusedCombinations.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab("matrix")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === "matrix"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            2D Heatmap Matrix
          </button>
          <button
            onClick={() => setActiveSubTab("tropes")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === "tropes"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Tropes & Rare Gems
          </button>
          <button
            onClick={() => setActiveSubTab("pairs")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === "pairs"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            Coordinate Pairs
          </button>
          <button
            onClick={() => setActiveSubTab("pacing")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === "pacing"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            Temporal Pacing
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Search coordinates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded pl-8 pr-2 py-1 text-xs focus:outline-none focus:border-cyan-600"
            />
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: 2D Heatmap Matrix View (Topologies vs Materials) */}
      {activeSubTab === "matrix" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                2D Creative Space Density Matrix (Topology × Material Surface)
              </h3>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-950 border border-emerald-500 inline-block" />
                Unvisited (0)
              </span>
              <span className="flex items-center gap-1 text-sky-300">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-950 border border-sky-500 inline-block" />
                Rare (1-2)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-950 border border-amber-500 inline-block" />
                High Density (3+)
              </span>
            </div>
          </div>

          <p className="text-slate-400 font-sans text-xs">
            Click any cell in the coordinate grid below to immediately generate or target that specific pairing in the Toaster Workbench!
          </p>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-3 border-r border-slate-800 font-bold uppercase">Topology \ Material</th>
                  {MATERIALS.map((mat) => (
                    <th key={mat} className="p-2 border-r border-slate-800 font-bold uppercase text-[10px] text-center min-w-[100px]">
                      {mat.replace("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {TOPOLOGIES.map((top) => (
                  <tr key={top} className="hover:bg-slate-950/50">
                    <td className="p-3 font-bold text-cyan-300 border-r border-slate-800 uppercase bg-slate-950/80">
                      {top.replace("_", " ")}
                    </td>
                    {MATERIALS.map((mat) => {
                      const pairKey = `${top}::${mat}`;
                      const count = coverage.topologyPairsUsed[pairKey] || 0;

                      let cellStyle = "bg-emerald-950/30 text-emerald-400 border-emerald-900/50 hover:border-emerald-500";
                      let badgeLabel = "Unvisited";

                      if (count === 1 || count === 2) {
                        cellStyle = "bg-sky-950/50 text-sky-300 border-sky-800 hover:border-sky-400";
                        badgeLabel = `${count} use`;
                      } else if (count >= 3) {
                        cellStyle = "bg-amber-950/60 text-amber-300 border-amber-800 hover:border-amber-400 font-bold";
                        badgeLabel = `${count} uses (Trope)`;
                      }

                      return (
                        <td
                          key={mat}
                          onClick={() => {
                            onTargetUnvisitedRegion({
                              topology: top,
                              motionGrammar: "fluid_wave",
                              material: mat,
                              rationale: `Targeted coordinate matrix pair: ${top} + ${mat}.`,
                            });
                          }}
                          title={`Click to target: ${top} + ${mat} (${count} historical uses)`}
                          className={`p-2.5 border-r border-slate-800/80 text-center cursor-pointer transition-all ${cellStyle}`}
                        >
                          <div className="text-[10px] uppercase font-bold">{badgeLabel}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Overused Tropes vs Rare Gems */}
      {activeSubTab === "tropes" && (
        <div className="space-y-6">
          {/* Overused Combinations */}
          <div className="bg-slate-900 border border-amber-900/60 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  Overused Visual Tropes (Avoid Repetition)
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                {overusedCombinations.length} Repeated Combinations Detected
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overusedCombinations.map((combo, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-4 rounded-lg border border-amber-900/80 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold uppercase">
                        Trope #{idx + 1}
                      </span>
                      <span className="text-amber-400 font-bold">{combo.count} Uses</span>
                    </div>

                    <div className="text-slate-100 font-bold text-xs mt-1">
                      {combo.topology} <span className="text-slate-500">+</span> {combo.material}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Motion: <span className="text-cyan-300">{combo.motionGrammar}</span>
                    </div>
                  </div>

                  <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                    This triplet has appeared frequently across past renders. To maintain creative freshness, mutate away from this combination.
                  </p>

                  <button
                    onClick={() => {
                      if (onTargetCombination) onTargetCombination(combo);
                    }}
                    className="w-full py-1.5 px-3 rounded bg-amber-950 hover:bg-amber-900 text-amber-200 font-bold text-xs border border-amber-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Target Mutation Away From Trope
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rare Gems (Under-Explored Valid Triplets) */}
          <div className="bg-slate-900 border border-sky-900/60 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-sky-300 uppercase tracking-wider">
                  Rare Explored Gems (High Creative Value)
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                {rareCombinations.length} Underused Gems
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rareCombinations.map((combo, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-4 rounded-lg border border-sky-900/80 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-bold uppercase">
                        Rare Gem #{idx + 1}
                      </span>
                      <span className="text-sky-300 font-bold">{combo.count} {combo.count === 1 ? "Use" : "Uses"}</span>
                    </div>

                    <div className="text-slate-100 font-bold text-xs mt-1">
                      {combo.topology} <span className="text-slate-500">+</span> {combo.material}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Motion: <span className="text-cyan-300">{combo.motionGrammar}</span>
                    </div>
                  </div>

                  <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                    Highly valid and unique aesthetic triplet with low historical repetition. Perfect candidate for faithful expansion.
                  </p>

                  <button
                    onClick={() => {
                      onTargetUnvisitedRegion({
                        topology: combo.topology,
                        motionGrammar: combo.motionGrammar,
                        material: combo.material,
                        rationale: `Targeting rare gem: ${combo.topology} + ${combo.motionGrammar} + ${combo.material}.`,
                      });
                    }}
                    className="w-full py-1.5 px-3 rounded bg-sky-950 hover:bg-sky-900 text-sky-200 font-bold text-xs border border-sky-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Gem className="w-3.5 h-3.5 text-sky-400" />
                    Target This Rare Gem
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Topology Pairs & Palette Motion Breakdown */}
      {activeSubTab === "pairs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* topologyPairsUsed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                Topology + Material Pairs Used (topologyPairsUsed)
              </h3>
              <span className="text-[10px] text-slate-400">
                {filteredTopologyPairs.length} Pairs
              </span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredTopologyPairs.map(([pair, count], idx) => {
                const [top, mat] = pair.split("::");
                const numCount = Number(count) || 0;
                const total = Number(coverage.totalPlansAnalyzed) || 1;

                return (
                  <div
                    key={idx}
                    className="flex flex-col bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-cyan-300 font-bold">{top}</span>
                        <span className="text-slate-500 mx-1.5">+</span>
                        <span className="text-slate-300">{mat}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {numCount} {numCount === 1 ? "use" : "uses"}
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded"
                        style={{ width: `${Math.min(100, (numCount / total) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* paletteMotionPairsUsed */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Palette Mood + Motion Pairs Used (paletteMotionPairsUsed)
              </h3>
              <span className="text-[10px] text-slate-400">
                {filteredPaletteMotionPairs.length} Pairs
              </span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredPaletteMotionPairs.map(([pair, count], idx) => {
                const [mood, motion] = pair.split("::");
                const numCount = Number(count) || 0;
                const total = Number(coverage.totalPlansAnalyzed) || 1;

                return (
                  <div
                    key={idx}
                    className="flex flex-col bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-purple-300 font-bold">{mood}</span>
                        <span className="text-slate-500 mx-1.5">+</span>
                        <span className="text-sky-300">{motion}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {numCount} {numCount === 1 ? "use" : "uses"}
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded"
                        style={{ width: `${Math.min(100, (numCount / total) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Temporal Density Pacing Distribution */}
      {activeSubTab === "pacing" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" />
              Temporal Pacing Density Distribution (temporalDensityDistribution)
            </h3>
            <span className="text-[10px] text-slate-400">
              Pacing Breakdown Across {coverage.totalPlansAnalyzed} Plans
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(temporalDensityDistribution).map(([density, count], idx) => {
              const numCount = Number(count) || 0;
              const total = Number(coverage.totalPlansAnalyzed) || 1;
              const percentage = Math.round((numCount / total) * 100);

              return (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-bold uppercase">{density} Pacing</span>
                    <span className="text-cyan-400 font-mono font-bold">{percentage}%</span>
                  </div>

                  <div className="text-2xl font-bold text-cyan-300">
                    {numCount} <span className="text-xs font-normal text-slate-500">plans</span>
                  </div>

                  <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Frontier Unvisited Legal Creative Regions Section */}
      <div className="bg-slate-900 border border-emerald-900/60 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
              Unvisited Frontier Regions (Frontier Coordinates)
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            {unvisitedRegions.length} Unvisited Legal Combinations Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unvisitedRegions.slice(0, 6).map((region, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-700/80 transition-all"
            >
              <div className="space-y-1">
                <div className="text-cyan-300 font-bold">{region.topology}</div>
                <div className="text-slate-400 text-[11px]">
                  Motion: <span className="text-slate-200">{region.motionGrammar}</span> • Material:{" "}
                  <span className="text-slate-200">{region.material}</span>
                </div>
                <p className="text-slate-500 font-sans text-[11px] mt-1.5 line-clamp-2">
                  {region.rationale}
                </p>
              </div>

              <button
                onClick={() => onTargetUnvisitedRegion(region)}
                className="w-full py-1.5 px-3 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                Target This Frontier Region
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
