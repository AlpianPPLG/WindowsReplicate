import React, { useState, useEffect, useRef } from "react";
import { TaskbarTheme } from "../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Timer as TimerIcon, 
  Trophy, 
  Bell, 
  Plus, 
  Trash2, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Globe 
} from "lucide-react";

interface ClockAppProps {
  theme: TaskbarTheme;
  lang: "id" | "en";
}

const CLOCK_T = {
  en: {
    alarmsTab: "Alarms",
    worldTab: "World Clock",
    stopwatchTab: "Stopwatch",
    yourAlarms: "Your Daily Alarms",
    addAlarm: "Add Alarm",
    configSettings: "Configure New Alarm Settings",
    cancel: "Cancel",
    pickTime: "Pick Time",
    alarmLabel: "Alarm Label",
    repeatDays: "Repeat Days",
    saveAlarm: "Save Alarm Action",
    noAlarmsSaved: "No alarms saved. Tap \"Add Alarm\" to create your first chime alert!",
    once: "Once",
    everyday: "Everyday",
    deleteAlarm: "Delete Alarm",
    worldTimeTitle: "World Time & Visual Zones",
    citySelector: "City Selector",
    yourLocation: "Your Location",
    pcSystemTime: "PC System Time Zone",
    alarmTriggered: "ALARM CHIME TRIGGERED",
    dismissAlarm: "Dismiss Alarm",
    pause: "Pause",
    start: "Start",
    lap: "Lap",
    reset: "Reset",
    lapN: "Lap",
    defaultLabel: "Daily Reminder Alarm",
    wakeUpLabel: "Wake up! ⏰"
  },
  id: {
    alarmsTab: "Alarm",
    worldTab: "Jam Dunia",
    stopwatchTab: "Stopwatch",
    yourAlarms: "Daftar Alarm Harian",
    addAlarm: "Tambah Alarm",
    configSettings: "Konfigurasi Setelan Alarm Baru",
    cancel: "Batal",
    pickTime: "Pilih Waktu",
    alarmLabel: "Label Alarm",
    repeatDays: "Hari Berulang",
    saveAlarm: "Simpan Alarm",
    noAlarmsSaved: "Tidak ada alarm disimpan. Klik \"Tambah Alarm\" untuk membuat alarm pertama Anda!",
    once: "Sekali",
    everyday: "Setiap Hari",
    deleteAlarm: "Hapus Alarm",
    worldTimeTitle: "Waktu Dunia & Visualisasi Peta Zona",
    citySelector: "Pilih Kota",
    yourLocation: "Lokasi Anda",
    pcSystemTime: "Zona Waktu Sistem Komputer",
    alarmTriggered: "ALARM BERBUNYI!",
    dismissAlarm: "Matikan Alarm",
    pause: "Jeda",
    start: "Mulai",
    lap: "Putaran",
    reset: "Atur Ulang",
    lapN: "Putaran",
    defaultLabel: "Alarm Pengingat Harian",
    wakeUpLabel: "Bangun! ⏰"
  }
};

interface Alarm {
  id: string;
  time: string; // "07:30" format
  period: "AM" | "PM";
  label: string;
  enabled: boolean;
  repeat: string[]; // ["Mon", "Tue"...]
}

interface WorldCity {
  id: string;
  name: string;
  country: string;
  offset: number; // offset in minutes relative to UTC
  x: number; // SVG map coordinates x
  y: number; // SVG map coordinates y
  desc: string;
}

