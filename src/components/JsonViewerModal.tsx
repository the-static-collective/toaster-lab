import React, { useState } from "react";
import { X, Copy, Download, Check, FileCode, AlertCircle } from "lucide-react";

interface JsonViewerModalProps {
  title: string;
  data: any;
  filename?: string;
  onClose: () => void;
  onSaveModifiedJson?: (updatedObj: any) => void;
}

export const JsonViewerModal: React.FC<JsonViewerModalProps> = ({
  title,
  data,
  filename = "generation_plan.json",
  onClose,
  onSaveModifiedJson,
}) => {
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(data, null, 2)
  );
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonText(val);
    try {
      JSON.parse(val);
      setParseError(null);
    } catch (err: any) {
      setParseError(err.message || "Invalid JSON syntax");
    }
  };

  const handleSave = () => {
    if (parseError) return;
    try {
      const parsed = JSON.parse(jsonText);
      if (onSaveModifiedJson) {
        onSaveModifiedJson(parsed);
      }
      onClose();
    } catch (err) {
      alert("Cannot save invalid JSON.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono text-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              {title}
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
        <div className="p-5 space-y-3 flex-1 overflow-y-auto flex flex-col">
          {parseError && (
            <div className="p-2.5 rounded bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <textarea
            value={jsonText}
            onChange={handleTextChange}
            rows={18}
            className="w-full flex-1 bg-slate-950 text-cyan-200 border border-slate-800 rounded-lg p-3 font-mono text-xs focus:outline-none focus:border-cyan-600 leading-relaxed resize-none"
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy JSON"}
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              Export File
            </button>
          </div>

          {onSaveModifiedJson && (
            <button
              onClick={handleSave}
              disabled={!!parseError}
              className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50"
            >
              Save Modified Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
