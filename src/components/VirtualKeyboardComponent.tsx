import React, { useState } from "react";
import { TaskbarTheme } from "../types";
import { X, CornerDownLeft, Space, Delete, ArrowUpDown, Lock, ChevronDown, Move } from "lucide-react";

interface VirtualKeyboardProps {
  isOpen: boolean;
  theme: TaskbarTheme;
  onClose: () => void;
}

export default function VirtualKeyboardComponent({
  isOpen,
  theme,
  onClose,
}: VirtualKeyboardProps) {
  const [capsLock, setCapsLock] = useState(false);
  const [shift, setShift] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"letters" | "symbols">("letters");
  
  // Position control specs for dragging the keyboard
  const [position, setPosition] = useState({ x: 100, y: 0 }); // y is calculated on mount as offset
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const isDark = theme.theme === "dark";

  // Layout keyboard cells lists
  const lettersRow1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
  const lettersRow2 = ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"];
  const lettersRow3 = ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"];

  const symbolsRow1 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const symbolsRow2 = ["-", "/", ":", ";", "(", ")", "$", "&", "@", "\""];
  const symbolsRow3 = [".", ",", "?", "!", "'", "_", "\\", "+", "=", "*"];

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - (position.y || (window.innerHeight - 340)),
    });
    e.preventDefault();
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const computedX = Math.min(Math.max(0, e.clientX - dragOffset.x), window.innerWidth - 650);
    const computedY = Math.min(Math.max(0, e.clientY - dragOffset.y), window.innerHeight - 150);
    setPosition({ x: computedX, y: computedY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Keyboard Click Simulator
  const handleKeyClick = (key: string) => {
    const activeEl = document.activeElement as HTMLElement;
    if (!activeEl) return;

    const isInput = activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA";
    const inputEl = activeEl as HTMLInputElement | HTMLTextAreaElement;

    // Simulate key events
    const triggerInputEvent = (value: string) => {
      const inputEvent = new Event("input", { bubbles: true });
      inputEl.value = value;
      inputEl.dispatchEvent(inputEvent);
    };

    if (key === "BACKSPACE") {
      if (isInput) {
        const start = inputEl.selectionStart || 0;
        const end = inputEl.selectionEnd || 0;
        const val = inputEl.value;
        if (start === end) {
          if (start > 0) {
            const newVal = val.slice(0, start - 1) + val.slice(start);
            triggerInputEvent(newVal);
            inputEl.setSelectionRange(start - 1, start - 1);
          }
        } else {
          const newVal = val.slice(0, start) + val.slice(end);
          triggerInputEvent(newVal);
          inputEl.setSelectionRange(start, start);
        }
      }
    } else if (key === "ENTER") {
      // Create enter keydown event simulation
      const keyEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        bubbles: true,
      });
      activeEl.dispatchEvent(keyEvent);

      if (isInput && inputEl.tagName === "TEXTAREA") {
        const start = inputEl.selectionStart || 0;
        const newVal = inputEl.value.slice(0, start) + "\n" + inputEl.value.slice(start);
        triggerInputEvent(newVal);
        inputEl.setSelectionRange(start + 1, start + 1);
      }
    } else if (key === "SPACE") {
      if (isInput) {
        const start = inputEl.selectionStart || 0;
        const newVal = inputEl.value.slice(0, start) + " " + inputEl.value.slice(start);
        triggerInputEvent(newVal);
        inputEl.setSelectionRange(start + 1, start + 1);
      }
    } else if (key === "CAPS") {
      setCapsLock(!capsLock);
    } else if (key === "SHIFT") {
      setShift(!shift);
    } else if (key === "TAB") {
      // Shift focus or insert tab spaces
      if (isInput) {
        const start = inputEl.selectionStart || 0;
        const newVal = inputEl.value.slice(0, start) + "  " + inputEl.value.slice(start);
        triggerInputEvent(newVal);
        inputEl.setSelectionRange(start + 2, start + 2);
      }
    } else {
      // Normal char append
      let char = key;
      if (activeLayer === "letters") {
        const shouldBeUpper = capsLock || shift;
        char = shouldBeUpper ? key.toUpperCase() : key.toLowerCase();
      }

      if (isInput) {
        const start = inputEl.selectionStart || 0;
        const newVal = inputEl.value.slice(0, start) + char + inputEl.value.slice(start);
        triggerInputEvent(newVal);
        inputEl.setSelectionRange(start + 1, start + 1);
      }

      if (shift) {
        setShift(false); // remove shift modifier after tapping once
      }
    }

    // Refocus active element in case focus gets lost during key interaction
    activeEl.focus();
  };

  const keyboardY = position.y || (window.innerHeight - 340);

  return (
    <div
      onMouseMove={handleDrag}
      onMouseUp={handleDragEnd}
      style={{
        left: `${position.x}px`,
        top: `${keyboardY}px`,
        position: "absolute",
      }}
      className={`w-[680px] h-[280px] rounded-xl overflow-hidden shadow-2xl border border-white/10 z-[2000] p-4 flex flex-col select-none ${
        isDark ? "glass bg-[#1a1a1ae0] text-slate-100" : "glass-light bg-[#fcfcfce0] text-slate-900"
      }`}
    >
      {/* Draggable dragbar header bar */}
      <div
        onMouseDown={handleDragStart}
        className="flex h-8 items-center justify-between cursor-move bg-slate-500/10 hover:bg-slate-500/15 rounded-lg px-3.5 mb-3.5 text-xs text-slate-400 font-medium z-10 select-none select-none"
      >
        <span className="flex items-center gap-1.5 leading-none">
          <Move className="w-3.5 h-3.5 text-sky-400" /> Virtual Keyboard Layout (Drag to reposition)
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 hover:bg-red-500 hover:text-white rounded transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Actual keys arena layout */}
      <div className="flex-1 flex flex-col gap-2 relative">
        {/* Row 1 Keys */}
        <div className="flex gap-1.5 w-full justify-between">
          {(activeLayer === "letters" ? lettersRow1 : symbolsRow1).map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className={`flex-1 h-11 text-xs font-semibold rounded transition flex items-center justify-center cursor-default bg-slate-500/10 hover:bg-slate-500/20 active:scale-95`}
            >
              {activeLayer === "letters" && (capsLock || shift) ? key.toUpperCase() : key}
            </button>
          ))}
          {/* Backspace */}
          <button
            onClick={() => handleKeyClick("BACKSPACE")}
            className="w-16 h-11 text-xs font-semibold rounded flex items-center justify-center gap-1 cursor-default bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 active:scale-95"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2 Keys */}
        <div className="flex gap-1.5 w-full justify-between">
          {/* Tab Key */}
          <button
            onClick={() => handleKeyClick("TAB")}
            className="w-14 h-11 text-xs font-semibold rounded flex items-center justify-center cursor-default bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 active:scale-95"
          >
            Tab
          </button>
          {(activeLayer === "letters" ? lettersRow2 : symbolsRow2).map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className="flex-1 h-11 text-xs font-semibold rounded transition flex items-center justify-center cursor-default bg-slate-500/10 hover:bg-slate-500/20 active:scale-95"
            >
              {activeLayer === "letters" && (capsLock || shift) ? key.toUpperCase() : key}
            </button>
          ))}
          {/* Enter Key */}
          <button
            onClick={() => handleKeyClick("ENTER")}
            className="w-16 h-11 text-[11px] font-bold rounded flex items-center justify-center gap-1 cursor-default bg-sky-500 text-white hover:bg-sky-600 active:scale-95 shadow-md shadow-sky-500/2"
          >
            <CornerDownLeft className="w-3.5 h-3.5" /> Enter
          </button>
        </div>

        {/* Row 3 Keys */}
        <div className="flex gap-1.5 w-full justify-between">
          {/* Shift Key */}
          <button
            onClick={() => handleKeyClick("SHIFT")}
            className={`w-14 h-11 text-xs font-semibold rounded flex items-center justify-center gap-1.5 cursor-default transition active:scale-95 ${
              shift ? "bg-sky-500 text-white shadow-md border-sky-450" : "bg-slate-500/20 hover:bg-slate-500/30 text-slate-400"
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Shift
          </button>
          {(activeLayer === "letters" ? lettersRow3 : symbolsRow3).map((key) => (
            <button
              key={key}
              onClick={() => handleKeyClick(key)}
              className="flex-1 h-11 text-xs font-semibold rounded transition flex items-center justify-center cursor-default bg-slate-500/10 hover:bg-slate-500/20 active:scale-95"
            >
              {activeLayer === "letters" && (capsLock || shift) ? key.toUpperCase() : key}
            </button>
          ))}
          {/* Caps Lock */}
          <button
            onClick={() => handleKeyClick("CAPS")}
            className={`w-16 h-11 text-xs font-semibold rounded flex items-center justify-center gap-1 cursor-default transition active:scale-95 ${
              capsLock ? "bg-emerald-500 text-white shadow-md" : "bg-slate-500/20 hover:bg-slate-500/30 text-slate-400"
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Caps
          </button>
        </div>

        {/* Row 4 Bottom Menu Controls Keys */}
        <div className="flex gap-1.5 w-full justify-between items-center mt-0.5">
          {/* Layout Changer toggle letters vs symbols */}
          <button
            onClick={() => setActiveLayer(activeLayer === "letters" ? "symbols" : "letters")}
            className="w-16 h-11 text-[11px] font-bold rounded flex items-center justify-center cursor-default bg-slate-500/15 hover:bg-slate-500/25 active:scale-95 text-sky-400"
          >
            {activeLayer === "letters" ? "&123" : "abc"}
          </button>

          {/* Space bar */}
          <button
            onClick={() => handleKeyClick("SPACE")}
            className="flex-1 h-11 rounded flex items-center justify-center cursor-default bg-slate-500/10 hover:bg-slate-500/20 active:scale-98 text-slate-400-accent"
          >
            <Space className="w-11 h-4" />
          </button>

          {/* Language / Keyboard Minimizer */}
          <button
            onClick={onClose}
            className="w-16 h-11 text-xs font-semibold rounded flex items-center justify-center cursor-default bg-slate-500/15 hover:bg-slate-500/25 active:scale-95 text-slate-400"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
