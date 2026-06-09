import React, { useState, useRef, useEffect } from "react";
import { AppWindow, TaskbarTheme } from "../types";
import { X, Minimize2, Square, Copy } from "lucide-react";

interface WindowFrameProps {
  key?: string | number;
  window: AppWindow;
  theme: TaskbarTheme;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdatePosition: (id: string, updates: Partial<AppWindow>) => void;
  children: React.ReactNode;
}

export default function WindowFrame({
  window,
  theme,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  children,
}: WindowFrameProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  const [showSnapPreview, setShowSnapPreview] = useState<"left" | "right" | "top" | "topLeft" | "topRight" | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left mouse button click on header (not on buttons)
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest(".window-btn")) return;

    onFocus(window.id);

    if (window.isMaximized) {
      // Restore window back to normal size of cursor offset
      const ratio = e.clientX / windowRef.current!.clientWidth;
      const originalWidth = window.width || 800;
      const originalHeight = window.height || 550;
      const newX = e.clientX - originalWidth * ratio;
      const newY = e.clientY - 20;

      onUpdatePosition(window.id, {
        isMaximized: false,
        x: newX,
        y: newY,
      });

      setIsDragging(true);
      setDragOffset({ x: e.clientX - newX, y: e.clientY - newY });
    } else {
      setIsDragging(true);
      setDragOffset({ x: e.clientX - window.x, y: e.clientY - window.y });
    }
    e.preventDefault();
  };

  // Resize boundaries triggers
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(window.id);

    if (window.isMaximized) return;

    setIsResizing(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: window.width,
      h: window.height,
      px: window.x,
      py: window.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const calculatedX = e.clientX - dragOffset.x;
        const calculatedY = Math.max(0, e.clientY - dragOffset.y); // limit window moving above desktop top margin

        // Snap preview trigger
        if (e.clientX < 40) {
          if (e.clientY < 60) setShowSnapPreview("topLeft");
          else setShowSnapPreview("left");
        } else if (e.clientX > globalThis.screen.width - 40 || e.clientX > globalThis.innerWidth - 40) {
          if (e.clientY < 60) setShowSnapPreview("topRight");
          else setShowSnapPreview("right");
        } else if (e.clientY < 15) {
          setShowSnapPreview("top");
        } else {
          setShowSnapPreview(null);
        }

        onUpdatePosition(window.id, { x: calculatedX, y: calculatedY });
      }

      if (isResizing) {
        const dx = e.clientX - resizeStart.x;
        const dy = e.clientY - resizeStart.y;
        const minW = window.minWidth || 300;
        const minHeight = window.minHeight || 200;

        let updates: Partial<AppWindow> = {};

        switch (isResizing) {
          case "r":
            updates.width = Math.max(minW, resizeStart.w + dx);
            break;
          case "b":
            updates.height = Math.max(minHeight, resizeStart.h + dy);
            break;
          case "l":
            const newW_l = resizeStart.w - dx;
            if (newW_l > minW) {
              updates.width = newW_l;
              updates.x = resizeStart.px + dx;
            }
            break;
          case "t":
            const newH_t = resizeStart.h - dy;
            if (newH_t > minHeight) {
              updates.height = newH_t;
              updates.y = Math.max(0, resizeStart.py + dy);
            }
            break;
          case "se":
            updates.width = Math.max(minW, resizeStart.w + dx);
            updates.height = Math.max(minHeight, resizeStart.h + dy);
            break;
          case "sw":
            const newW_sw = resizeStart.w - dx;
            if (newW_sw > minW) {
              updates.width = newW_sw;
              updates.x = resizeStart.px + dx;
            }
            updates.height = Math.max(minHeight, resizeStart.h + dy);
            break;
          case "ne":
            updates.width = Math.max(minW, resizeStart.w + dx);
            const newH_ne = resizeStart.h - dy;
            if (newH_ne > minHeight) {
              updates.height = newH_ne;
              updates.y = Math.max(0, resizeStart.py + dy);
            }
            break;
          case "nw":
            const newW_nw = resizeStart.w - dx;
            const newH_nw = resizeStart.h - dy;
            if (newW_nw > minW) {
              updates.width = newW_nw;
              updates.x = resizeStart.px + dx;
            }
            if (newH_nw > minHeight) {
              updates.height = newH_nw;
              updates.y = Math.max(0, resizeStart.py + dy);
            }
            break;
        }

        onUpdatePosition(window.id, updates);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        // Handle actual snapping execution
        if (showSnapPreview) {
          let updates: Partial<AppWindow> = {};
          const deskW = globalThis.innerWidth;
          const deskH = globalThis.innerHeight - 48; // subtract taskbar

          if (showSnapPreview === "left") {
            updates = { x: 0, y: 0, width: deskW / 2, height: deskH / 2, isMaximized: false };
          } else if (showSnapPreview === "right") {
            updates = { x: deskW / 2, y: 0, width: deskW / 2, height: deskH / 2, isMaximized: false };
          } else if (showSnapPreview === "top") {
            updates = { isMaximized: true };
          } else if (showSnapPreview === "topLeft") {
            updates = { x: 0, y: 0, width: deskW / 2, height: deskH / 2, isMaximized: false };
          } else if (showSnapPreview === "topRight") {
            updates = { x: deskW / 2, y: 0, width: deskW / 2, height: deskH / 2, isMaximized: false };
          }
          onUpdatePosition(window.id, updates);
          setShowSnapPreview(null);
        }
      }
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, isResizing, resizeStart, showSnapPreview]);

  if (!window.isOpen) return null;

  const isDark = theme.theme === "dark";

  // Position / dimensions style
  const style: React.CSSProperties = window.isMaximized
    ? {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "calc(100% - 48px)", // Subtract taskbar
        zIndex: window.zIndex,
      }
    : {
        position: "absolute",
        left: `${window.x}px`,
        top: `${window.y}px`,
        width: `${window.width}px`,
        height: `${window.height}px`,
        zIndex: window.zIndex,
      };

  return (
    <>
      {/* Target snap outline preview */}
      {showSnapPreview && (
        <div
          className="absolute border-2 border-indigo-500/60 bg-indigo-500/15 shadow-xl shadow-indigo-500/5 pointer-events-none transition-all duration-200 z-[9999] rounded-lg backdrop-blur-[4px] animate-pulse"
          style={{
            top: (showSnapPreview === "top" || showSnapPreview === "left" || showSnapPreview === "right" || showSnapPreview === "topLeft" || showSnapPreview === "topRight") ? 0 : "50%",
            left: (showSnapPreview === "right" || showSnapPreview === "topRight") ? "50%" : 0,
            width: showSnapPreview === "top" ? "100%" : "50%",
            height: showSnapPreview === "top" ? "calc(100% - 48px)" : "calc(50% - 24px)",
          }}
        />
      )}

      {/* Actual Window */}
      <div
        id={`win-${window.id}`}
        ref={windowRef}
        style={style}
        onClick={() => onFocus(window.id)}
        className={`flex flex-col rounded-lg overflow-hidden border border-white/10 transition-shadow duration-200 shadow-2xl ${
          window.isFocused
            ? "shadow-black/60 border-white/20 select-text"
            : "shadow-black/30 border-white/10"
        } ${window.isMinimized ? "hidden" : ""} ${
          isDark ? "glass text-slate-100" : "glass-light text-slate-900"
        }`}
      >
        {/* Resize Handles (Only active if not maximized) */}
        {!window.isMaximized && (
          <>
            <div className="absolute top-0 left-0 w-full h-1 cursor-n-resize z-40" onMouseDown={(e) => handleResizeStart(e, "t")} />
            <div className="absolute bottom-0 left-0 w-full h-1.5 cursor-s-resize z-40" onMouseDown={(e) => handleResizeStart(e, "b")} />
            <div className="absolute top-0 right-0 h-full w-1 cursor-e-resize z-40" onMouseDown={(e) => handleResizeStart(e, "r")} />
            <div className="absolute top-0 left-0 h-full w-1.5 cursor-w-resize z-40" onMouseDown={(e) => handleResizeStart(e, "l")} />

            <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-50" onMouseDown={(e) => handleResizeStart(e, "nw")} />
            <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-50" onMouseDown={(e) => handleResizeStart(e, "ne")} />
            <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-50" onMouseDown={(e) => handleResizeStart(e, "sw")} />
            <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50" onMouseDown={(e) => handleResizeStart(e, "se")} />
          </>
        )}

        {/* Title / Drag Header */}
        <div
          onMouseDown={handleDragStart}
          onDoubleClick={() => onMaximize(window.id)}
          className={`flex items-center justify-between px-3 py-1.5 h-11 select-none select-none transition-colors duration-200 border-b border-white/5 ${
            window.isFocused
              ? isDark
                ? "bg-black/15 text-white"
                : "bg-white/20 text-slate-900"
              : isDark
                ? "bg-black/5 text-slate-400"
                : "bg-white/5 text-slate-500"
          }`}
        >
          {/* Left Details */}
          <div className="flex items-center gap-2 max-w-[60%]">
            <span className="w-4 h-4 flex items-center justify-content">{children && (children as any).props?.customIcon || "💻"}</span>
            <span className="text-[12px] font-medium tracking-wide truncate">{window.title}</span>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center gap-0.5 window-btn">
            {/* Minimize */}
            <button
              onClick={() => onMinimize(window.id)}
              title="Minimize"
              className="p-1 px-3.5 hover:bg-white/10 active:bg-white/5 transition-colors rounded text-[11px] h-[34px] flex items-center justify-center cursor-default text-inherit"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            {/* Maximize / Restore */}
            <button
              onClick={() => onMaximize(window.id)}
              title={window.isMaximized ? "Restore Down" : "Maximize"}
              className="p-1 px-3.5 hover:bg-white/10 active:bg-white/5 transition-colors rounded text-[11px] h-[34px] flex items-center justify-center cursor-default text-inherit"
            >
              {window.isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
            </button>

            {/* Close */}
            <button
              onClick={() => onClose(window.id)}
              title="Close"
              className="p-1 px-3.5 hover:bg-red-600 hover:text-white active:bg-red-700 transition-colors rounded text-[11px] h-[34px] flex items-center justify-center cursor-default text-inherit"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="flex-1 flex flex-col min-h-0 relative select-text" style={{ background: isDark ? "rgba(20, 20, 20, 0.4)" : "rgba(255, 255, 255, 0.4)" }}>
          {children}
        </div>
      </div>
    </>
  );
}
