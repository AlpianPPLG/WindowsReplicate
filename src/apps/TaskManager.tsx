import React, { useState, useEffect } from "react";
import { TaskbarTheme, SystemInfo } from "../types";
import { HardDrive, Monitor, RefreshCw, Cpu, Database, Activity } from "lucide-react";

interface TaskManagerProps {
  theme: TaskbarTheme;
}

export default function TaskManager({ theme }: TaskManagerProps) {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [killedProcesses, setKilledProcesses] = useState<number[]>([]);

  const isDark = theme.theme === "dark";

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/sysinfo");
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      setSysInfo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Poll metrics every 2.5 seconds
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleKillProcess = (id: number) => {
    const doubleCheck = window.confirm("Are you sure you want to end this process task?");
    if (doubleCheck) {
      setKilledProcesses([...killedProcesses, id]);
    }
  };

  if (loading || !sysInfo) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-slate-400 text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-sky-450 mb-1" />
        <span>Syncing telemetry parameters...</span>
      </div>
    );
  }

  // Format bytes into GBs
  const toGB = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1);
  };

  // filter out processes user killed
  const activeProcesses = sysInfo.processes.filter((p) => !killedProcesses.includes(p.id));

  return (
    <div className="flex-1 flex flex-col p-4 bg-transparent select-text h-full overflow-hidden font-sans">
      {/* 1. Hardware meters group */}
      <div className="grid grid-cols-3 gap-3.5 mb-5 select-none">
        {/* CPU */}
        <div className={`p-3.5 rounded-xl border border-white/5 relative flex flex-col justify-between leading-normal h-26 ${
          isDark ? "bg-black/15 text-white" : "bg-white/45 text-slate-900"
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-sky-400" /> CPU Load
            </span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-black font-mono tracking-tight">{sysInfo.system.cpuUsage}%</span>
            <span className="text-[9px] text-slate-500 text-right truncate max-w-[60%]">{sysInfo.system.cpuModel}</span>
          </div>
          {/* load completion bar bar */}
          <div className="w-full bg-slate-500/25 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${sysInfo.system.cpuUsage}%` }} />
          </div>
        </div>

        {/* MEMORY */}
        <div className={`p-3.5 rounded-xl border border-white/5 relative flex flex-col justify-between leading-normal h-26 ${
          isDark ? "bg-black/15 text-white" : "bg-white/45 text-slate-900"
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> RAM Memory
            </span>
            <span className="text-[10px] text-slate-500 font-sans font-medium">{toGB(sysInfo.system.memUsed)} / {toGB(sysInfo.system.memTotal)} GB</span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-black font-mono tracking-tight">{sysInfo.system.memPercentage}%</span>
            <span className="text-[9px] text-slate-500 text-right">DDR4 Virtual Allocation</span>
          </div>
          <div className="w-full bg-slate-500/25 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${sysInfo.system.memPercentage}%` }} />
          </div>
        </div>

        {/* DISK STORAGE */}
        <div className={`p-3.5 rounded-xl border border-white/5 relative flex flex-col justify-between leading-normal h-26 ${
          isDark ? "bg-black/15 text-white" : "bg-white/45 text-slate-900"
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> SSD Drive
            </span>
            <span className="text-[10px] text-slate-500 font-sans font-medium">{toGB(sysInfo.system.diskUsed)} / {toGB(sysInfo.system.diskTotal)} GB</span>
          </div>
          <div className="flex justify-between items-end mt-2">
            <span className="text-2xl font-black font-mono tracking-tight">29.2%</span>
            <span className="text-[9px] text-slate-500 text-right">NVMe Sandbox Root</span>
          </div>
          <div className="w-full bg-slate-500/25 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: "29.2%" }} />
          </div>
        </div>
      </div>

      {/* 2. Processes Table List */}
      <span className="text-[11.5px] font-bold text-slate-400 mb-3 block select-none">Active Process Tasks ({activeProcesses.length})</span>
      <div className="flex-1 overflow-y-auto select-none rounded-lg border border-white/5 bg-slate-500/5 select-text">
        <table className="w-full text-left text-[11px] font-medium border-collapse leading-normal select-text">
          <thead>
            <tr className={`border-b border-white/5 text-slate-450 uppercase text-[9px] ${
              isDark ? "bg-black/20" : "bg-white/30"
            }`}>
              <th className="p-2.5 px-3.5">Task Title</th>
              <th className="p-2.5">CPU load</th>
              <th className="p-2.5">Memory footprint</th>
              <th className="p-2.5">State</th>
              <th className="p-2.5 text-right pr-3.5">Kill Switch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activeProcesses.map((proc) => (
              <tr key={proc.id} className="hover:bg-slate-500/5 select-text leading-relaxed">
                <td className="p-2 px-3.5 font-bold font-mono text-sky-400 text-[10.5px] select-all">{proc.name}</td>
                <td className="p-2 font-mono text-slate-400">{proc.cpu}%</td>
                <td className="p-2 font-mono text-slate-400">{proc.memory || `${getRandomInt(20, 150)}`} MB</td>
                <td className="p-2 font-sans font-bold"><span className="text-emerald-400">● {proc.status}</span></td>
                <td className="p-2 text-right pr-3.5 select-none">
                  <button
                    onClick={() => handleKillProcess(proc.id)}
                    className="p-1 px-2.5 rounded bg-red-500/10 hover:bg-red-500/15 text-red-400 text-[10px] cursor-default font-bold"
                  >
                    End Task
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function TaskManagerIcon() {
  return <span className="text-[15px]">📊</span>;
}
