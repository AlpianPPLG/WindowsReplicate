import React from "react";
import { QuickSettings, TaskbarTheme } from "../types";
import { 
  Wifi, 
  Volume2, 
  Bluetooth, 
  Plane, 
  Moon, 
  Battery, 
  Sun,
  Settings,
  ShieldCheck
} from "lucide-react";

interface ActionCenterProps {
  isOpen: boolean;
  theme: TaskbarTheme;
  settings: QuickSettings;
  onUpdateSettings: (updates: Partial<QuickSettings>) => void;
  onAppLaunch: (appType: "settings") => void;
}

export default function ActionCenter({
  isOpen,
  theme,
  settings,
  onUpdateSettings,
  onAppLaunch,
}: ActionCenterProps) {
  if (!isOpen) return null;

  const isDark = theme.theme === "dark";

  const toggleItems = [
    { key: "wifi" as keyof QuickSettings, name: "Wi-Fi", icon: Wifi, color: "text-sky-400" },
    { key: "bluetooth" as keyof QuickSettings, name: "Bluetooth", icon: Bluetooth, color: "text-blue-400" },
    { key: "airplane" as keyof QuickSettings, name: "Airplane mode", icon: Plane, color: "text-amber-400" },
    { key: "nightLight" as keyof QuickSettings, name: "Night light", icon: Moon, color: "text-purple-400" },
    { key: "batterySaver" as keyof QuickSettings, name: "Battery saver", icon: Battery, color: "text-emerald-400" },
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute bottom-14 right-3 w-[360px] rounded-xl overflow-hidden shadow-2xl border border-white/10 z-[1000] flex flex-col p-5 select-none animate-slide-up ${
        isDark ? "glass text-slate-100" : "glass-light text-slate-900"
      }`}
    >
      {/* 1. Quick Toggles Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {toggleItems.map((item) => {
          const isActive = settings[item.key] as boolean;
          const Icon = item.icon;

          const toggleActive = () => {
            onUpdateSettings({ [item.key]: !isActive });
          };

          return (
            <button
              key={item.key}
              onClick={toggleActive}
              className={`flex flex-col items-center justify-center p-3 h-22 rounded-lg transition-all duration-150 cursor-default border border-white/5 active:scale-95 ${
                isActive
                  ? `${theme.accentClass || "bg-sky-500"} text-white shadow-md border-white/10`
                  : isDark
                    ? "bg-white/10 hover:bg-white/15 text-slate-300"
                    : "bg-black/5 hover:bg-black/10 text-slate-700"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${isActive ? "text-white" : item.color}`} />
              <span className="text-[10.5px] font-medium leading-none text-center">
                {isActive ? "On" : "Off"}
              </span>
              <span className="text-[9.5px] text-slate-400 mt-1 select-none text-center truncate w-full">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Sliders Panel */}
      <div className="space-y-4 mb-5">
        {/* Brightness Slider */}
        <div className="flex items-center gap-3">
          <Sun className="w-4 h-4 text-slate-450" />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center text-[10px] text-slate-400 select-none mb-1">
              <span>Brightness</span>
              <span>{settings.brightness}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.brightness}
              onChange={(e) => onUpdateSettings({ brightness: parseInt(e.target.value) })}
              className="w-full accent-sky-500 h-1 cursor-pointer rounded-lg bg-slate-500/20 outline-none"
            />
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-slate-450" />
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center text-[10px] text-slate-400 select-none mb-1">
              <span>Volume</span>
              <span>{settings.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => onUpdateSettings({ volume: parseInt(e.target.value) })}
              className="w-full accent-sky-500 h-1 cursor-pointer rounded-lg bg-slate-500/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom action summary */}
      <div className={`pt-3.5 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-400`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>System Secured & Online</span>
        </div>

        {/* Short-path launch settings */}
        <button
          onClick={() => onAppLaunch("settings")}
          className={`p-1.5 px-3 rounded flex items-center gap-1 bg-slate-500/10 hover:bg-slate-500/15 active:scale-95 transition-all text-inherit`}
          title="Open Settings App"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>All Settings</span>
        </button>
      </div>
    </div>
  );
}