export default function ClockApp({ theme, lang = "en" }: ClockAppProps) {
  const t = CLOCK_T[lang] || CLOCK_T.en;
  const [activeTab, setActiveTab] = useState<"alarm" | "stopwatch" | "world">("alarm");
  
  // Stopwatch states
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // World cities static collection
  const WORLD_CITIES: WorldCity[] = [
    { id: "ny", name: "New York", country: "USA", offset: -240, x: 220, y: 180, desc: "Eastern Standard Time" },
    { id: "london", name: "London", country: "UK", offset: 60, x: 460, y: 120, desc: "British Summer Time" },
    { id: "tokyo", name: "Tokyo", country: "Japan", offset: 540, x: 810, y: 170, desc: "Japan Standard Time" },
    { id: "sydney", name: "Sydney", country: "Australia", offset: 600, x: 850, y: 390, desc: "Australian Eastern Time" },
  ];

  // Active highlighted city state on map
  const [selectedCityId, setSelectedCityId] = useState<string>("ny");

  // Alarms persistent state
  const [alarms, setAlarms] = useState<Alarm[]>(() => {
    const saved = localStorage.getItem("clock_alarms");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved alarms", e);
      }
    }
    // Default initial alarms
    return [
      { id: "1", time: "07:00", period: "AM", label: "Morning Exercise 💪", enabled: true, repeat: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      { id: "2", time: "09:30", period: "PM", label: "Unwind & Relax 💻", enabled: false, repeat: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }
    ];
  });

  const [triggeredAlarm, setTriggeredAlarm] = useState<Alarm | null>(null);
  const triggeredMinutesRef = useRef<number | null>(null);

  // New Alarm Form States
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [newTime, setNewTime] = useState("07:30");
  const [newPeriod, setNewPeriod] = useState<"AM" | "PM">("AM");
  const [newLabel, setNewLabel] = useState("");
  const [newRepeat, setNewRepeat] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  const isDark = theme.theme === "dark";

  // Web Audio Context for Alarm chime synthetics
  const audioCtxRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<any>(null);

  // Sync alarms to localStorage
  useEffect(() => {
    localStorage.setItem("clock_alarms", JSON.stringify(alarms));
  }, [alarms]);

  // Audio synthetics sound trigger
  const startAlarmChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      
      // Beep loop
      alarmIntervalRef.current = setInterval(() => {
        if (!ctx) return;
        if (ctx.state === "suspended") {
          ctx.resume();
        }
        
        // Dynamic alarm ring sequence (C6 -> E6 -> G6 melodic arpeggio)
        const notes = [1046.50, 1318.51, 1567.98];
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
          
          gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.15 + 0.3);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime + index * 0.15);
          osc.stop(ctx.currentTime + index * 0.15 + 0.4);
        });
      }, 1000);
    } catch (e) {
      console.error("Audio Context failed", e);
    }
  };

  const stopAlarmChime = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // Clock tick & Alarm monitor triggers
  useEffect(() => {
    const alarmMonitor = setInterval(() => {
      const now = new Date();
      const curHours = now.getHours();
      const curMins = now.getMinutes();

      // For matching, construct current 12-hour period representation
      const currentPeriod = curHours >= 12 ? "PM" : "AM";
      let hour12 = curHours % 12;
      if (hour12 === 0) hour12 = 12;
      const currentFormattedTime = `${hour12.toString().padStart(2, "0")}:${curMins.toString().padStart(2, "0")}`;

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = dayNames[now.getDay()];

      alarms.forEach((alarm) => {
        if (!alarm.enabled) return;

        // Clean alarm matching representation
        const [alarmH, alarmM] = alarm.time.split(":");
        const cleanedAlarmTime = `${parseInt(alarmH).toString().padStart(2, "0")}:${alarmM.toString().padStart(2, "0")}`;

        if (cleanedAlarmTime === currentFormattedTime && alarm.period === currentPeriod) {
          // Check if matches repeat days list
          const isMatchDay = alarm.repeat.length === 0 || alarm.repeat.includes(currentDay);
          if (isMatchDay) {
            // Check double-ring block within exact same minute trigger
            if (triggeredMinutesRef.current !== curMins) {
              triggeredMinutesRef.current = curMins;
              setTriggeredAlarm(alarm);
              startAlarmChime();
            }
          }
        }
      });
    }, 1000);

    return () => {
      clearInterval(alarmMonitor);
    };
  }, [alarms]);

  const handleDismissAlarm = () => {
    setTriggeredAlarm(null);
    stopAlarmChime();
  };

  // Create Alarm actions
  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    const [h, m] = newTime.split(":");
    let finalH = parseInt(h);
    let finalPeriod: "AM" | "PM" = "AM";

    if (finalH >= 12) {
      finalPeriod = "PM";
      if (finalH > 12) finalH -= 12;
    } else {
      if (finalH === 0) finalH = 12;
    }

    const alarmString = `${finalH.toString().padStart(2, "0")}:${m}`;

    const newAlarmObj: Alarm = {
      id: Date.now().toString(),
      time: alarmString,
      period: finalPeriod,
      label: newLabel.trim() || "Daily Reminder Alarm",
      enabled: true,
      repeat: newRepeat,
    };

    setAlarms([...alarms, newAlarmObj]);
    setIsAddingAlarm(false);
    setNewTime("07:30");
    setNewLabel("");
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(
      alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const toggleDayInRepeat = (day: string) => {
    if (newRepeat.includes(day)) {
      setNewRepeat(newRepeat.filter((d) => d !== day));
    } else {
      setNewRepeat([...newRepeat, day]);
    }
  };

  // Stopwatch timer interval trigger
  useEffect(() => {
    let interval: any = null;
    if (swRunning) {
      interval = setInterval(() => {
        setSwTime((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  const formatStopwatch = (timeMs: number) => {
    const mins = Math.floor(timeMs / 60000);
    const secs = Math.floor((timeMs % 60000) / 1000);
    const ms = Math.floor((timeMs % 1000) / 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const handleLap = () => {
    setLaps([swTime, ...laps]);
  };

  const handleReset = () => {
    setSwRunning(false);
    setSwTime(0);
    setLaps([]);
  };

  // World Clock Calculations
  const getCityLocalTime = (offsetMins: number) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityDate = new Date(utc + offsetMins * 60000);
    return cityDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getCityDateString = (offsetMins: number) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const cityDate = new Date(utc + offsetMins * 60000);
    return cityDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Render variables
  const activeCity = WORLD_CITIES.find((c) => c.id === selectedCityId) || WORLD_CITIES[0];
  const localOffsetMins = -new Date().getTimezoneOffset(); // in minutes

  // Clean cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarmChime();
    };
  }, []);

  return (
    <div className="flex-1 flex min-h-0 bg-transparent text-inherit select-none h-full font-sans relative">
      {/* Tab controls sidebar */}
      <div className={`w-32 flex flex-col p-2 border-r gap-1 select-none h-full ${
        isDark ? "bg-black/10 border-white/5" : "bg-black/5 border-slate-350/10"
      }`}>
        <button
          onClick={() => setActiveTab("alarm")}
          className={`p-2 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-default transition active:scale-95 text-left ${
            activeTab === "alarm" 
              ? `${theme.accentClass || "bg-sky-500"} text-white shadow-md` 
              : "hover:bg-slate-500/10 text-inherit"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{t.alarmsTab}</span>
        </button>

        <button
          onClick={() => setActiveTab("world")}
          className={`p-2 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-default transition active:scale-95 text-left ${
            activeTab === "world" 
              ? `${theme.accentClass || "bg-sky-500"} text-white shadow-md` 
              : "hover:bg-slate-500/10 text-inherit"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.worldTab}</span>
        </button>

        <button
          onClick={() => setActiveTab("stopwatch")}
          className={`p-2 px-3 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-default transition active:scale-95 text-left ${
            activeTab === "stopwatch" 
              ? `${theme.accentClass || "bg-sky-500"} text-white shadow-md` 
              : "hover:bg-slate-500/10 text-inherit"
          }`}
        >
          <TimerIcon className="w-3.5 h-3.5" />
          <span>{t.stopwatchTab}</span>
        </button>
      </div>

      {/* Main tab context */}
      <div className="flex-1 overflow-y-auto p-4 select-none flex flex-col">
        
        {/* -- TAB 1: ALARMS LIST -- */}
        {activeTab === "alarm" && (
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex justify-between items-center select-none">
              <span className="text-[12px] font-bold text-slate-400 block leading-none">{t.yourAlarms}</span>
              <button
                onClick={() => setIsAddingAlarm(true)}
                className={`p-1 px-3 text-[10px] rounded font-bold transition flex items-center gap-1 cursor-default shadow-md text-white ${
                  theme.accentClass || "bg-blue-600"
                } hover:opacity-90`}
              >
                <Plus className="w-3 h-3" /> {t.addAlarm}
              </button>
            </div>

            {/* Quick adding inline sheet */}
            {isAddingAlarm && (
              <form onSubmit={handleCreateAlarm} className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-3 relative text-left">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">{t.configSettings}</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingAlarm(false)}
                    className="text-[9.5px] hover:text-red-400 font-bold"
                  >
                    {t.cancel}
                  </button>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="flex flex-col gap-1 w-1/2">
                    <label className="text-[8.5px] font-semibold text-slate-500">{t.pickTime}</label>
                    <input 
                      type="time" 
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="p-1.5 text-xs rounded border border-white/10 text-slate-105 bg-black/20 font-mono tracking-wider focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-1/2">
                    <label className="text-[8.5px] font-semibold text-slate-500 font-sans">{t.alarmLabel}</label>
                    <input 
                      type="text"
                      placeholder={t.wakeUpLabel}
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="p-1 px-2 text-xs rounded border border-white/10 text-slate-105 bg-black/20 focus:outline-none focus:border-indigo-500 w-full"
                    />
                  </div>
                </div>

                {/* Days Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[8.5px] font-semibold text-slate-500">{t.repeatDays}</label>
                  <div className="flex gap-1 justify-between">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const isActive = newRepeat.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDayInRepeat(day)}
                          className={`w-7 h-7 text-[8.5px] font-bold rounded-full border transition flex items-center justify-center cursor-default ${
                            isActive 
                              ? `${theme.accentClass || "bg-indigo-600 border-white/20"} text-white font-extrabold`
                              : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
                          }`}
                        >
                          {lang === "id" ? {
                            "Mon": "S", "Tue": "S", "Wed": "R", "Thu": "K", "Fri": "J", "Sat": "S", "Sun": "M"
                          }[day] || day.substring(0, 1) : day.substring(0, 1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-1.5 text-[10.5px] rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-default text-white shadow-md ${
                    theme.accentClass || "bg-indigo-600"
                  } hover:opacity-90`}
                >
                  {t.saveAlarm}
                </button>
              </form>
            )}

            {/* List alarms */}
            <div className="flex-1 space-y-2 pr-1 select-text">
              {alarms.length === 0 ? (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                  <Bell className="w-8 h-8 opacity-20" />
                  <span className="text-[11px] font-medium leading-normal">{t.noAlarmsSaved}</span>
                </div>
              ) : (
                alarms.map((alarm) => (
                  <div 
                    key={alarm.id} 
                    className={`p-3 rounded-lg border border-white/5 flex gap-3 justify-between items-center select-none ${
                      alarm.enabled 
                        ? isDark ? "bg-indigo-950/20 shadow-inner" : "bg-white/70"
                        : "bg-black/15 opacity-65"
                    } transition-all duration-200`}
                  >
                    <div className="flex flex-col text-left">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold font-mono tracking-tight">{alarm.time}</span>
                        <span className="text-[10px] font-bold text-slate-500">{alarm.period}</span>
                      </div>
                      <span className="text-[10.5px] font-semibold text-slate-350 truncate max-w-[200px]">{alarm.label}</span>
                      
                      {/* Active Days list */}
                      <span className="text-[8.5px] text-slate-500 mt-1 uppercase font-bold tracking-wider">
                        {alarm.repeat.length === 0 
                          ? t.once 
                          : alarm.repeat.length === 7 
                            ? t.everyday 
                            : alarm.repeat.map(d => lang === 'id' ? {
                              "Mon": "Sen", "Tue": "Sel", "Wed": "Rab", "Thu": "Kam", "Fri": "Jum", "Sat": "Sab", "Sun": "Min"
                            }[d] || d : d).join(", ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Fluent style switch */}
                      <button
                        onClick={() => handleToggleAlarm(alarm.id)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-default ${
                          alarm.enabled ? (theme.accentClass || "bg-sky-500") : "bg-neutral-600/30"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                          alarm.enabled ? "transform translate-x-4" : ""
                        }`} />
                      </button>

                      <button
                        onClick={() => handleDeleteAlarm(alarm.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-md text-slate-400 hover:text-red-400 transition cursor-default"
                        title={t.deleteAlarm}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* -- TAB 2: WORLD CLOCK WITH VISUAL MAP -- */}
        {activeTab === "world" && (
          <div className="flex-1 flex flex-col gap-4">
            <span className="text-[12px] font-bold text-slate-400 block">{t.worldTimeTitle}</span>
            
            {/* Visual Vector Map SVG */}
            <div className={`w-full relative rounded-xl border overflow-hidden flex flex-col bg-slate-900/40 p-1 border-white/5`}>
              <svg viewBox="0 0 1000 500" className="w-full h-auto max-h-[200px]">
                {/* Simplified continental maps segments */}
                {/* North America */}
                <path d="M 80,100 L 150,80 L 250,110 L 280,180 L 210,220 L 170,250 L 140,220 L 120,160 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                {/* South America */}
                <path d="M 210,240 L 250,290 L 280,350 L 250,420 L 220,440 L 190,360 L 200,290 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                {/* Eurasia */}
                <path d="M 450,100 L 520,80 L 680,60 L 800,80 L 880,130 L 850,220 L 820,260 L 760,250 L 720,220 L 680,250 L 580,250 L 480,200 L 440,150 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                {/* Africa */}
                <path d="M 450,210 L 520,200 L 560,230 L 570,280 L 550,350 L 510,380 L 480,340 L 440,280 L 430,240 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                {/* Australia */}
                <path d="M 770,330 L 830,340 L 850,380 L 830,410 L 780,400 L 760,370 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

                {/* Draw dynamic user local time pin */}
                <circle 
                  cx={500 + (localOffsetMins / 60) * 25} 
                  cy={240} 
                  r="5" 
                  className="fill-green-400 stroke-white/50 animate-pulse" 
                />
                
                {/* Draw cities locations */}
                {WORLD_CITIES.map((city) => {
                  const isCitySelected = city.id === selectedCityId;
                  return (
                    <g key={city.id} className="cursor-pointer" onClick={() => setSelectedCityId(city.id)}>
                      {isCitySelected && (
                        <>
                          <circle cx={city.x} cy={city.y} r="16" className="fill-indigo-500/20 stroke-indigo-400/30 animate-ping" />
                          <circle cx={city.x} cy={city.y} r="8" className="fill-indigo-500/40 stroke-indigo-400/50" />
                        </>
                      )}
                      
                      <circle 
                        cx={city.x} 
                        cy={city.y} 
                        r="4.5" 
                        className={`transition-all duration-300 ${
                          isCitySelected ? "fill-white" : "fill-sky-400 opacity-80 hover:r-6 hover:fill-amber-400"
                        }`}
                      />
                      
                      {/* Simple text label */}
                      <text 
                        x={city.x} 
                        y={city.y - 10} 
                        textAnchor="middle" 
                        className="text-[10px] font-sans font-bold fill-white tracking-tight drop-shadow select-none pointer-events-none"
                      >
                        {city.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Selected city information panel overlay */}
              <div className="p-2.5 mx-1.5 mb-1.5 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center text-left">
                <div>
                  <div className="flex gap-1.5 items-center">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11.5px] font-black">{activeCity.name}, {activeCity.country}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-sans block mt-0.5 leading-none">{activeCity.desc}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold font-mono text-indigo-400 tracking-wide block leading-none">{getCityLocalTime(activeCity.offset)}</span>
                  <span className="text-[8px] text-slate-500 uppercase mt-1 block tracking-wider font-bold leading-none">{getCityDateString(activeCity.offset)}</span>
                </div>
              </div>
            </div>

            {/* List World Clocks */}
            <div className="flex-1 space-y-2 select-text">
              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block text-left">{t.citySelector}</span>
              
              {/* Local clock first */}
              <div 
                onClick={() => setSelectedCityId("")}
                className={`p-2 px-3 rounded-lg border flex justify-between items-center cursor-default transition active:scale-99 ${
                  selectedCityId === "" 
                    ? "bg-slate-500/10 border-indigo-500/30" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] font-bold text-white flex gap-1.5 items-center">
                    🟢 {t.yourLocation}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">{t.pcSystemTime}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold font-mono text-sky-400">
                    {new Date().toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', { hour12: true, hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {WORLD_CITIES.map((city) => {
                const isSelected = city.id === selectedCityId;
                const offsetString = city.offset >= 0 
                  ? `UTC+${Math.floor(city.offset / 60)}` 
                  : `UTC${Math.floor(city.offset / 60)}`;
                return (
                  <div 
                    key={city.id} 
                    onClick={() => setSelectedCityId(city.id)}
                    className={`p-2 px-3 rounded-lg border flex justify-between items-center cursor-default transition active:scale-99 ${
                      isSelected 
                        ? "bg-slate-500/10 border-indigo-500/30 shadow" 
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[11.5px] font-bold">{city.name}</span>
                      <span className="text-[9px] text-slate-500 mt-0.5 font-sans">{offsetString} offset • {city.country}</span>
                    </div>
                    <div className="flex flex-col items-end leading-none">
                      <span className="text-xs font-bold font-mono tracking-wide">{getCityLocalTime(city.offset).substring(0, 8)}</span>
                      <span className="text-[8.5px] text-slate-500 mt-1 uppercase font-bold">{getCityDateString(city.offset)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* -- TAB 3: STOPWATCH -- */}
        {activeTab === "stopwatch" && (
          <div className="flex flex-col h-full justify-between gap-4">
            <div className="text-center py-4 select-text">
              <span className="text-4xl font-extrabold font-mono tracking-tight text-inherit block">
                {formatStopwatch(swTime)}
              </span>
            </div>

            {/* Micro stopwatch controls */}
            <div className="flex gap-2 justify-center select-none">
              <button
                onClick={() => setSwRunning(!swRunning)}
                className={`p-1.5 px-5 text-xs font-bold rounded-lg cursor-default flex items-center gap-1.5 text-white active:scale-95 transition-all shadow-md ${
                  swRunning ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/10" : `${theme.accentClass || "bg-sky-500"} hover:opacity-90 shadow-indigo-650/10`
                }`}
              >
                {swRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {swRunning ? t.pause : t.start}
              </button>

              <button
                onClick={handleLap}
                disabled={!swTime || !swRunning}
                className="p-1.5 px-4 text-xs font-semibold rounded-lg bg-slate-500/10 hover:bg-slate-500/20 disabled:opacity-40 cursor-default flex items-center gap-1 text-inherit active:scale-95 transition"
              >
                <Trophy className="w-3.5 h-3.5" /> {t.lap}
              </button>

              <button
                onClick={handleReset}
                disabled={!swTime}
                className="p-1.5 px-4 text-xs font-semibold rounded-lg bg-slate-500/15 hover:bg-slate-500/25 disabled:opacity-40 cursor-default flex items-center gap-1 text-inherit active:scale-95 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> {t.reset}
              </button>
            </div>

            {/* Laps List Scrollable */}
            <div className="flex-1 min-h-24 overflow-y-auto max-h-36 pr-1 border-t border-white/5 pt-3 space-y-1.5 select-text">
              {laps.map((lap, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10.5px] p-2 bg-slate-500/5 hover:bg-slate-500/10 rounded-lg">
                  <span className="text-slate-500 font-bold">{t.lapN} {laps.length - idx}</span>
                  <span className="font-mono font-medium">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* -- ABSOLUTE DYNAMIC SCREEN ALARM OVERLAY TRIGGER -- */}
      {triggeredAlarm && (
        <div className="absolute inset-0 bg-black/90 z-50 rounded-xl flex flex-col justify-center items-center text-center p-6 space-y-6 animate-pulse select-none">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/50 animate-bounce">
              <Bell className="w-10 h-10 text-white animate-swing" />
            </div>
            
            <span className="text-red-500 font-black tracking-widest text-[11px] uppercase mt-4">{t.alarmTriggered}</span>
          </div>

          <div className="space-y-1 select-text">
            <span className="text-4xl font-extrabold font-mono tracking-tighter text-white block">
              {triggeredAlarm.time} {triggeredAlarm.period}
            </span>
            <span className="text-[13.5px] font-black text-indigo-400 block tracking-wide">
              {triggeredAlarm.label}
            </span>
          </div>

          <div className="flex gap-4 select-none">
            <button
              onClick={handleDismissAlarm}
              className="p-3 w-44 rounded-lg bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold text-xs shadow-xl shadow-red-600/20 cursor-default"
            >
              {t.dismissAlarm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ClockIcon() {
  return <span className="text-[15px]">⏱️</span>;
}
