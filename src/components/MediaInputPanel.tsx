import React, { useState } from "react";
import {
  Music,
  FileText,
  Image as ImageIcon,
  ShieldAlert,
  Upload,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Volume2,
  FileJson,
  FolderInput,
} from "lucide-react";
import {
  AudioInputData,
  GarmentConstraint,
  GenerationPlan,
  ImageInputData,
  RenderReceipt,
} from "../types/toaster";

interface MediaInputPanelProps {
  audio: AudioInputData | null;
  lyrics: string;
  image: ImageInputData | null;
  garmentConstraint: GarmentConstraint;
  historicalPlansCount: number;
  historicalReceiptsCount: number;
  onAudioUpload: (audioData: AudioInputData) => void;
  onLyricsChange: (text: string) => void;
  onImageUpload: (imageData: ImageInputData) => void;
  onGarmentConstraintChange: (constraint: GarmentConstraint) => void;
  onImportHistoricalPlans: (plans: GenerationPlan[]) => void;
  onImportHistoricalReceipts: (receipts: RenderReceipt[]) => void;
}

export const MediaInputPanel: React.FC<MediaInputPanelProps> = ({
  audio,
  lyrics,
  image,
  garmentConstraint,
  historicalPlansCount,
  historicalReceiptsCount,
  onAudioUpload,
  onLyricsChange,
  onImageUpload,
  onGarmentConstraintChange,
  onImportHistoricalPlans,
  onImportHistoricalReceipts,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"audio" | "lyrics" | "image" | "garment" | "history">("audio");

  // Local handler for Audio upload
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const audioObj = new Audio(URL.createObjectURL(file));
    audioObj.onloadedmetadata = () => {
      onAudioUpload({
        filename: file.name,
        durationSeconds: Math.round(audioObj.duration) || 180,
        bpmEstimate: 124 + Math.floor(Math.random() * 20),
        energyProfile: [0.2, 0.4, 0.7, 0.9, 0.8, 0.6, 0.3, 0.7, 0.9, 0.5],
      });
    };
  };

  // Local handler for Image upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      onImageUpload({
        filename: file.name,
        mimeType: file.type || "image/png",
        base64: evt.target?.result as string,
        previewUrl: URL.createObjectURL(file),
      });
    };
    reader.readAsDataURL(file);
  };

  // Local handler for JSON file import (Plans / Receipts / Constraints)
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed) && parsed[0]?.topology) {
          onImportHistoricalPlans(parsed);
        } else if (parsed.topology && parsed.material) {
          onImportHistoricalPlans([parsed]);
        } else if (parsed.executedPlan || (Array.isArray(parsed) && parsed[0]?.executedPlan)) {
          onImportHistoricalReceipts(Array.isArray(parsed) ? parsed : [parsed]);
        } else if (parsed.maxStiffnessLimit || parsed.allowedFitModes) {
          onGarmentConstraintChange(parsed);
        }
      } catch (err) {
        alert("Invalid JSON file provided.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="border border-slate-800 bg-slate-900/80 rounded-lg overflow-hidden shadow-xl mb-6">
      {/* Panel Header Toggle */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-200">
            Multimodal Source Signals & Constraints
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            {audio ? "Audio Loaded" : "No Audio"} • {lyrics ? "Lyrics Active" : "No Lyrics"} •{" "}
            {image ? "Image Active" : "No Image"}
          </span>
        </div>
        <button className="text-slate-400 hover:text-cyan-300 transition-colors">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4">
          {/* Tabs for Input Modalities */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setActiveTab("audio")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "audio"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio Stem</span>
              {audio && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab("lyrics")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "lyrics"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Lyrics & Timestamps</span>
              {lyrics && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab("image")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "image"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cover Photo</span>
              {image && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab("garment")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "garment"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Garment Specs</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                activeTab === "history"
                  ? "bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FolderInput className="w-3.5 h-3.5 text-emerald-400" />
              <span>History ({historicalPlansCount} Plans / {historicalReceiptsCount} Receipts)</span>
            </button>
          </div>

          {/* Tab 1: Audio */}
          {activeTab === "audio" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="md:col-span-2 border border-slate-800 bg-slate-950/60 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    Audio Track Profile
                  </span>
                  <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors">
                    <Upload className="w-3 h-3" />
                    Upload .WAV / .MP3
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {audio ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded border border-slate-800">
                      <div>
                        <div className="text-cyan-300 font-bold">{audio.filename}</div>
                        <div className="text-[11px] text-slate-400">
                          Duration: {Math.floor(audio.durationSeconds / 60)}m {audio.durationSeconds % 60}s •
                          Estimated BPM: {audio.bpmEstimate || 128} • Key: {audio.keyEstimate || "Unknown"}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Acoustic Signal Ready
                      </span>
                    </div>

                    {/* Simulated Transient Energy Waveform */}
                    <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Transient Energy Density Profile
                      </div>
                      <div className="flex items-end gap-1 h-10 w-full pt-2">
                        {(audio.energyProfile || [0.3, 0.5, 0.8, 0.4, 0.9, 0.2, 0.6, 0.8, 1.0, 0.4]).map((val, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-cyan-900 to-cyan-400 rounded-t hover:bg-cyan-300 transition-colors"
                            style={{ height: `${val * 100}%` }}
                            title={`Interval ${i * 10}s - Energy: ${Math.round(val * 100)}%`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-md text-slate-500">
                    <Music className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <div>No audio stem loaded. Upload audio or click "Sample Preset" above.</div>
                  </div>
                )}
              </div>

              <div className="bg-slate-950/60 p-3 rounded-md border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-slate-300 font-semibold mb-1">Acoustic Analysis Scope</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3 font-sans">
                    Gemini inspects transient spikes, sub-harmonic density, and beat intervals to infer
                    structural scene blocks, motion choreography, and temporal density.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 p-2 rounded border border-cyan-900">
                  ⚡ Auto-extracted: BPM 128 • Sub-bass transient trigger @ 00:45s
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Lyrics */}
          {activeTab === "lyrics" && (
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">
                  Lyric Text & Timestamped Intervals (.LRC or Timestamped lines)
                </span>
                <span className="text-[11px] text-slate-500">
                  Format: [mm:ss.xx] Lyric text excerpt
                </span>
              </div>
              <textarea
                value={lyrics}
                onChange={(e) => onLyricsChange(e.target.value)}
                rows={6}
                placeholder="Paste lyrics with timestamps here..."
                className="w-full bg-slate-950 text-cyan-200 border border-slate-800 rounded-md p-3 focus:outline-none focus:border-cyan-600 font-mono text-xs leading-relaxed"
              />
            </div>
          )}

          {/* Tab 3: Image */}
          {activeTab === "image" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="md:col-span-1 bg-slate-950/60 p-3 rounded-md border border-slate-800 flex flex-col items-center justify-center">
                {image?.previewUrl ? (
                  <div className="text-center space-y-2">
                    <img
                      src={image.previewUrl}
                      alt="Cover Preview"
                      className="w-32 h-32 object-contain rounded border border-slate-700 bg-slate-900"
                    />
                    <div className="text-cyan-300 text-[11px]">{image.filename}</div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <div>No cover photo uploaded</div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 border border-slate-800 bg-slate-950/60 rounded-md p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-semibold">Cover Art & Palette Inspiration</span>
                    <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors">
                      <Upload className="w-3 h-3" />
                      Select Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-3">
                    Gemini inspects image composition, lighting, dominance, and palette gradients to propose
                    primary, secondary, and accent colors for the Haunted renderer.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-[10px] text-slate-400 font-mono">Sample Palette Extract:</div>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded bg-[#0F172A] border border-slate-700" title="#0F172A"></div>
                    <div className="w-5 h-5 rounded bg-[#38BDF8] border border-slate-700" title="#38BDF8"></div>
                    <div className="w-5 h-5 rounded bg-[#F43F5E] border border-slate-700" title="#F43F5E"></div>
                    <div className="w-5 h-5 rounded bg-[#020617] border border-slate-700" title="#020617"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Garment Constraint Spec */}
          {activeTab === "garment" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800">
                <div className="text-amber-300 font-semibold flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Garment Constraint Controls ({garmentConstraint.name})
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-400 block mb-1">
                      Max Stiffness Limit: <span className="text-cyan-300">{garmentConstraint.maxStiffnessLimit}</span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={garmentConstraint.maxStiffnessLimit}
                      onChange={(e) =>
                        onGarmentConstraintChange({
                          ...garmentConstraint,
                          maxStiffnessLimit: parseFloat(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">
                      Seam Stress Cap: <span className="text-cyan-300">{garmentConstraint.seamStressCap} MPa</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="5"
                      value={garmentConstraint.seamStressCap}
                      onChange={(e) =>
                        onGarmentConstraintChange({
                          ...garmentConstraint,
                          seamStressCap: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Forbidden Colors (Hex):</span>
                    <div className="flex items-center gap-2">
                      {garmentConstraint.forbiddenColors.map((color, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800">
                <span className="text-slate-300 font-semibold block mb-2">
                  Garment Spec JSON Definition
                </span>
                <pre className="text-[11px] text-cyan-200/90 font-mono bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto max-h-40">
                  {JSON.stringify(garmentConstraint, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 5: History & Coverage Upload */}
          {activeTab === "history" && (
            <div className="bg-slate-950/80 p-4 rounded-md border border-slate-800 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <FileJson className="w-4 h-4 text-emerald-400" />
                    Mutation Memory & Historical Coverage Importer
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Import historical <code className="text-cyan-300">GenerationPlan.json</code> or{" "}
                    <code className="text-cyan-300">RenderReceipt.json</code> files to populate the used-region
                    coverage map for "Take me somewhere unvisited".
                  </p>
                </div>

                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 rounded border border-emerald-800 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Import JSON File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleJsonImport}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block">Loaded Historical Plans:</span>
                  <span className="text-2xl font-bold text-cyan-300">{historicalPlansCount}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block">Loaded Executed Receipts:</span>
                  <span className="text-2xl font-bold text-cyan-300">{historicalReceiptsCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
