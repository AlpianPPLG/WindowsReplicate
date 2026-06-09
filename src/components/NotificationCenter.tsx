import React, { useState } from "react";
import { TaskbarTheme } from "../types";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, ClipboardList } from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  theme: TaskbarTheme;
  currentTime: Date;
}

export default function NotificationCenter({
  isOpen,
  theme,
  currentTime,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: "System Update", desc: "Express Engine & Vite compiler fully synced.", time: "Just now", type: "system" },
    { id: 2, title: "Windows Sandbox Active", desc: "Writing directly to safe server directories.", time: "10 mins ago", type: "explorer" },
    { id: 3, title: "Keyboard Detected", desc: "Multilingual input capabilities installed.", time: "1 hour ago", type: "keyboard" }
  ]);

  if (!isOpen) return null;

  const isDark = theme.theme === "dark";

  // Generate current month days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // padding for week offset
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const currentDays = getDaysInMonth(currentTime);
  const activeDay = currentTime.getDate();

  const monthName = currentTime.toLocaleString("en-US", { month: "long" });
  const yearName = currentTime.getFullYear();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute bottom-14 right-3 w-[360px] h-[calc(100%-70px)] rounded-xl overflow-hidden shadow-2xl border border-white/10 z-[1000] flex flex-col p-4 select-none animate-slide-in-right ${
        isDark ? "glass text-slate-100" : "glass-light text-slate-900"
      }`}
    >
      {/* 1. Header: Notifications Title and Clear All */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[12px] font-semibold text-slate-400">Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={() => setNotifications([])}
            className={`text-[10px] px-2 py-0.5 rounded transition bg-slate-500/15 hover:bg-slate-500/25 ${isDark ? "text-slate-350" : "text-slate-650"}`}
          >
            Clear all
          </button>
        )}
      </div>

      {/* 2. Notifications Feed Container */}
      <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-1">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-3 rounded-lg border border-white/5 relative flex gap-2.5 transition-all w-full leading-normal ${
              isDark ? "bg-black/15 hover:bg-black/25" : "bg-white/40 hover:bg-white/50"
            }`}
          >
            <div className="text-lg leading-none">
              {n.type === "system" ? "⚙️" : n.type === "explorer" ? "📁" : "🎹"}
            </div>
            <div className="flex flex-col min-w-0 pr-4">
              <span className="text-[11px] font-semibold">{n.title}</span>
              <span className="text-[10px] text-slate-450 leading-relaxed mt-0.5">{n.desc}</span>
              <span className="text-[9px] text-slate-550 mt-1 select-none">{n.time}</span>
            </div>

            <button
              onClick={() => removeNotification(n.id)}
              className="absolute top-2.5 right-2.5 p-0.5 hover:bg-slate-500/10 rounded text-slate-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs py-8 space-y-1">
            <ClipboardList className="w-8 h-8 text-slate-600 mb-1" />
            <span className="font-medium">No new notifications</span>
            <span className="text-[10px] text-slate-650 max-w-[80%]">Any server outputs or activity indicators will display here.</span>
          </div>
        )}
      </div>

      {/* 3. Calendar Card Area */}
      <div className={`p-3.5 rounded-xl border border-white/5 ${
        isDark ? "bg-black/10" : "bg-white/35"
      }`}>
        {/* Calendar Nav */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-[11.5px] font-semibold flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-sky-400" />
            {monthName} {yearName}
          </span>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-slate-500/10 rounded"><ChevronLeft className="w-3.5 h-3.5 text-inherit" /></button>
            <button className="p-1 hover:bg-slate-500/10 rounded"><ChevronRight className="w-3.5 h-3.5 text-inherit" /></button>
          </div>
        </div>

        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 gap-y-1 text-center font-sans">
          {weekdayNames.map((day) => (
            <span key={day} className="text-[10px] font-semibold text-slate-500">
              {day}
            </span>
          ))}

          {/* Actual days grid */}
          {currentDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />;
            }
            const isActive = day === activeDay;
            return (
              <button
                key={`day-${day}`}
                className={`h-7 w-7 text-[10.5px] font-medium rounded-full mx-auto flex items-center justify-center cursor-default transition-all duration-150 ${
                  isActive
                    ? "bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20"
                    : isDark
                      ? "hover:bg-white/10 text-slate-200"
                      : "hover:bg-black/5 text-slate-800"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
