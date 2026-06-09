import React, { useState, useRef, useEffect } from "react";
import { TaskbarTheme } from "../types";

interface TerminalProps {
  theme: TaskbarTheme;
}

export default function Terminal({ theme }: TerminalProps) {
  const [history, setHistory] = useState<string[]>([
    "Win11-Web Command Prompt [Version 1.0.12]",
    "Express Sandbox Server Module. Type 'help' to see active command triggers.",
    ""
  ]);
  const [input, setInput] = useState("");
  const [currentDir, setCurrentDir] = useState("");

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = theme.theme === "dark";

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const currentPrompt = `PS C:\\Sandbox${currentDir ? "\\" + currentDir.replace(/\//g, "\\") : ""}> ${cmd}`;
    const newHistory = [...history, currentPrompt];

    // Check manual clear/cls
    if (cmd.toLowerCase() === "clear" || cmd.toLowerCase() === "cls") {
      setHistory([]);
      setInput("");
      return;
    }

    try {
      const response = await fetch("/api/terminal/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cmd,
          currentDir: currentDir,
        }),
      });

      if (!response.ok) throw new Error("Connection failed");
      const data = await response.json();

      setHistory([...newHistory, data.output || "", ""]);
      setCurrentDir(data.nextDir || "");
    } catch {
      setHistory([...newHistory, "Error: Lost network bridge with backend simulation API.", ""]);
    }

    setInput("");
  };

  const focusTerminal = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={focusTerminal}
      className="flex-1 flex flex-col p-4 bg-black text-[#85e185] font-mono text-xs leading-relaxed select-text h-full overflow-hidden"
    >
      {/* Scrollable history arena */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 mb-2">
        {history.map((line, idx) => (
          <div key={idx} className="whitespace-pre-wrap font-mono min-h-4">
            {line}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Input row prompting active path */}
      <form onSubmit={handleCommandSubmit} className="flex items-center gap-1.5 font-mono select-text bg-transparent">
        <span className="text-sky-400 font-bold select-none font-mono">
          PS C:\Sandbox{currentDir ? "\\" + currentDir.replace(/\//g, "\\") : ""}&gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-mono text-[#85e185] text-xs caret-[#85e185]"
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
export function TerminalIcon() {
  return <span className="text-[15px]">💻</span>;
}
