import React from "react";
import { AppWindow, TaskbarTheme } from "../types";
import { Language } from "../translations";
import { 
  Wifi, 
  Volume2, 
  Battery, 
  Keyboard, 
  Search, 
  CloudSun,
  LayoutGrid,
  Bell,
  X
} from "lucide-react";

interface TaskbarProps {
  theme: TaskbarTheme;
  windows: AppWindow[];
  lang: Language;
  onLanguageToggle: () => void;
  onToggleStartMenu: () => void;
  onToggleWidgets: () => void;
  onToggleActionCenter: () => void;
  onToggleNotifications: () => void;
  onToggleKeyboard: () => void;
  onAppLaunch: (type: AppWindow["appType"]) => void;
  onAppFocus: (id: string) => void;
  onCloseWindow: (id: string) => void;
  onShowDesktop: () => void;
  currentTime: Date;
  volume: number;
}

export default function Taskbar({
  theme,
  windows,
  lang,
  onLanguageToggle,
  onToggleStartMenu,
  onToggleWidgets,
  onToggleActionCenter,
  onToggleNotifications,
  onToggleKeyboard,
  onAppLaunch,
  onAppFocus,
  onCloseWindow,
  onShowDesktop,
  currentTime,
  volume,
}: TaskbarProps) {
  const isDark = theme.theme === "dark";
  const [hoveredApp, setHoveredApp] = React.useState<AppWindow["appType"] | null>(null);

  // Match system apps keys to icons
  const dockApps: { type: AppWindow["appType"]; name: string; icon: string; bg: string }[] = [
    { type: "explorer", name: lang === "id" ? "Penjelajah Berkas" : "File Explorer", icon: "📁", bg: "bg-yellow-500/20 text-yellow-500" },
    { type: "notepad", name: "Notepad", icon: "📝", bg: "bg-blue-500/20 text-blue-500" },
    { type: "calculator", name: lang === "id" ? "Kalkulator" : "Calculator", icon: "🧮", bg: "bg-emerald-500/20 text-emerald-500" },
    { type: "terminal", name: "Terminal", icon: "💻", bg: "bg-neutral-500/20 text-neutral-300" },
    { type: "browser", name: "Browser", icon: "🌐", bg: "bg-sky-500/20 text-sky-400" },
    { type: "mediaplayer", name: "Media Player", icon: "🎵", bg: "bg-rose-500/20 text-rose-500" },
    { type: "clock", name: lang === "id" ? "Jam & Alarm" : "Clock & Timers", icon: "⏱️", bg: "bg-amber-500/20 text-amber-500" },
    { type: "taskmanager", name: lang === "id" ? "Pengelola Tugas" : "Task Manager", icon: "📊", bg: "bg-indigo-500/20 text-indigo-400" },
    { type: "settings", name: lang === "id" ? "Pengaturan" : "Settings", icon: "⚙️", bg: "bg-slate-500/20 text-slate-500" },
  ];

  // Format Date (e.g., 7:38 PM)
  const formatTime = (time: Date) => {
    return time.toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format Date String (e.g., 6/9/2026)
  const formatDate = (time: Date) => {
    return time.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      id="system-taskbar"
      className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-between px-3 select-none border-t border-white/5 z-[999] backdrop-blur-2xl ${
        isDark ? "bg-black/40 text-slate-100" : "bg-white/45 text-slate-900"
      }`}
    >
      {/* Left section: Widgets & Weather */}
      <div className="flex items-center w-[160px] min-w-[120px]">
        <button
          onClick={onToggleWidgets}
          className={`flex items-center gap-2.5 px-3 py-1 h-9 rounded-md transition-all duration-200 cursor-default hover:bg-slate-500/10 active:bg-slate-500/5`}
        >
          <CloudSun className="w-5 h-5 text-sky-400" />
          <div className="hidden sm:flex flex-col text-[11px] leading-tight text-left">
            <span className="font-semibold text-inherit">78°F</span>
            <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>Partly Sunny</span>
          </div>
        </button>
      </div>

      {/* Middle section: App Icons Dock (Centered) */}
      <div className="flex items-center gap-1.5 justify-center flex-1">
        {/* Start Button */}
        <button
          onClick={onToggleStartMenu}
          title="Start"
          className="p-2 h-9 w-9 rounded-md flex items-center justify-center transition-all duration-200 cursor-default hover:bg-slate-500/10 active:bg-slate-500/5 group"
        >
          <LayoutGrid className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
        </button>

        {/* Search Input Button */}
        <button
          onClick={onToggleStartMenu}
          className="hidden md:flex items-center gap-2.5 px-3 bg-slate-500/10 hover:bg-slate-500/15 transition-all text-slate-400 border border-white/5 h-8.5 rounded-full text-xs w-40 text-left active:scale-[0.98]"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[11px]">{lang === "id" ? "Ketik ke pencarian..." : "Type here to search"}</span>
        </button>

        {/* App Icons */}
        {dockApps.map((app) => {
          // Check if app is open
          const openWindows = windows.filter((w) => w.appType === app.type && w.isOpen);
          const isOpen = openWindows.length > 0;
          const isFocused = openWindows.some((w) => w.isFocused);

          const handleClick = () => {
            if (isOpen) {
              // Toggle minimize/focus
              const focusedWin = openWindows.find((w) => w.isFocused);
              if (focusedWin) {
                onToggleActionCenter(); // close active menus first
                onAppLaunch(app.type); // will trigger minimization or toggle
              } else {
                onAppFocus(openWindows[0].id);
              }
            } else {
              onAppLaunch(app.type);
            }
          };

          return (
            <div
              key={app.type}
              onMouseEnter={() => setHoveredApp(app.type)}
              onMouseLeave={() => setHoveredApp(null)}
              className="relative flex items-center justify-center"
            >
              <button
                onClick={handleClick}
                className={`relative h-9.5 w-9.5 rounded-md flex items-center justify-center transition-all duration-150 cursor-default ${
                  isFocused
                    ? isDark
                      ? "bg-white/10 shadow-sm"
                      : "bg-black/10 shadow-sm"
                    : "hover:bg-slate-500/10 hover:scale-[1.05]"
                } active:scale-95`}
              >
                {/* App Icon (lucide or unicode icon) */}
                <span className="text-xl leading-none">{app.icon}</span>

                {/* Activation Indicator Line */}
                {isOpen && (
                  <span
                    className={`absolute bottom-0.5 h-1 rounded-full transition-all duration-300 ${
                      isFocused ? `w-4 ${theme.accentClass || "bg-sky-500"} animate-pulse` : "w-1.5 bg-slate-400"
                    }`}
                  />
                )}
              </button>

              {/* Grouped Hover Window Previews */}
              {isOpen && hoveredApp === app.type && (
                <div 
                  className={`absolute bottom-11 left-1/2 transform -translate-x-1/2 p-2 rounded-xl border shadow-2xl flex gap-2.5 z-[9999] backdrop-blur-2xl animate-fade-in text-left ${
                    isDark 
                      ? "bg-zinc-950/95 text-slate-100 border-white/10 shadow-black/80" 
                      : "bg-white/95 text-slate-900 border-neutral-300 shadow-black/20"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {openWindows.map((win) => (
                    <div
                      key={win.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppFocus(win.id);
                        setHoveredApp(null);
                      }}
                      className={`w-36 p-2 rounded-lg border flex flex-col justify-between transition-all duration-150 h-24 ${
                        win.isFocused 
                          ? `border-indigo-500 bg-indigo-500/10` 
                          : isDark
                            ? `border-white/5 bg-white/5 hover:bg-white/10 text-white`
                            : `border-black/5 bg-black/5 hover:bg-black/10 text-black`
                      } relative group/card cursor-default select-none`}
                    >
                      {/* Preview Card Header */}
                      <div className="flex justify-between items-center w-full min-w-0 pb-1 border-b border-white/5">
                        <div className="flex items-center gap-1 min-w-0 max-w-[80%]">
                          <span className="text-xs leading-none">{app.icon}</span>
                          <span className="text-[9.5px] font-bold truncate leading-none">{win.title}</span>
                        </div>
                        {/* Tiny close button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloseWindow(win.id);
                          }}
                          className="w-4 h-4 rounded-full bg-black/10 hover:bg-red-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors z-20"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Stylized App Thumbnail Preview */}
                      <div className="flex-1 flex items-center justify-center min-h-0 pt-1 pointer-events-none">
                        {win.appType === "notepad" && (
                          <div className="flex flex-col gap-1 w-full opacity-60">
                            <div className="h-0.5 bg-current/30 rounded w-[90%]" />
                            <div className="h-0.5 bg-current/30 rounded w-[75%]" />
                            <div className="h-0.5 bg-current/30 rounded w-[80%]" />
                            <div className="h-0.5 bg-current/30 rounded w-[60%]" />
                          </div>
                        )}
                        {win.appType === "calculator" && (
                          <div className="grid grid-cols-3 gap-0.5 w-[50px] opacity-60">
                            {[...Array(6)].map((_, i) => (
                              <div key={i} className="h-1.5 bg-current/30 rounded-sm" />
                            ))}
                          </div>
                        )}
                        {win.appType === "terminal" && (
                          <div className="bg-black/30 rounded p-1 font-mono text-[5px] text-green-400 w-full h-11 overflow-hidden flex flex-col gap-0.5">
                            <span>PS C:\&gt; node --version</span>
                            <span>v20.11.0</span>
                            <span className="animate-pulse">_</span>
                          </div>
                        )}
                        {win.appType === "explorer" && (
                          <div className="flex gap-1 items-center justify-center opacity-65">
                            <span className="text-xs">📁</span>
                            <span className="text-xs">📁</span>
                            <span className="text-xs">📁</span>
                          </div>
                        )}
                        {win.appType === "browser" && (
                          <div className="flex flex-col gap-1 w-full opacity-60">
                            <div className="h-2 bg-current/10 rounded-sm flex items-center px-1">
                              <div className="h-0.5 bg-current/30 rounded w-10" />
                            </div>
                            <div className="flex justify-center mt-1"><span className="text-xs">🌐</span></div>
                          </div>
                        )}
                        {!["notepad", "calculator", "terminal", "explorer", "browser"].includes(win.appType) && (
                          <div className="flex items-center justify-center opacity-65">
                            <span className="text-2xl">{app.icon}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right section: System Tray & Clock */}
      <div className="flex items-center gap-1.5 justify-end w-[240px] min-w-[180px]">
        {/* Virtual Keyboard Trigger */}
        <button
          onClick={onToggleKeyboard}
          title="Touch Keyboard"
          className="p-2.5 h-9 w-9 rounded-md flex items-center justify-center transition-all duration-200 cursor-default hover:bg-slate-500/10 text-slate-400 active:scale-95"
        >
          <Keyboard className="w-5 h-5 text-inherit" />
        </button>

        {/* Input Language Locale */}
        <button
          onClick={onLanguageToggle}
          title={lang === "id" ? "Pilih Bahasa / Switch Language" : "Switch Language / Ubah Bahasa"}
          className="hidden sm:inline text-[10px] font-bold text-sky-400 border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/15 hover:border-sky-500/40 px-2 py-1.5 rounded transition-all duration-150 tracking-wider leading-none cursor-default active:scale-95"
        >
          {lang === "id" ? "IND" : "ENG"}
        </button>

        {/* Action Center Trigger Grid (WiFi, Voice, Battery status group) */}
        <button
          onClick={onToggleActionCenter}
          title="Quick Settings"
          className="flex items-center gap-1.5 px-2.5 h-9 rounded-md transition-all duration-200 cursor-default hover:bg-slate-500/10 active:bg-slate-500/5 text-slate-400"
        >
          <Wifi className="w-4 h-4 text-sky-400" />
          <Volume2 className="w-4 h-4" />
          <Battery className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Date and Clock Trigger (Notification center calendar trigger) */}
        <button
          onClick={onToggleNotifications}
          title="Notification Center & Calendar"
          className="flex items-center gap-1 px-2.5 h-9 rounded-md text-right transition-all duration-200 cursor-default hover:bg-slate-500/10 active:bg-slate-500/5 text-slate-400 leading-tight"
        >
          <div className="flex flex-col text-[11px] font-medium items-end select-none text-inherit font-sans">
            <span className={`${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {formatTime(currentTime)}
            </span>
            <span className="text-[10px] text-slate-500">
              {formatDate(currentTime)}
            </span>
          </div>
          <Bell className="w-3.5 h-3.5 text-slate-400 ml-1.5 hover:text-sky-400" />
        </button>

        {/* Desktop Border Panel Switch */}
        <div
          onClick={onShowDesktop}
          title="Show Desktop"
          className="w-1.5 h-7.5 border-l border-white/10 hover:bg-sky-500/20 active:bg-sky-500/30 transition-all cursor-default self-center ml-1"
        />
      </div>
    </div>
  );
}
