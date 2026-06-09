import React, { useState, useEffect } from "react";
import { TaskbarTheme, FSItem } from "../types";
import { 
  ArrowLeft, 
  FolderPlus, 
  Trash2, 
  FileText, 
  Folder, 
  HardDrive, 
  ChevronRight,
  RefreshCw,
  Clock
} from "lucide-react";

interface FileExplorerProps {
  theme: TaskbarTheme;
  initialDirectory?: string;
  onFileSelect?: (filePath: string) => void;
}

export default function FileExplorer({
  theme,
  initialDirectory,
  onFileSelect,
}: FileExplorerProps) {
  const [currentDir, setCurrentDir] = useState(initialDirectory || "");
  const [items, setItems] = useState<FSItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FSItem | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDark = theme.theme === "dark";

  const fetchDirectory = async (dirPath: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files/list?path=${encodeURIComponent(dirPath)}`);
      if (!response.ok) {
        throw new Error("Failed to load directory");
      }
      const data = await response.json();
      setItems(data.items || []);
      setCurrentDir(data.currentPath || "");
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory(currentDir);
  }, []);

  const handleItemSelect = (item: FSItem) => {
    setSelectedItem(item);
  };

  const handleItemDoubleClick = (item: FSItem) => {
    if (item.isDirectory) {
      fetchDirectory(item.path);
    } else {
      if (item.name.endsWith(".txt") && onFileSelect) {
        onFileSelect(item.path); // Opens in Notepad
      } else {
        alert(`File opened: ${item.name}. Download completed!`);
      }
    }
  };

  const handleBack = () => {
    if (!currentDir) return;
    const parts = currentDir.split(/[/\\]/);
    parts.pop();
    const parentPath = parts.join("/");
    fetchDirectory(parentPath);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const response = await fetch("/api/files/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: currentDir,
          name: newFolderName,
        }),
      });

      if (!response.ok) throw new Error("Folder creation failed");
      
      setNewFolderName("");
      setShowNewFolderModal(false);
      fetchDirectory(currentDir);
    } catch (err) {
      alert("Folder already exists or error occurred!");
    }
  };

  const handleDeleteSelectedItem = async () => {
    if (!selectedItem) return;
    const accept = window.confirm(`Are you sure you want to delete ${selectedItem.name}?`);
    if (!accept) return;

    try {
      const response = await fetch("/api/files/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: selectedItem.path,
        }),
      });

      if (!response.ok) throw new Error("Deletion failed");
      
      fetchDirectory(currentDir);
    } catch {
      alert("Failed to delete the selected item!");
    }
  };

  // Humanize bytes sizes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Split paths into breadcrumbs
  const breadcrumbs = currentDir ? currentDir.split(/[/\\]/) : [];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent text-inherit select-none h-full">
      {/* 1. Header Toolbar Controls */}
      <div className={`p-1.5 px-3 border-b flex items-center justify-between select-none ${
        isDark ? "bg-black/15 border-white/5" : "bg-white/10 border-slate-350/10"
      }`}>
        <div className="flex items-center gap-2">
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={!currentDir}
            className={`p-1 rounded transition text-inherit cursor-default active:scale-90 ${
              !currentDir ? "opacity-35 cursor-not-allowed" : "hover:bg-slate-500/10"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* New folder */}
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="p-1 px-2.5 rounded hover:bg-slate-500/10 text-xs font-semibold cursor-default flex items-center gap-1.5 text-sky-400"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder</span>
          </button>

          {/* Delete item */}
          <button
            onClick={handleDeleteSelectedItem}
            disabled={!selectedItem}
            className={`p-1 px-2.5 rounded text-xs font-semibold cursor-default flex items-center gap-1.5 active:scale-95 transition ${
              !selectedItem ? "opacity-35 cursor-not-allowed text-slate-400" : "hover:bg-red-500/15 text-red-400"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>

        {/* Refresh indicator */}
        <button
          onClick={() => fetchDirectory(currentDir)}
          className="p-1 hover:bg-slate-500/10 rounded transition text-inherit flex items-center gap-1 font-sans text-[10px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-400" : ""}`} />
          Refresh
        </button>
      </div>

      {/* 2. Breadcrumbs path bar */}
      <div className={`p-1.5 px-4 border-b flex items-center gap-1 font-sans text-[10.5px] select-all truncate ${
        isDark ? "bg-black/5 border-white/5 text-slate-400" : "bg-black/5 border-slate-350/10 text-slate-500"
      }`}>
        <HardDrive className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold cursor-pointer" onClick={() => fetchDirectory("")}>This PC</span>
        <ChevronRight className="w-3 h-3 text-slate-550" />
        <span className="font-semibold cursor-pointer" onClick={() => fetchDirectory("")}>Sandbox</span>
        {breadcrumbs.map((folder, idx) => {
          const folderSubPath = breadcrumbs.slice(0, idx + 1).join("/");
          return (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-550" />
              <span
                className="hover:underline cursor-pointer"
                onClick={() => fetchDirectory(folderSubPath)}
              >
                {folder}
              </span>
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Items content grid view */}
      <div className="flex-1 overflow-y-auto p-4 select-none">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-450 mb-1" />
            <span>Reading records...</span>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(85px,1fr))] gap-y-5 gap-x-3 justify-items-center">
            {items.map((item) => {
              const isSelected = selectedItem?.path === item.path;
              return (
                <div
                  key={item.path}
                  onClick={() => handleItemSelect(item)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  className={`group flex flex-col items-center p-2 rounded-lg text-center select-none w-20 cursor-default active:scale-[0.98] transition-all border ${
                    isSelected
                      ? "bg-sky-500/15 border-sky-455 text-sky-400"
                      : "border-transparent hover:bg-slate-500/10"
                  }`}
                >
                  <span className="text-3xl leading-none mb-1 shadow-sm block transform group-hover:scale-105 transition-transform">
                    {item.isDirectory ? "📁" : item.name.endsWith(".txt") ? "📄" : "💾"}
                  </span>
                  <span className="text-[11px] leading-snug w-full overflow-hidden text-ellipsis truncate tracking-wide">
                    {item.name}
                  </span>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="col-span-full py-8 text-center text-slate-500 text-xs font-sans">
                Directory is empty. Create subdirectories or text files!
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom action panel summary details */}
      {selectedItem && (
        <div className={`p-2.5 px-4 text-[10px] font-medium border-t flex justify-between select-all ${
          isDark ? "bg-black/10 border-white/5 text-slate-400" : "bg-black/5 border-slate-350/10 text-slate-650"
        }`}>
          <span>Selected: {selectedItem.name}</span>
          <div className="flex gap-4 font-sans">
            {!selectedItem.isDirectory && <span>Size: {formatBytes(selectedItem.size)}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-550" /> Modified: {new Date(selectedItem.modifiedAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* New Folder Modal Panel */}
      {showNewFolderModal && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-[2px]">
          <div className={`w-80 rounded-xl overflow-hidden shadow-2xl p-4 border border-white/10 ${
            isDark ? "glass bg-[#1a1a1a] text-white" : "glass-light bg-[#fafafa] text-slate-800"
          }`}>
            <span className="text-xs font-bold block mb-3 leading-none">Create New subfolder</span>
            <input
              type="text"
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className={`w-full p-1.5 px-3 border rounded text-[11px] bg-transparent outline-none mb-4 ${
                isDark ? "border-white/15 text-white" : "border-slate-300 text-slate-800"
              }`}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="p-1 px-3 text-[10px] rounded hover:bg-slate-500/10 transition cursor-default text-inherit"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="p-1 px-4 text-[10px] rounded font-bold bg-sky-500 text-white hover:bg-sky-600 transition cursor-default"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export function FolderIcon() {
  return <span className="text-[15px]">📁</span>;
}
