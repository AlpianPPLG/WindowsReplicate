import React from "react";
import { TaskbarTheme } from "../types";
import { CloudSun, Search, Newspaper, TrendingUp, Info } from "lucide-react";

interface WidgetsPanelProps {
  isOpen: boolean;
  theme: TaskbarTheme;
}

export default function WidgetsPanel({ isOpen, theme }: WidgetsPanelProps) {
  if (!isOpen) return null;

  const isDark = theme.theme === "dark";

  const newsFeeds = [
    { title: "Windows 11 Web Replication breaks production sandbox constraints!", source: "TechCrunch", time: "20m ago" },
    { title: "Node.js 22 achieves extreme file writing throughput inside container runtimes.", source: "DevClash", time: "1h ago" },
    { title: "Vite + Tailwind CSS v4: The ultimate combination for lightweight UI development.", source: "WebStack", time: "4h ago" },
    { title: "Express.js remains the most ubiquitous microserver framework.", source: "ServerSide", time: "1d ago" }
  ];

  const stocks = [
    { name: "MSFT", price: "421.90", change: "+1.25%", up: true },
    { name: "GOOGL", price: "173.50", change: "+2.40%", up: true },
    { name: "NVDA", price: "123.40", change: "-0.95%", up: false },
    { name: "AAPL", price: "193.10", change: "+0.15%", up: true }
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute bottom-14 left-3 w-[380px] h-[calc(100%-70px)] rounded-xl overflow-hidden shadow-2xl border border-white/10 z-[1000] flex flex-col p-5 select-none animate-slide-in-left ${
        isDark ? "glass text-slate-100" : "glass-light text-slate-900"
      }`}
    >
      {/* 1. Logo / Name banner */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-bold tracking-wide flex items-center gap-1.5 opacity-90">
          🔮 Widgets Panel
        </span>
        <button className="text-[10px] text-sky-400 p-1 hover:underline">Add widgets</button>
      </div>

      {/* 2. Widgets Search bar */}
      <div className={`flex items-center gap-2.5 px-3 py-1.5 border rounded-lg text-xs shadow-inner mb-4 ${
        isDark ? "border-white/10 bg-black/25" : "border-slate-300 bg-white/50"
      }`}>
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search world news or query topics..."
          className="flex-1 bg-transparent border-none outline-none text-inherit text-[11px]"
          disabled
        />
      </div>

      {/* 3. Cards Arena */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Weather card */}
        <div className={`p-4 rounded-xl border border-white/5 relative overflow-hidden flex flex-col leading-normal justify-between h-36 ${
          isDark ? "bg-gradient-to-br from-black/20 to-sky-950/20" : "bg-gradient-to-br from-sky-400/10 to-indigo-500/15"
        }`}>
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Jakarta, Indonesia</span>
              <span className="text-3xl font-extrabold text-inherit mt-1 select-all">78°F</span>
            </div>
            <CloudSun className="w-11 h-11 text-amber-400 animate-pulse" />
          </div>

          <div className="flex justify-between items-end text-[10px] text-slate-450 border-t border-white/5 pt-2.5">
            <span>Partly Sunny</span>
            <div className="flex gap-3 font-sans">
              <span>H: 82° L: 72°</span>
              <span>Wind: 8 mph</span>
            </div>
          </div>
        </div>

        {/* Stocks market tracker card */}
        <div className={`p-4 rounded-xl border border-white/5 ${
          isDark ? "bg-black/15" : "bg-white/40"
        }`}>
          <span className="text-[11.5px] font-bold text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Markets index
          </span>
          <div className="grid grid-cols-2 gap-3.5">
            {stocks.map((stock) => (
              <div key={stock.name} className="flex justify-between items-center p-2 rounded-lg bg-slate-500/5 hover:bg-slate-500/10 transition-all">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold">{stock.name}</span>
                  <span className="text-[10px] text-slate-450">${stock.price}</span>
                </div>
                <span className={`text-[10.5px] font-bold ${stock.up ? "text-emerald-400" : "text-rose-400"}`}>
                  {stock.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hot News Feed Card */}
        <div className={`p-4 rounded-xl border border-white/5 flex-1 ${
          isDark ? "bg-black/15" : "bg-white/40"
        }`}>
          <span className="text-[11.5px] font-bold text-slate-400 mb-3.5 flex items-center gap-1.5 border-b border-white/5 pb-2">
            <Newspaper className="w-3.5 h-3.5 text-sky-400" /> Top Stories
          </span>
          <div className="space-y-3.5">
            {newsFeeds.map((feed, idx) => (
              <div key={idx} className="flex flex-col leading-normal p-1.5 rounded-lg hover:bg-slate-500/5 cursor-default transition-all">
                <span className="text-[10.5px] font-medium text-inherit hover:text-sky-400 line-clamp-2 leading-relaxed">
                  {feed.title}
                </span>
                <div className="flex gap-2 text-[9px] text-slate-500 mt-1 select-none font-sans">
                  <span>{feed.source}</span>
                  <span>•</span>
                  <span>{feed.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom note */}
      <div className="text-[9.5px] text-slate-500 text-center flex items-center justify-center gap-1 mt-3">
        <Info className="w-3 h-3 text-slate-550" />
        <span>Weather data and tech feeds are updated daily.</span>
      </div>
    </div>
  );
}
