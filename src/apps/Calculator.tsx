import React, { useState } from "react";
import { TaskbarTheme } from "../types";
import { Copy, Sparkles, Delete } from "lucide-react";

interface CalculatorProps {
  theme: TaskbarTheme;
}

export default function Calculator({ theme }: CalculatorProps) {
  const [display, setDisplay] = useState("");
  const [history, setHistory] = useState("");
  const [scientific, setScientific] = useState(false);

  const isDark = theme.theme === "dark";

  const handleNumClick = (char: string) => {
    setDisplay((prev) => prev + char);
  };

  const handleClear = () => {
    setDisplay("");
    setHistory("");
  };

  const handleDelete = () => {
    setDisplay((prev) => prev.slice(0, -1));
  };

  const handleEvaluate = () => {
    if (!display) return;
    try {
      // sanitize safe math expression evaluate
      let sanitizedExpr = display
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(");

      // Simple evaluation of formula
      const result = new Function(`return (${sanitizedExpr})`)();
      setHistory(display + " =");
      setDisplay(String(Number(result.toFixed(8))));
    } catch {
      setDisplay("Math Error");
    }
  };

  const handleSciFunc = (func: string) => {
    if (func === "sqr") {
      setDisplay((prev) => `(${prev})*(${prev})`);
    } else if (func === "1/x") {
      setDisplay((prev) => `1/(${prev})`);
    } else {
      setDisplay((prev) => prev + func + "(");
    }
  };

  const buttons = [
    { label: "C", action: handleClear, type: "clear" },
    { label: "del", action: handleDelete, type: "del" },
    { label: "(", action: () => handleNumClick("("), type: "op" },
    { label: ")", action: () => handleNumClick(")"), type: "op" },

    { label: "7", action: () => handleNumClick("7"), type: "num" },
    { label: "8", action: () => handleNumClick("8"), type: "num" },
    { label: "9", action: () => handleNumClick("9"), type: "num" },
    { label: "÷", action: () => handleNumClick("÷"), type: "op" },

    { label: "4", action: () => handleNumClick("4"), type: "num" },
    { label: "5", action: () => handleNumClick("5"), type: "num" },
    { label: "6", action: () => handleNumClick("6"), type: "num" },
    { label: "×", action: () => handleNumClick("×"), type: "op" },

    { label: "1", action: () => handleNumClick("1"), type: "num" },
    { label: "2", action: () => handleNumClick("2"), type: "num" },
    { label: "3", action: () => handleNumClick("3"), type: "num" },
    { label: "-", action: () => handleNumClick("-"), type: "op" },

    { label: "0", action: () => handleNumClick("0"), type: "num" },
    { label: ".", action: () => handleNumClick("."), type: "num" },
    { label: "=", action: handleEvaluate, type: "eq" },
    { label: "+", action: () => handleNumClick("+"), type: "op" },
  ];

  const sciButtons = [
    { label: "sin", action: () => handleSciFunc("sin"), type: "sci" },
    { label: "cos", action: () => handleSciFunc("cos"), type: "sci" },
    { label: "tan", action: () => handleSciFunc("tan"), type: "sci" },
    { label: "π", action: () => handleNumClick("π"), type: "sci" },
    { label: "sqrt", action: () => handleSciFunc("sqrt"), type: "sci" },
    { label: "sqr", action: () => handleSciFunc("sqr"), type: "sci" },
    { label: "ln", action: () => handleSciFunc("ln"), type: "sci" },
    { label: "log", action: () => handleSciFunc("log"), type: "sci" },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 bg-transparent select-none h-full">
      {/* Dynamic Selector Toggle Scientific */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[12px] font-semibold text-slate-400 flex items-center gap-1.5 leading-none">
          🧮 {scientific ? "Scientific Mode" : "Standard Calculator"}
        </span>
        <button
          onClick={() => setScientific(!scientific)}
          className={`text-[10px] px-2 py-1 rounded transition bg-slate-500/10 hover:bg-slate-500/15 text-inherit`}
        >
          {scientific ? "Standard" : "Scientific"}
        </button>
      </div>

      {/* Screen area display */}
      <div className={`p-4 rounded-lg flex flex-col text-right mb-4 select-all leading-normal ${
        isDark ? "bg-black/25 text-white" : "bg-white/40 text-slate-900"
      }`}>
        <span className="text-xs text-slate-500 font-medium h-5 tracking-wide truncate">
          {history}
        </span>
        <span className="text-3xl font-bold truncate h-10 tracking-tight font-mono select-all">
          {display || "0"}
        </span>
      </div>

      {/* Keyboard panel core */}
      <div className="flex-1 flex flex-col justify-between">
        {scientific && (
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {sciButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`py-2 rounded-md text-[10.5px] font-bold transition flex items-center justify-center cursor-default bg-slate-500/10 hover:bg-slate-500/20 text-sky-400`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-4 gap-1.5 flex-1">
          {buttons.map((btn, idx) => {
            let colorClass = "bg-slate-500/10 hover:bg-slate-500/15";
            let fontColor = "text-inherit";

            if (btn.type === "eq") {
              colorClass = "bg-sky-500 hover:bg-sky-600 font-bold col-span-1 shadow-md shadow-sky-500/2";
              fontColor = "text-white";
            } else if (btn.type === "clear") {
              colorClass = "bg-rose-500/15 hover:bg-rose-500/25";
              fontColor = "text-rose-400 font-bold";
            } else if (btn.type === "del") {
              colorClass = "bg-slate-500/15 hover:bg-slate-500/25";
            } else if (btn.type === "op") {
              fontColor = "text-sky-400 font-bold";
            } else if (btn.type === "num") {
              colorClass = isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10";
            }

            return (
              <button
                key={idx}
                onClick={btn.action}
                className={`rounded-lg text-xs font-semibold select-none flex items-center justify-center cursor-default active:scale-95 transition-all ${colorClass} ${fontColor}`}
              >
                {btn.label === "del" ? <Delete className="w-3.5 h-3.5" /> : btn.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export function CalculatorIcon() {
  return <span className="text-[15px]">🧮</span>;
}
