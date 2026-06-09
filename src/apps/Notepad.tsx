import React, { useState, useEffect } from "react";
import { TaskbarTheme } from "../types";
import { Save, FilePlus, LogOut, Check, FileCode } from "lucide-react";

interface NotepadProps {
  theme: TaskbarTheme;
  initialFilePath?: string;
  onFileSaved?: (filePath: string) => void;
  onClose?: () => void;
}

export default function Notepad({
  theme,
  initialFilePath,
  onFileSaved,
  onClose,
}: NotepadProps) {
  const [filePath, setFilePath] = useState(initialFilePath || "Untitled.txt");
  const [content, setContent] = useState("");
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const isDark = theme.theme === "dark";

  // Load initial content if filePath is provided
  useEffect(() => {
    if (initialFilePath) {
      setFilePath(initialFilePath);
      fetch(`/api/files/read?path=${encodeURIComponent(initialFilePath)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to read");
          return res.json();
        })
        .then((data) => {
          setContent(data.content || "");
        })
        .catch((err) => {
          console.error(err);
          setContent(`[Error reading file or file is empty at: ${initialFilePath}]`);
        });
    }
  }, [initialFilePath]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const response = await fetch("/api/files/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: filePath,
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Save error");
      }

      const data = await response.json();
      setSaveStatus("saved");
      if (onFileSaved) {
        onFileSaved(data.path);
      }
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  const handleNew = () => {
    setFilePath("New_File.txt");
    setContent("");
    setIsEditingPath(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent text-inherit select-text h-full">
      {/* 1. File Menu Bar */}
      <div className={`p-1 px-2.5 border-b flex gap-3 text-xs font-medium select-none ${
        isDark ? "bg-black/15 border-white/5" : "bg-white/10 border-slate-350/10"
      }`}>
        <button
          onClick={handleNew}
          className="px-2 py-1 rounded hover:bg-slate-500/10 active:bg-slate-500/5 cursor-default transition flex items-center gap-1 text-inherit"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
        <button
          onClick={handleSave}
          className="px-2 py-1 rounded hover:bg-slate-500/10 active:bg-slate-500/5 cursor-default transition flex items-center gap-1 text-inherit"
        >
          <Save className="w-3.5 h-3.5 text-sky-400" />
          <span>Save</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-2 py-1 rounded hover:bg-red-500/15 hover:text-red-400 active:bg-red-500/5 cursor-default transition flex items-center gap-1 text-inherit"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        )}
      </div>

      {/* 2. File Path Bar detail editing option */}
      <div className={`p-1.5 px-4 text-[10.5px] border-b flex items-center justify-between select-none ${
        isDark ? "bg-black/5 border-white/5 text-slate-450" : "bg-black/5 border-slate-350/10 text-slate-550"
      }`}>
        <div className="flex items-center gap-1.5 flex-1 select-all mr-3">
          <FileCode className="w-3.5 h-3.5 text-slate-500" />
          {isEditingPath ? (
            <input
              type="text"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              onBlur={() => setIsEditingPath(false)}
              onKeyDown={(e) => e.key === "Enter" && setIsEditingPath(false)}
              className={`p-0.5 px-1.5 w-64 border rounded text-[11px] bg-transparent outline-none ${
                isDark ? "border-white/15 text-white bg-black/20" : "border-slate-300 text-slate-800 bg-white"
              }`}
              autoFocus
            />
          ) : (
            <span
              onClick={() => setIsEditingPath(true)}
              className="hover:underline cursor-pointer font-mono font-bold font-serif"
              title="Click to rename file position"
            >
              {filePath}
            </span>
          )}
        </div>

        {/* Saved Toast Status indicators */}
        <div className="flex items-center font-sans select-none">
          {saveStatus === "saving" && <span className="text-sky-400">Saving...</span>}
          {saveStatus === "saved" && (
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          {saveStatus === "error" && <span className="text-red-400 font-bold">Failed to save!</span>}
          {saveStatus === "idle" && <span className="text-slate-500">Edit and save directly</span>}
        </div>
      </div>

      {/* 3. Text Area Box */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your notes or scripts here. Click Save inside the header menus to persist..."
        className={`flex-1 p-5 border-none outline-none resize-none font-mono text-[12.5px] leading-relaxed select-text placeholder:italic bg-transparent ${
          isDark 
            ? "text-slate-100 placeholder:text-slate-600 bg-black/10" 
            : "text-slate-900 placeholder:text-slate-400 bg-white/20"
        }`}
        style={{ caretColor: "var(--win-accent, #0078D4)" }}
      />
    </div>
  );
}

// Custom simple icon reference
export function NotepadIcon() {
  return <span className="text-[15px]">📝</span>;
}
