import React, { useState } from "react";
import { AppWindow, TaskbarTheme } from "../types";
import { Language, TRANSLATIONS } from "../translations";
import { 
  Power, 
  Search, 
  FileText, 
  Sparkles,
  Info
} from "lucide-react";

interface StartMenuProps {
  isOpen: boolean;
  theme: TaskbarTheme;
  lang: Language;
  onAppLaunch: (type: AppWindow["appType"], data?: any) => void;
  onPowerOff: (mode: "shutdown" | "restart" | "sleep") => void;
  onSearchInputFocus?: () => void;
}

export default function StartMenu({
  isOpen,
  theme,
  lang,
  onAppLaunch,
  onPowerOff,
}: StartMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPowerMenu, setShowPowerMenu] = useState(false);

  if (!isOpen) return null;

  const isDark = theme.theme === "dark";
  const t = TRANSLATIONS[lang];

  // Apps inside structural Start Menu
  const allApps: { type: AppWindow["appType"] | "toast"; name: string; icon: string; desc: string }[] = [
    { 
      type: "explorer", 
      name: lang === "id" ? "Penjelajah Berkas" : "File Explorer", 
      icon: "📁", 
      desc: lang === "id" ? "Telusuri direktori berkas lokal" : "Browse sandbox directories" 
    },
    { 
      type: "notepad", 
      name: "Notepad", 
      icon: "📝", 
      desc: lang === "id" ? "Edit berkas teks sederhana" : "Edit text files on server" 
    },
    { 
      type: "calculator", 
      name: lang === "id" ? "Kalkulator Ext" : "Calculator", 
      icon: "🧮", 
      desc: lang === "id" ? "Selesaikan operasi matematika" : "Solve math equations" 
    },
    { 
      type: "terminal", 
      name: "Terminal", 
      icon: "💻", 
      desc: lang === "id" ? "Interaksi dengan shell perintah" : "Interact with terminal shell" 
    },
    { 
      type: "browser", 
      name: "Edge Browser", 
      icon: "🌐", 
      desc: lang === "id" ? "Jelajahi halaman web global" : "Browse any web page" 
    },
    { 
      type: "mediaplayer", 
      name: "Media Player", 
      icon: "🎵", 
      desc: lang === "id" ? "Putar musik dan trek audio" : "Play music beats and tracks" 
    },
    { 
      type: "clock", 
      name: lang === "id" ? "Jam & Alarm" : "Clock", 
      icon: "⏱️", 
      desc: lang === "id" ? "Lacak jam dan alarm sistem" : "Keep track of system clock" 
    },
    { 
      type: "taskmanager", 
      name: lang === "id" ? "Pengelola Tugas" : "Task Manager", 
      icon: "📊", 
      desc: lang === "id" ? "Pantau kinerja perangkat keras" : "Monitor system hardware" 
    },
    { 
      type: "settings", 
      name: lang === "id" ? "Pengaturan" : "Settings", 
      icon: "⚙️", 
      desc: lang === "id" ? "Sesuaikan personalisasi & tema" : "Customize desktop wallpapers" 
    },
    { 
      type: "toast", 
      name: "Xbox", 
      icon: "🎮", 
      desc: lang === "id" ? "Mainkan game arcade virtual" : "Play virtual arcade games" 
    },
    { 
      type: "toast", 
      name: "Solitaire", 
      icon: "🃏", 
      desc: lang === "id" ? "Permainan kartu klasik populer" : "Classic block card game" 
    },
    { 
      type: "toast", 
      name: "Spotify", 
      icon: "🟢", 
      desc: lang === "id" ? "Dengarkan saluran podcast" : "Listen to online podcast channels" 
    },
    { 
      type: "toast", 
      name: "Store", 
      icon: "🛍️", 
      desc: lang === "id" ? "Unduh modul simulasi digital" : "Download simulated modules" 
    },
    { 
      type: "toast", 
      name: "Mail", 
      icon: "✉️", 
      desc: lang === "id" ? "Hubungkan akun surat elektronik" : "Connect email accounts" 
    },
    { 
      type: "toast", 
      name: "Copilot AI", 
      icon: "💠", 
      desc: lang === "id" ? "Tanyakan asisten pintar kecerdasan" : "Ask AI assistance helper" 
    },
  ];

  // Recommended files inside sandboxed registry
  const recommendations = [
    { name: "Welcome.txt", path: "Welcome.txt", icon: "📄", desc: lang === "id" ? "Panduan memulai pertama" : "Get started guidelines" },
    { name: "Meeting_Notes.txt", path: "Documents/Meeting_Notes.txt", icon: "📄", desc: lang === "id" ? "Diubah 2 jam yang lalu" : "Modified 2 hours ago" },
    { name: "Readme_First.txt", path: "Desktop/Readme_First.txt", icon: "📄", desc: lang === "id" ? "Berkas teks di desktop" : "Desktop text note file" },
    { name: "credits.txt", path: "Downloads/credits.txt", icon: "📄", desc: lang === "id" ? "Dibuat dengan React & Express" : "Created with React & Express" }
  ];

  // Filtering based on search query
  const filteredApps = allApps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppLaunch = (app: typeof allApps[0]) => {
    if (app.type === "toast") {
      alert(t.simulationToast);
    } else {
      onAppLaunch(app.type);
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()} // Prevent clicking within start menu from closing it
      className={`absolute bottom-14 left-1/2 -translate-x-[50%] w-[580px] max-w-[95%] h-[680px] rounded-xl overflow-hidden shadow-2xl border border-white/10 z-[1000] flex flex-col select-none animate-slide-up ${
        isDark ? "glass text-slate-100" : "glass-light text-slate-900"
      }`}
    >
      {/* 1. Search Bar */}
      <div className="p-6 pb-4">
        <div className={`flex items-center gap-3 px-4 py-2 border rounded-full text-sm shadow-inner transition-all duration-300 ${
          isDark 
            ? "border-white/10 bg-black/25 focus-within:bg-black/35 focus-within:border-sky-500" 
            : "border-slate-300 bg-white/50 focus-within:bg-white focus-within:border-sky-500"
        }`}>
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-inherit text-xs"
          />
        </div>
      </div>

      {/* 2. Main Apps Arena */}
      <div className="flex-1 overflow-y-auto px-6 select-none select-none">
        {/* Pinned section heading */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[12px] font-semibold text-slate-400">{t.pinned}</span>
          <button className={`text-[11px] px-2 py-0.5 rounded transition bg-slate-500/10 hover:bg-slate-500/15 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {t.allApps}
          </button>
        </div>

        {/* Pinned Apps Grid */}
        <div className="grid grid-cols-6 gap-y-5 gap-x-2 justify-items-center mb-8">
          {filteredApps.map((app) => (
            <button
              key={app.name}
              onClick={() => handleAppLaunch(app)}
              className="group flex flex-col items-center justify-center p-2 rounded-lg hover:bg-slate-500/10 transition-all duration-150 w-20 text-center relative focus:outline-none"
            >
              <span className="text-3xl leading-none mb-1.5 transform group-hover:scale-110 transition-transform">{app.icon}</span>
              <span className="text-[11px] leading-tight text-inherit w-full overflow-hidden text-ellipsis truncate">{app.name}</span>
            </button>
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-6 py-6 text-center text-slate-400 text-xs">
              {t.noMatchingApps}
            </div>
          )}
        </div>

        {/* Recommended Files Area */}
        {searchQuery === "" && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[12px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> {t.recommended}
              </span>
              <button className={`text-[11px] px-2 py-0.5 rounded transition bg-slate-500/10 hover:bg-slate-500/15 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                {t.more}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 max-h-[170px] overflow-hidden mb-6">
              {recommendations.map((rec) => (
                <button
                  key={rec.name}
                  onClick={() => onAppLaunch("notepad", { filePath: rec.path })}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-500/10 text-left transition-all duration-150 w-full"
                >
                  <span className="text-2xl leading-none">{rec.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium text-inherit truncate leading-normal">{rec.name}</span>
                    <span className="text-[10px] text-slate-500 truncate leading-snug">{rec.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 3. Bottom Profile Bar */}
      <div className={`p-4 px-6 flex items-center justify-between border-t select-none ${
        isDark ? "bg-black/15 border-white/5" : "bg-black/5 border-slate-300/10"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white text-[12px] font-bold shadow">
            AD
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-semibold leading-normal">{lang === "id" ? "Administrator Aktif" : "Administrator"}</span>
            <span className="text-[9.5px] text-slate-400 leading-tight">active@win11-web</span>
          </div>
        </div>

        {/* Power Controls Popover Launcher */}
        <div className="relative">
          <button
            onClick={() => setShowPowerMenu(!showPowerMenu)}
            className="p-2 w-9 h-9 rounded-md flex items-center justify-center transition-all bg-slate-500/5 hover:bg-slate-500/15 text-slate-400 hover:text-sky-400 active:scale-95"
            title="Power Controls"
          >
            <Power className="w-4 h-4 text-inherit" />
          </button>

          {/* Actual Power Dropdown */}
          {showPowerMenu && (
            <div className={`absolute bottom-11 right-0 w-32 border border-white/10 rounded-lg shadow-xl overflow-hidden py-1 z-50 animate-slide-up ${
              isDark ? "bg-zinc-900" : "bg-white"
            }`}>
              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onPowerOff("sleep");
                }}
                className={`w-full text-left px-3.5 py-1.5 text-[11px] font-medium flex items-center gap-2.5 hover:bg-slate-500/10 ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <span>🌙</span> {t.sleep}
              </button>
              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onPowerOff("restart");
                }}
                className={`w-full text-left px-3.5 py-1.5 text-[11px] font-medium flex items-center gap-2.5 hover:bg-slate-500/10 ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <span>🔄</span> {t.restart}
              </button>
              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onPowerOff("shutdown");
                }}
                className={`w-full text-left px-3.5 py-1.5 text-[11px] font-medium flex items-center gap-2.5 hover:bg-red-600 hover:text-white transition-colors ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <span>🛑</span> {t.shutdown}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
