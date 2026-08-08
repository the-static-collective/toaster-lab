import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { MediaInputPanel } from "./components/MediaInputPanel";
import { ModeControlBar } from "./components/ModeControlBar";
import { ProposalsGrid } from "./components/PlanCard";
import { EvidenceInspectorModal } from "./components/EvidenceInspectorModal";
import { PlanBreederModal } from "./components/PlanBreederModal";
import { CreativeCoverageDashboard } from "./components/CreativeCoverageDashboard";
import { ReceiptComparisonView } from "./components/ReceiptComparisonView";
import { PlanDiffViewer } from "./components/PlanDiffViewer";
import { JsonViewerModal } from "./components/JsonViewerModal";

import {
  AudioInputData,
  GarmentConstraint,
  GenerationPlan,
  ImageInputData,
  LockState,
  PlanProposal,
  RenderReceipt,
  AnalysisMode,
  UnvisitedRegion,
} from "./types/toaster";

import {
  SAMPLE_AUDIO,
  SAMPLE_LYRICS,
  SAMPLE_COVER_IMAGE,
  SAMPLE_GARMENT_CONSTRAINT,
  HISTORICAL_PLANS,
  HISTORICAL_RECEIPTS,
} from "./lib/sampleData";

import {
  computeCreativeCoverage,
  getUnvisitedTarget,
  DEFAULT_GARMENT_CONSTRAINT,
} from "./lib/toasterEngine";
import {
  toasterProposalFilename,
  toToasterProposalTransferV1,
} from "./lib/toasterProposalTransfer";

