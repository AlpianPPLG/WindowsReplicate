import React, { useState } from "react";
import { TaskbarTheme } from "../types";
import { Language, TRANSLATIONS } from "../translations";
import { Brush, Monitor, ShieldCheck, Sun, Moon, Sparkles, Languages } from "lucide-react";

interface SettingsProps {
  theme: TaskbarTheme;
  onUpdateTheme: (updates: Partial<TaskbarTheme>) => void;
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
}

export default function Settings({ theme, onUpdateTheme, lang, onLanguageChange }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<"personalization" | "system" | "language">("personalization");

  const isDark = theme.theme === "dark";
  const t = TRANSLATIONS[lang];

  // Wallpapers list
  const wallpapers = [
    { name: "Atmospheric Media", value: "bg-immersive-media" },
    { name: "Bloom Default Blue", value: "bg-gradient-to-tr from-sky-450 via-indigo-900 to-slate-900" },
    { name: "Cosmic Nebula Red", value: "bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-950" },
    { name: "Forest Aura Green", value: "bg-gradient-to-tr from-zinc-900 via-emerald-950 to-teal-900" },
    { name: "Solar Wind Amber", value: "bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950" },
    { name: "Chamber Slate Dark", value: "bg-neutral-900" }
  ];

  // Accent colors list
  const accents = [
    { name: "Atmospheric Glass", bgClass: "bg-indigo-600", textClass: "text-indigo-600" },
    { name: "Aurora Cyan", bgClass: "bg-cyan-500", textClass: "text-cyan-500" },
    { name: "Classic Sky", bgClass: "bg-sky-500", textClass: "text-sky-500" },
    { name: "Royal Purple", bgClass: "bg-violet-600", textClass: "text-violet-600" },
    { name: "Emerald Moss", bgClass: "bg-emerald-600", textClass: "text-emerald-600" },
    { name: "Volcanic Red", bgClass: "bg-rose-600", textClass: "text-rose-600" },
    { name: "Warm Amber", bgClass: "bg-amber-500", textClass: "text-amber-500" }
  ];

  return (
    <div className="flex-1 flex min-h-0 bg-transparent text-inherit select-none h-full font-sans">
      {/* 1. Left Navigation Menu Sidebar */}
      <div className={`w-36 flex flex-col p-2.5 gap-1 border-r select-none h-full ${
        isDark ? "bg-black/10 border-white/5" : "bg-black/5 border-slate-350/10"
      }`}>
        <button
          onClick={() => setActiveTab("personalization")}
          className={`p-2 px-3.5 rounded-lg text-[10.5px] font-bold flex items-center gap-2 cursor-default transition active:scale-95 text-left ${
            activeTab === "personalization"
              ? `${theme.accentClass || "bg-sky-500"} text-white shadow-md`
              : "hover:bg-slate-500/10 text-inherit"
          }`}
        >
          <Brush className="w-3.5 h-3.5 text-inherit" />
          <span>{lang === "id" ? "Personalisasi" : "Personalization"}</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`p-2 px-3.5 rounded-lg text-[10.5px] font-bold flex items-center gap-2 cursor-default transition active:scale-95 text-left ${
            activeTab === "system"
              ? `${theme.accentClass || "bg-sky-500"} text-white shadow-md`
              : "hover:bg-slate-500/10 text-inherit"
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-inherit" />
          <span>{lang === "id" ? "Info Sistem" : "System Details"}</span>
        </button>

        <button
          onClick={() => setActiveTab("language")}
          className={`p-2 px-3.5 rounded-lg text-[10.5px] font-bold flex items-center gap-2 cursor-default transition active:scale-95 text-left ${
            activeTab === "language"
              ? `${theme.accentClass || "bg-sky-500"} text-white shadow-md`
              : "hover:bg-slate-500/10 text-inherit"
          }`}
        >
          <Languages className="w-3.5 h-3.5 text-inherit" />
          <span>{lang === "id" ? "Bahasa" : "Language"}</span>
        </button>
      </div>

      {/* 2. Main Configs Page Content */}
      <div className="flex-1 overflow-y-auto p-5 select-none">
        {activeTab === "personalization" && (
          <div className="space-y-6">
            {/* Dark Mode toggle */}
            <div className={`p-4 rounded-xl border border-white/5 relative flex items-center justify-between h-18 ${
              isDark ? "bg-black/15" : "bg-white/40"
            }`}>
              <div className="flex gap-2 items-center leading-normal">
                {isDark ? <Moon className="w-5 h-5 text-sky-400" /> : <Sun className="w-5 h-5 text-amber-500 animate-pulse" />}
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] font-bold">{t.themeStyling}</span>
                  <span className="text-[10px] text-slate-500">{t.themeToggleDesc}</span>
                </div>
              </div>
              <button
                onClick={() => onUpdateTheme({ theme: isDark ? "light" : "dark" })}
                className={`p-1 px-3.5 text-[10px] rounded font-bold ${theme.accentClass || "bg-sky-500"} text-white hover:opacity-90 transition cursor-default shadow-md`}
              >
                {isDark ? t.switchLightMode : t.switchDarkMode}
              </button>
            </div>

            {/* Background selection */}
            <div>
              <span className="text-[12px] font-bold text-slate-400 block mb-3 leading-none select-none">{t.chooseWallpaper}</span>
              <div className="grid grid-cols-2 gap-3">
                {wallpapers.map((wp) => {
                  const isActive = wp.value === theme.wallpaper;
                  return (
                    <button
                      key={wp.name}
                      onClick={() => onUpdateTheme({ wallpaper: wp.value })}
                      className={`h-16 rounded-lg relative overflow-hidden transition-all duration-200 cursor-default border group active:scale-95 ${wp.value} ${
                        isActive
                          ? `border-white ring-2 ring-white/30 font-bold shadow-md`
                          : "border-white/10 hover:border-white/20"
                      }`}
                    >
                      {/* Check indicator overlap */}
                      <span className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition flex items-center justify-center text-[10.5px] font-semibold text-white tracking-wide text-shadow">
                        {wp.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent color picker */}
            <div>
              <span className="text-[12px] font-bold text-slate-400 block mb-3 leading-none select-none">{t.accentTitle}</span>
              <div className="flex gap-2.5">
                {accents.map((acc) => {
                  const isActive = acc.bgClass === theme.accentClass;
                  return (
                    <button
                      key={acc.name}
                      onClick={() => onUpdateTheme({ accentColor: acc.name, accentClass: acc.bgClass })}
                      className={`${acc.bgClass} h-7 w-7 rounded-full relative cursor-default border transition duration-150 active:scale-85 ${
                        isActive ? "border-white ring-2 ring-sky-400 shadow-md scale-105" : "border-white/20 hover:scale-[1.05]"
                      }`}
                      title={acc.name}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div className="space-y-5">
            {/* Spec details card */}
            <div className={`p-4 rounded-xl border border-white/5 relative flex gap-3 h-20 items-center justify-between ${
              isDark ? "bg-black/15" : "bg-white/40"
            }`}>
              <div className="flex gap-3.5 items-center leading-normal">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-bold">{lang === "id" ? "Status Sistem" : "System Status"}</span>
                  <span className="text-[10px] text-slate-500">{lang === "id" ? "Lingkungan Cloud Sandbox Node-JS" : "Node JS Sandbox Cloud Environment"}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded select-none">
                {lang === "id" ? "TERVERIFIKASI AMAN" : "VERIFIED SECURE"}
              </span>
            </div>

            <div className="text-[11px] space-y-3 font-medium px-1 pr-3">
              <span className="text-[12px] font-bold text-slate-400 block border-b border-white/5 pb-1 select-none">{t.specifications}</span>
              <div className="flex justify-between select-all leading-relaxed">
                <span className="text-slate-500">{t.sysVersion}</span>
                <span>Win11-Web (Node/Vite Clone) v1.4</span>
              </div>
              <div className="flex justify-between select-all leading-relaxed">
                <span className="text-slate-500">{t.engine}</span>
                <span>React 19.x & Express v4</span>
              </div>
              <div className="flex justify-between select-all leading-relaxed">
                <span className="text-slate-500">{t.compiler}</span>
                <span>Tailwind CSS v4.0</span>
              </div>
              <div className="flex justify-between select-all leading-relaxed">
                <span className="text-slate-500">{t.directory}</span>
                <span>./sandbox/ file registry</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "language" && (
          <div className="space-y-5">
            {/* Language Selection Tab */}
            <div className={`p-4 rounded-xl border border-white/5 relative flex gap-3.5 items-center ${
              isDark ? "bg-black/15" : "bg-white/40"
            }`}>
              <Languages className="w-6 h-6 text-indigo-400" />
              <div className="flex flex-col text-left">
                <span className="text-[12px] font-bold">{t.languageTitle}</span>
                <span className="text-[10px] text-slate-500">{t.languageDesc}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-[12px] font-bold text-slate-400 block border-b border-white/5 pb-1 select-none">
                {lang === "id" ? "Pilih Bahasa Antarmuka" : "Choose Interface Language"}
              </span>

              {/* Language picker layout buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onLanguageChange("id")}
                  className={`w-full p-3.5 rounded-lg border text-left flex justify-between items-center transition cursor-default ${
                    lang === "id"
                      ? `${theme.accentClass || "bg-sky-500"} border-transparent text-white shadow-md font-bold`
                      : isDark
                        ? "bg-white/5 hover:bg-white/10 border-white/5"
                        : "bg-black/5 hover:bg-black/10 border-slate-350/10"
                  }`}
                >
                  <div className="flex flex-col leading-normal">
                    <span className="text-[11.5px]">Bahasa Indonesia</span>
                    <span className={`text-[9.5px] ${lang === "id" ? "text-white/80" : "text-slate-400"}`}>
                      Ganti bahasa navigasi dan sistem ke Bahasa Indonesia
                    </span>
                  </div>
                  {lang === "id" && <span className="text-xs">✓</span>}
                </button>

                <button
                  onClick={() => onLanguageChange("en")}
                  className={`w-full p-3.5 rounded-lg border text-left flex justify-between items-center transition cursor-default ${
                    lang === "en"
                      ? `${theme.accentClass || "bg-sky-500"} border-transparent text-white shadow-md font-bold`
                      : isDark
                        ? "bg-white/5 hover:bg-white/10 border-white/5"
                        : "bg-black/5 hover:bg-black/10 border-slate-350/10"
                  }`}
                >
                  <div className="flex flex-col leading-normal">
                    <span className="text-[11.5px]">English (United States)</span>
                    <span className={`text-[9.5px] ${lang === "en" ? "text-white/80" : "text-slate-400"}`}>
                      Switch overall navigation and interface language to English
                    </span>
                  </div>
                  {lang === "en" && <span className="text-xs">✓</span>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export function SettingsIcon() {
  return <span className="text-[15px]">⚙️</span>;
}