export default function App() {
  const [seed, setSeed] = useState<number>(1042);
  const [audio, setAudio] = useState<AudioInputData | null>(SAMPLE_AUDIO);
  const [lyrics, setLyrics] = useState<string>(SAMPLE_LYRICS);
  const [image, setImage] = useState<ImageInputData | null>(SAMPLE_COVER_IMAGE);
  const [garmentConstraint, setGarmentConstraint] = useState<GarmentConstraint>(SAMPLE_GARMENT_CONSTRAINT);
  const [historicalPlans, setHistoricalPlans] = useState<GenerationPlan[]>(HISTORICAL_PLANS);
  const [historicalReceipts, setHistoricalReceipts] = useState<RenderReceipt[]>(HISTORICAL_RECEIPTS);

  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("full");
  const [counterfactualRemovedModality, setCounterfactualRemovedModality] = useState<"audio" | "lyrics" | "image">("audio");

  const [proposals, setProposals] = useState<PlanProposal[]>([]);
  const [lockState, setLockState] = useState<LockState>({});
  const [lockedPlan, setLockedPlan] = useState<GenerationPlan | null>(null);

  const [activeTab, setActiveTab] = useState<"studio" | "coverage" | "receipt" | "diff">("studio");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRerollingProposalId, setIsRerollingProposalId] = useState<string | null>(null);
  const [isRerollingAxisKey, setIsRerollingAxisKey] = useState<string | null>(null);

  // Modals
  const [activeEvidence, setActiveEvidence] = useState<{
    proposal: PlanProposal;
    fieldKey: string;
  } | null>(null);
  const [activeBreedParent, setActiveBreedParent] = useState<PlanProposal | null>(null);
  const [activeJsonViewer, setActiveJsonViewer] = useState<{
    title: string;
    data: any;
    filename: string;
    proposalId?: string;
  } | null>(null);

  // Compute coverage whenever historical plans/receipts change
  const coverage = computeCreativeCoverage(historicalPlans, historicalReceipts);

  // Initial synthesis on boot
  useEffect(() => {
    handleGenerate();
  }, []);

  // Primary Generation Handler
  const handleGenerate = async (noveltyTarget?: { topology?: string; material?: string; motionGrammar?: string; rationale?: string }) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/toaster/analyze-and-propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: analysisMode,
          counterfactualRemovedModality,
          audioInfo: audio ? { filename: audio.filename, durationSeconds: audio.durationSeconds, bpmEstimate: audio.bpmEstimate } : undefined,
          lyrics: lyrics || undefined,
          imageInfo: image ? { filename: image.filename, mimeType: image.mimeType, base64: image.base64 } : undefined,
          seed,
          garmentConstraint,
          lockedPlan: lockedPlan || (proposals[0]?.plan ?? null),
          lockState,
          noveltyTarget,
        }),
      });

      const data = await response.json();
      if (data.success && data.proposals) {
        setProposals(data.proposals);
        // If we locked any plan, remember it
        if (!lockedPlan && data.proposals[0]) {
          setLockedPlan(data.proposals[0].plan);
        }
      }
    } catch (err) {
      console.error("Failed to generate proposals:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Lock / Unlock Toggle
  const handleToggleLock = (axisKey: string) => {
    setLockState((prev) => {
      const next = { ...prev, [axisKey]: !prev[axisKey] };
      // Keep reference to locked plan
      if (!lockedPlan && proposals[0]) {
        setLockedPlan(proposals[0].plan);
      }
      return next;
    });
  };

  // Reroll single unlocked axis
  const handleRerollAxis = async (proposalId: string, axisKey: keyof GenerationPlan) => {
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop) return;

    setIsRerollingProposalId(proposalId);
    setIsRerollingAxisKey(axisKey);

    try {
      const response = await fetch("/api/toaster/reroll-axis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: prop.plan,
          axisKey,
          seed: seed + Math.floor(Math.random() * 1000),
          garmentConstraint,
        }),
      });

      const data = await response.json();
      if (data.success && data.newPlan) {
        setProposals((prev) =>
          prev.map((p) => {
            if (p.id === proposalId) {
              return {
                ...p,
                plan: data.newPlan,
                mutations: [
                  ...p.mutations,
                  {
                    field: axisKey,
                    previous: (p.plan as any)[axisKey],
                    proposed: (data.newPlan as any)[axisKey],
                    reason: data.mutationReason || "Single axis reroll",
                  },
                ],
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error("Failed to reroll axis:", err);
    } finally {
      setIsRerollingProposalId(null);
      setIsRerollingAxisKey(null);
    }
  };

  // Breed Complete
  const handleBreedComplete = (hybridPlan: GenerationPlan) => {
    const hybridProposal: PlanProposal = {
      id: `prop_hybrid_${Date.now()}`,
      proposalType: "mutation",
      title: hybridPlan.meta.title || "Hybrid Candidate",
      tagline: "Breeder synthesis output",
      plan: hybridPlan,
      rationale: [
        {
          field: "hybrid",
          evidence: [
            {
              source: "seed",
              observation: "Synthesized via Plan Breeding Studio blend slider.",
            },
          ],
        },
      ],
      mutations: [],
      confidence: 0.89,
    };

    setProposals((prev) => [hybridProposal, ...prev.slice(0, 2)]);
    setActiveTab("studio");
  };

  // "Take me somewhere the Toaster has not gone yet"
  const handleTakeMeSomewhereUnvisited = () => {
    const unvisited = getUnvisitedTarget(coverage, seed);
    handleGenerate({
      topology: unvisited.topology,
      material: unvisited.material,
      motionGrammar: unvisited.motionGrammar,
      rationale: unvisited.rationale,
    });
    setActiveTab("studio");
  };

  // Target specific frontier region from coverage dashboard
  const handleTargetUnvisitedRegion = (region: UnvisitedRegion) => {
    handleGenerate({
      topology: region.topology,
      material: region.material,
      motionGrammar: region.motionGrammar,
      rationale: region.rationale,
    });
    setActiveTab("studio");
  };

  const handleExportProposal = (proposal: PlanProposal) => {
    const transfer = toToasterProposalTransferV1(proposal, {
      audio,
      image,
      lockState,
    });
    const blob = new Blob([JSON.stringify(transfer, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = toasterProposalFilename(proposal);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  // Save modified plan from JsonViewerModal
  const handleSaveModifiedPlan = (updatedPlan: GenerationPlan) => {
    if (activeJsonViewer?.proposalId) {
      setProposals((prev) =>
        prev.map((p) => (p.id === activeJsonViewer.proposalId ? { ...p, plan: updatedPlan } : p))
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header & Navigation */}
      <Header
        seed={seed}
        onSeedChange={setSeed}
        onRandomSeed={() => setSeed(Math.floor(Math.random() * 90000) + 1000)}
        onLoadSamples={() => {
          setAudio(SAMPLE_AUDIO);
          setLyrics(SAMPLE_LYRICS);
          setImage(SAMPLE_COVER_IMAGE);
          setGarmentConstraint(SAMPLE_GARMENT_CONSTRAINT);
          setHistoricalPlans(HISTORICAL_PLANS);
          setHistoricalReceipts(HISTORICAL_RECEIPTS);
          handleGenerate();
        }}
        onTakeMeSomewhereUnvisited={handleTakeMeSomewhereUnvisited}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isGenerating={isGenerating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Multimodal Media Input Panel */}
        <MediaInputPanel
          audio={audio}
          lyrics={lyrics}
          image={image}
          garmentConstraint={garmentConstraint}
          historicalPlansCount={historicalPlans.length}
          historicalReceiptsCount={historicalReceipts.length}
          onAudioUpload={setAudio}
          onLyricsChange={setLyrics}
          onImageUpload={setImage}
          onGarmentConstraintChange={setGarmentConstraint}
          onImportHistoricalPlans={(plans) => setHistoricalPlans((prev) => [...prev, ...plans])}
          onImportHistoricalReceipts={(receipts) =>
            setHistoricalReceipts((prev) => [...prev, ...receipts])
          }
        />

        {/* Tab 1: Plan Studio */}
        {activeTab === "studio" && (
          <div className="space-y-6">
            <ModeControlBar
              analysisMode={analysisMode}
              counterfactualRemovedModality={counterfactualRemovedModality}
              onModeChange={setAnalysisMode}
              onCounterfactualModalityChange={setCounterfactualRemovedModality}
              onGenerate={() => handleGenerate()}
              isGenerating={isGenerating}
            />

            <ProposalsGrid
              proposals={proposals}
              lockState={lockState}
              onToggleLock={handleToggleLock}
              onRerollAxis={handleRerollAxis}
              onOpenEvidence={(proposal, fieldKey) =>
                setActiveEvidence({ proposal, fieldKey })
              }
              onOpenBreed={(proposal) => setActiveBreedParent(proposal)}
              onOpenJson={(proposal) =>
                setActiveJsonViewer({
                  title: `${proposal.title} Spec (GenerationPlan.json)`,
                  data: proposal.plan,
                  filename: `${proposal.title.toLowerCase().replace(/\s+/g, "_")}_plan.json`,
                  proposalId: proposal.id,
                })
              }
              onExportProposal={handleExportProposal}
              isRerollingProposalId={isRerollingProposalId}
              isRerollingAxisKey={isRerollingAxisKey}
            />
          </div>
        )}

        {/* Tab 2: Mutation Memory / Creative Coverage */}
        {activeTab === "coverage" && (
          <CreativeCoverageDashboard
            coverage={coverage}
            onTargetUnvisitedRegion={handleTargetUnvisitedRegion}
          />
        )}

        {/* Tab 3: Receipt Comparison */}
        {activeTab === "receipt" && (
          <ReceiptComparisonView
            requestedPlan={proposals[0]?.plan || null}
            executedReceipt={historicalReceipts[0] || null}
            historicalReceipts={historicalReceipts}
            onSelectReceipt={() => {}}
          />
        )}

        {/* Tab 4: Plan Diff Studio */}
        {activeTab === "diff" && (
          <PlanDiffViewer
            proposals={proposals}
            historicalPlans={historicalPlans}
            lockState={lockState}
            onToggleLock={handleToggleLock}
            onOpenEvidence={(proposal, fieldKey) =>
              setActiveEvidence({ proposal, fieldKey })
            }
            onOpenBreed={(proposal) => setActiveBreedParent(proposal)}
            onOpenJson={(proposal) =>
              setActiveJsonViewer({
                title: `${proposal.title} Spec (GenerationPlan.json)`,
                data: proposal.plan,
                filename: `${proposal.title.toLowerCase().replace(/\s+/g, "_")}_plan.json`,
                proposalId: proposal.id,
              })
            }
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs font-mono text-slate-500">
        Toaster Lab Workbench • Haunted Toaster Music-Video Renderer Ecosystem • Powered by Google Gemini
      </footer>

      {/* Modals */}
      {activeEvidence && (
        <EvidenceInspectorModal
          proposal={activeEvidence.proposal}
          fieldKey={activeEvidence.fieldKey}
          onClose={() => setActiveEvidence(null)}
        />
      )}

      {activeBreedParent && (
        <PlanBreederModal
          proposals={proposals}
          initialParentA={activeBreedParent}
          onClose={() => setActiveBreedParent(null)}
          onBreedComplete={handleBreedComplete}
        />
      )}

      {activeJsonViewer && (
        <JsonViewerModal
          title={activeJsonViewer.title}
          data={activeJsonViewer.data}
          filename={activeJsonViewer.filename}
          onClose={() => setActiveJsonViewer(null)}
          onSaveModifiedJson={handleSaveModifiedPlan}
        />
      )}
    </div>
  );
}
