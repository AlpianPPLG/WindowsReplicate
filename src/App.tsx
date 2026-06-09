import React, { useState, useEffect } from "react";
import { AppWindow, TaskbarTheme, QuickSettings, DesktopIcon, FSItem } from "./types";
import { Language, TRANSLATIONS } from "./translations";

// Widgets & Sidebar Overlays
import Taskbar from "./components/Taskbar";
import StartMenu from "./components/StartMenu";
import ActionCenter from "./components/ActionCenter";
import NotificationCenter from "./components/NotificationCenter";
import WidgetsPanel from "./components/WidgetsPanel";
import VirtualKeyboardComponent from "./components/VirtualKeyboardComponent";
import WindowFrame from "./components/WindowFrame";

// Systems Applications Custom Modules
import Notepad from "./apps/Notepad";
import Calculator from "./apps/Calculator";
import FileExplorer from "./apps/FileExplorer";
import Settings from "./apps/Settings";
import Terminal from "./apps/Terminal";
import Browser from "./apps/Browser";
import MediaPlayer from "./apps/MediaPlayer";
import ClockApp from "./apps/ClockApp";
import TaskManager from "./apps/TaskManager";

export default function App() {
  // Language state
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("system_lang") as Language) || "id";
  });

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("system_lang", newLang);
  };

  const t = TRANSLATIONS[lang];

  // OS Session Load states
  const [booting, setBooting] = useState(true);
  const [locked, setLocked] = useState(true);
  const [sessionOff, setSessionOff] = useState<"shutdown" | "sleep" | null>(null);

  // Time / Clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Wallpaper / Theme styling state
  const [theme, setTheme] = useState<TaskbarTheme>({
    theme: "dark",
    accentColor: "Atmospheric Glass",
    accentClass: "bg-indigo-600",
    wallpaper: "bg-immersive-media"
  });

  // Action Center settings controllers
  const [settings, setSettings] = useState<QuickSettings>({
    wifi: true,
    bluetooth: false,
    airplane: false,
    batterySaver: false,
    nightLight: false,
    volume: 60,
    brightness: 80,
  });

  // Windows State Array
  const [windows, setWindows] = useState<AppWindow[]>([
    { id: "explorer", title: "File Explorer", icon: "📁", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 80, y: 50, width: 720, height: 460, minWidth: 400, minHeight: 300, isFocused: false, appType: "explorer" },
    { id: "notepad", title: "Notepad text session", icon: "📝", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 120, y: 70, width: 680, height: 450, minWidth: 350, minHeight: 250, isFocused: false, appType: "notepad", appData: null },
    { id: "calculator", title: "Standard Operations Calculator", icon: "🧮", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 160, y: 90, width: 340, height: 450, minWidth: 300, minHeight: 400, isFocused: false, appType: "calculator" },
    { id: "terminal", title: "PowerShell Host Console", icon: "💻", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 100, y: 110, width: 650, height: 400, minWidth: 450, minHeight: 250, isFocused: false, appType: "terminal" },
    { id: "browser", title: "Microsoft Edge Browser", icon: "🌐", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 140, y: 60, width: 800, height: 500, minWidth: 450, minHeight: 300, isFocused: false, appType: "browser" },
    { id: "mediaplayer", title: "Windows Groove Media Tracker", icon: "🎵", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 220, y: 150, width: 420, height: 420, minWidth: 380, minHeight: 380, isFocused: false, appType: "mediaplayer" },
    { id: "clock", title: "Alarms & Timers", icon: "⏱️", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 180, y: 130, width: 550, height: 400, minWidth: 450, minHeight: 320, isFocused: false, appType: "clock" },
    { id: "taskmanager", title: "Administrative Task Manager", icon: "📊", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 90, y: 40, width: 750, height: 440, minWidth: 500, minHeight: 350, isFocused: false, appType: "taskmanager" },
    { id: "settings", title: "Accent & Personalization Settings", icon: "⚙️", isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, x: 150, y: 80, width: 680, height: 450, minWidth: 455, minHeight: 400, isFocused: false, appType: "settings" },
  ]);

  // Sidebar controls states
  const [startOpen, setStartOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  // Desktop files list double click triggers
  const [desktopFiles, setDesktopFiles] = useState<FSItem[]>([]);

  // Desktop right click context menu coordinates and state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // 1. Clock timer increment
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch desktop files for shortcut listings
  const syncDesktopFiles = async () => {
    try {
      const response = await fetch("/api/files/list?path=Desktop");
      if (response.ok) {
        const data = await response.json();
        setDesktopFiles(data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!booting && !locked) {
      syncDesktopFiles();
    }
  }, [booting, locked]);

  // 3. Simulated Boot sequence
  useEffect(() => {
    const delay = setTimeout(() => setBooting(false), 3800);
    return () => clearTimeout(delay);
  }, []);

  // 4. Keyboard Shortcuts handler
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      // Ignore if user is inside inputs
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "Meta" || (e.ctrlKey && e.key === "Escape")) {
        e.preventDefault();
        setStartOpen((prev) => !prev);
      } else if (e.metaKey && e.key === "d") {
        e.preventDefault();
        // Minimize all windows
        setWindows((prev) => prev.map((w) => ({ ...w, isMinimized: true })));
      } else if (e.metaKey && e.key === "e") {
        e.preventDefault();
        handleLaunchApp("explorer");
      } else if (e.metaKey && e.key === "l") {
        e.preventDefault();
        setLocked(true);
      } else if (e.metaKey && e.key === "k") {
        e.preventDefault();
        setKeyboardOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, []);

  const [minimizedHistory, setMinimizedHistory] = useState<Record<string, boolean> | null>(null);

  const handleShowDesktopToggle = () => {
    const openAndVisible = windows.some((w) => w.isOpen && !w.isMinimized);

    if (openAndVisible) {
      const history: Record<string, boolean> = {};
      windows.forEach((w) => {
        if (w.isOpen) {
          history[w.id] = w.isMinimized;
        }
      });
      setMinimizedHistory(history);
      setWindows((prev) =>
        prev.map((w) => (w.isOpen ? { ...w, isMinimized: true, isFocused: false } : w))
      );
    } else {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.isOpen) {
            const wasMinimized = minimizedHistory ? !!minimizedHistory[w.id] : false;
            return { ...w, isMinimized: wasMinimized };
          }
          return w;
        })
      );
      setMinimizedHistory(null);
    }
  };

  // 5. App Window Control Core methods
  const handleLaunchApp = (appType: AppWindow["appType"], data?: any, forceNewInstance?: boolean) => {
    // Close overlays
    setStartOpen(false);
    setWidgetsOpen(false);
    setActionOpen(false);
    setNotifOpen(false);

    setWindows((prev) => {
      // Find open windows of this appType
      const openOfThisType = prev.filter((w) => w.appType === appType && w.isOpen);
      
      // Determine if we should spawn a brand new window instance
      const shouldSpawnNew = forceNewInstance || (openOfThisType.length > 0 && (appType === "notepad" || appType === "explorer" || appType === "terminal" || appType === "browser" || appType === "calculator"));

      if (shouldSpawnNew) {
        const template = prev.find((w) => w.appType === appType) || prev[0];
        const offset = openOfThisType.length * 25;
        const newId = `${appType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        let newTitle = template.title;
        if (appType === "notepad" && data?.filePath) {
          newTitle = `Notepad - ${data.filePath.split('/').pop() || data.filePath}`;
        } else {
          newTitle = `${template.title} (${openOfThisType.length + 1})`;
        }

        const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
        const newWin: AppWindow = {
          ...template,
          id: newId,
          title: newTitle,
          isOpen: true,
          isMinimized: false,
          isFocused: true,
          isMaximized: false,
          zIndex: maxZ + 1,
          x: Math.min(globalThis.innerWidth - 450, Math.max(40, template.x + offset)),
          y: Math.min(globalThis.innerHeight - 350, Math.max(40, template.y + offset)),
          appData: data || null,
        };

        return prev.map(w => ({ ...w, isFocused: false })).concat(newWin);
      }

      // Default behavior
      const target = prev.find((w) => w.appType === appType);
      if (!target) return prev;

      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      
      if (openOfThisType.length === 1) {
        const activeWin = openOfThisType[0];
        const isAlreadyFocusedAndOpen = activeWin.isOpen && !activeWin.isMinimized && activeWin.isFocused;

        return prev.map((w) => {
          if (w.id === activeWin.id) {
            if (isAlreadyFocusedAndOpen) {
              return { ...w, isMinimized: true, isFocused: false };
            } else {
              return {
                ...w,
                isOpen: true,
                isMinimized: false,
                isFocused: true,
                zIndex: maxZ + 1,
                title: appType === "notepad" && data?.filePath ? `Notepad - ${data.filePath.split('/').pop() || data.filePath}` : w.title,
                appData: data || null,
              };
            }
          }
          return isAlreadyFocusedAndOpen ? w : { ...w, isFocused: false };
        });
      }

      if (openOfThisType.length > 1) {
        const focusedWin = openOfThisType.find((w) => w.isFocused);
        if (focusedWin) {
          return prev.map((w) => {
            if (w.id === focusedWin.id) {
              return { ...w, isMinimized: true, isFocused: false };
            }
            return w;
          });
        } else {
          const highestZWin = openOfThisType.reduce((prevMax, curr) => curr.zIndex > prevMax.zIndex ? curr : prevMax, openOfThisType[0]);
          return prev.map((w) => {
            if (w.id === highestZWin.id) {
              return { ...w, isMinimized: false, isFocused: true, zIndex: maxZ + 1 };
            }
            return { ...w, isFocused: w.id === highestZWin.id ? true : false };
          });
        }
      }

      return prev.map((w) => {
        if (w.appType === appType) {
          return {
            ...w,
            isOpen: true,
            isMinimized: false,
            isFocused: true,
            zIndex: maxZ + 1,
            title: appType === "notepad" && data?.filePath ? `Notepad - ${data.filePath.split('/').pop() || data.filePath}` : w.title,
            appData: data || null,
          };
        }
        return { ...w, isFocused: false };
      });
    });
  };

  const handleFocusWindow = (id: string) => {
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0);
      return prev.map((w) => ({
        ...w,
        isFocused: w.id === id,
        zIndex: w.id === id ? maxZ + 1 : w.zIndex,
        isMinimized: w.id === id ? false : w.isMinimized,
      }));
    });
  };

  const handleCloseWindow = (id: string) => {
    const isStatic = ["explorer", "notepad", "calculator", "terminal", "browser", "mediaplayer", "clock", "taskmanager", "settings"].includes(id);
    setWindows((prev) => {
      if (isStatic) {
        return prev.map((w) => (w.id === id ? { ...w, isOpen: false, isFocused: false } : w));
      } else {
        return prev.filter((w) => w.id !== id);
      }
    });
  };

  const handleMinimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true, isFocused: false } : w)));
  };

  const handleMaximizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)));
  };

  const handleUpdateWindowPosition = (id: string, updates: Partial<AppWindow>) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  };

  // Close overlays when clicking desktop space
  const handleDesktopClick = () => {
    setStartOpen(false);
    setActionOpen(false);
    setNotifOpen(false);
    setWidgetsOpen(false);
    setContextMenu(null);
  };

  // Launch File Explorer immediately for double click This PC
  const handleDesktopIconDoubleClick = (icon: DesktopIcon) => {
    if (icon.appType) {
      handleLaunchApp(icon.appType);
    }
  };

  // Launch Notepad directly on double click Desktop txt file
  const handleDesktopFileDoubleClick = (file: FSItem) => {
    handleLaunchApp("notepad", { filePath: file.path });
  };

  const handlePowerChange = async (mode: "shutdown" | "restart" | "sleep") => {
    setStartOpen(false);
    if (mode === "sleep") {
      setLocked(true);
    } else if (mode === "shutdown") {
      setSessionOff("shutdown");
    } else if (mode === "restart") {
      setSessionOff("sleep"); // reboot loading state
      setBooting(true);
      window.location.reload();
    }
  };

  // Desktop fixed icons list
  const desktopShortcuts: DesktopIcon[] = [
    { id: "this-pc", label: "This PC", icon: "💻", type: "app", appType: "explorer" },
    { id: "notepads", label: "Notepad text", icon: "📝", type: "app", appType: "notepad" },
    { id: "term", label: "PowerShell Shell", icon: "💻", type: "app", appType: "terminal" },
    { id: "settings-win", label: "System Setup", icon: "⚙️", type: "app", appType: "settings" },
    { id: "edge", label: "Microsoft Edge", icon: "🌐", type: "app", appType: "browser" },
  ];

  // ------------------------------------
  // RENDER STAGE 1: BOOT ANIMATION
  // ------------------------------------
  if (booting) {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-zinc-950 text-white font-sans select-none select-none">
        {/* Sky Blue Spinning Dots Windows style logo placeholder */}
        <div className="w-16 h-16 flex items-center justify-center bg-sky-500 rounded-md relative text-3xl font-extrabold animate-bounce shadow-xl shadow-sky-500/2">
          🗔
        </div>
        
        {/* Classic Circle Loader */}
        <div className="mt-14 flex flex-col items-center">
          <div className="flex gap-1.5 items-center select-none">
            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-ping" />
            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse [animation-delay:0.2s]" />
            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse [animation-delay:0.4s]" />
          </div>
          <span className="text-[11.5px] text-slate-500 font-medium tracking-wide mt-5">{t.startingServices}</span>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // RENDER STAGE 2: SHUT DOWN STATE
  // ------------------------------------
  if (sessionOff === "shutdown") {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-zinc-950 font-sans select-none select-none text-center">
        <span className="text-xl font-bold text-white mb-2 tracking-wide font-sans">Power off sequence completed.</span>
        <span className="text-xs text-slate-500 mb-6">{t.systemLoading}</span>
        <button
          onClick={() => {
            setBooting(true);
            setSessionOff(null);
            setTimeout(() => setBooting(false), 2400);
          }}
          className="p-2 py-4 h-11 w-44 rounded-lg bg-sky-500 hover:bg-sky-600 font-bold text-xs text-white shadow-xl flex items-center justify-center gap-2 select-none"
        >
          🗔 {t.powerOnDesktop}
        </button>
      </div>
    );
  }

  // ------------------------------------
  // RENDER STAGE 3: LOCK SCREEN
  // ------------------------------------
  if (locked) {
    return (
      <div
        className="w-full h-full flex flex-col justify-between p-12 relative select-none animate-slide-up select-none bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80')" }}
      >
        {/* Massive clock displays */}
        <div className="flex flex-col text-left items-start select-text text-white font-sans relative z-10 leading-none">
          <span className="text-3xl font-extrabold tracking-tight select-all leading-none mb-1">
            {currentTime.toLocaleTimeString(lang === "id" ? "id-ID" : "en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
          <span className="text-sm font-semibold text-slate-200 mt-2 tracking-wide leading-none select-all">
            {currentTime.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </div>

        {/* Enter session button */}
        <div className="flex flex-col items-center justify-center select-none w-full relative z-10 select-none pb-6">
          <button
            onClick={() => setLocked(false)}
            className="p-3 w-48 h-11 border border-white/25 rounded-md hover:bg-white/10 text-white font-sans text-xs bg-black/15 font-bold transition-all backdrop-blur-md active:scale-95 shadow-lg select-none"
          >
            {t.signIn}
          </button>
          <span className="text-[10px] text-slate-350 tracking-wide mt-3">
            {lang === "id" ? "Klik untuk memulai dasbor admin aktif" : "Click to start active admin dashboard"}
          </span>
        </div>
      </div>
    );
  }

  // ------------------------------------
  // RENDER STAGE 4: DESKTOP WORKSPACE
  // ------------------------------------
  return (
    <div
      onClick={handleDesktopClick}
      onContextMenu={(e) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        if (target.closest("#system-taskbar") || target.closest(".window-frame") || target.closest("button") || target.closest(".window-btn") || target.closest(".app-window")) {
          return;
        }

        // Prevent rendering outside of view borders
        let posX = e.clientX;
        let posY = e.clientY;
        if (posX > window.innerWidth - 220) posX = window.innerWidth - 220;
        if (posY > window.innerHeight - 180) posY = window.innerHeight - 180;

        setContextMenu({ x: posX, y: posY });
      }}
      className={`w-screen h-screen relative flex flex-col select-none select-none transition-all duration-300 ${
        theme.wallpaper
      }`}
    >
      {/* 1. Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden select-none">
        
        {/* Dynamic Yellow Night Light overlay */}
        {settings.nightLight && (
          <div className="absolute inset-0 bg-orange-500/10 pointer-events-none mix-blend-color-burn z-[998]" />
        )}

        {/* Dynamic Dark Brightness Dimmer overlay */}
        {settings.brightness < 100 && (
          <div
            className="absolute inset-0 bg-black pointer-events-none z-[997]"
            style={{ opacity: (100 - settings.brightness) / 130 }}
          />
        )}

        {/* Desktop icon grid launchers */}
        <div className="absolute top-2.5 left-2.5 flex flex-col h-[calc(100%-20px)] flex-wrap select-none gap-4">
          {/* Default program files */}
          {desktopShortcuts.map((sc) => (
            <button
              key={sc.id}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDesktopIconDoubleClick(sc);
              }}
              className="group flex flex-col items-center p-2 rounded-md hover:bg-white/10 text-center w-20 relative select-none cursor-default active:scale-95 transition-all"
            >
              <span className="text-3xl block leading-none mb-1.5 transform group-hover:scale-105 transition-transform select-none">
                {sc.icon}
              </span>
              <span className="text-[10px] text-white font-semibold font-sans leading-normal drop-shadow truncate w-full select-none">
                {sc.label}
              </span>
            </button>
          ))}

          {/* User generated text files inside Desktop sandbox folder */}
          {desktopFiles.map((file) => (
            <button
              key={file.path}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDesktopFileDoubleClick(file);
              }}
              className="group flex flex-col items-center p-2 rounded-md hover:bg-white/10 text-center w-20 relative select-none cursor-default active:scale-95 transition-all"
            >
              <span className="text-3xl block leading-none mb-1.5 transform group-hover:scale-105 transition-transform select-none">
                📄
              </span>
              <span className="text-[10px] text-white font-semibold font-sans leading-normal drop-shadow truncate w-full select-none">
                {file.name}
              </span>
            </button>
          ))}
        </div>

        {/* Render App Windows Layer */}
        {windows.map((win) => (
          <WindowFrame
            key={win.id}
            window={win}
            theme={theme}
            onClose={handleCloseWindow}
            onMinimize={handleMinimizeWindow}
            onMaximize={handleMaximizeWindow}
            onFocus={handleFocusWindow}
            onUpdatePosition={handleUpdateWindowPosition}
          >
            {/* Conditional App Contents Injection */}
            {win.appType === "notepad" && (
              <Notepad
                theme={theme}
                initialFilePath={win.appData?.filePath}
                onFileSaved={() => syncDesktopFiles()}
                onClose={() => handleCloseWindow(win.id)}
              />
            )}
            {win.appType === "calculator" && <Calculator theme={theme} />}
            {win.appType === "explorer" && (
              <FileExplorer
                theme={theme}
                onFileSelect={(path) => handleLaunchApp("notepad", { filePath: path })}
              />
            )}
            {win.appType === "settings" && (
              <Settings 
                theme={theme} 
                onUpdateTheme={setTheme} 
                lang={lang} 
                onLanguageChange={handleLanguageChange} 
              />
            )}
            {win.appType === "terminal" && <Terminal theme={theme} />}
            {win.appType === "browser" && <Browser theme={theme} lang={lang} />}
            {win.appType === "mediaplayer" && <MediaPlayer theme={theme} />}
            {win.appType === "clock" && <ClockApp theme={theme} lang={lang} />}
            {win.appType === "taskmanager" && <TaskManager theme={theme} />}
          </WindowFrame>
        ))}

        {/* Widgets Panel Slideout */}
        <WidgetsPanel isOpen={widgetsOpen} theme={theme} />

        {/* Start Menu Panel Launcher */}
        <StartMenu
          isOpen={startOpen}
          theme={theme}
          lang={lang}
          onAppLaunch={handleLaunchApp}
          onPowerOff={handlePowerChange}
        />

        {/* Action Center Dropdown */}
        <ActionCenter
          isOpen={actionOpen}
          theme={theme}
          settings={settings}
          lang={lang}
          onUpdateSettings={(updates) => setSettings({ ...settings, ...updates })}
          onAppLaunch={handleLaunchApp}
        />

        {/* Notification Center Tray */}
        <NotificationCenter isOpen={notifOpen} theme={theme} currentTime={currentTime} />

        {/* Draggable Touch Virtual Keyboard */}
        <VirtualKeyboardComponent
          isOpen={keyboardOpen}
          theme={theme}
          onClose={() => setKeyboardOpen(false)}
        />
      </div>

      {/* 2. Global Taskbar Core element */}
      <Taskbar
        theme={theme}
        windows={windows}
        lang={lang}
        onLanguageToggle={() => handleLanguageChange(lang === "id" ? "en" : "id")}
        onToggleStartMenu={() => {
          setStartOpen(!startOpen);
          setActionOpen(false);
          setNotifOpen(false);
          setWidgetsOpen(false);
        }}
        onToggleWidgets={() => {
          setWidgetsOpen(!widgetsOpen);
          setStartOpen(false);
          setActionOpen(false);
          setNotifOpen(false);
        }}
        onToggleActionCenter={() => {
          setActionOpen(!actionOpen);
          setStartOpen(false);
          setNotifOpen(false);
          setWidgetsOpen(false);
        }}
        onToggleNotifications={() => {
          setNotifOpen(!notifOpen);
          setStartOpen(false);
          setActionOpen(false);
          setWidgetsOpen(false);
        }}
        onToggleKeyboard={() => setKeyboardOpen(!keyboardOpen)}
        onAppLaunch={handleLaunchApp}
        onAppFocus={handleFocusWindow}
        onCloseWindow={handleCloseWindow}
        onShowDesktop={handleShowDesktopToggle}
        currentTime={currentTime}
        volume={settings.volume}
      />

      {contextMenu && (
        <div
          className={`absolute rounded-xl border shadow-2xl p-1.5 w-52 z-[9999] backdrop-blur-2xl flex flex-col text-left select-none text-[11px] font-semibold leading-relaxed font-sans ${
            theme.theme === 'dark' 
              ? 'bg-zinc-900/85 text-slate-100 border-white/10 shadow-black/80' 
              : 'bg-white/85 text-slate-900 border-black/10 shadow-black/30'
          }`}
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Refresh Desktop */}
          <button
            onClick={() => {
              setContextMenu(null);
              // Momentary desktop content refresh animation
              setDesktopFiles([]);
              setTimeout(() => {
                syncDesktopFiles();
              }, 400);
            }}
            className="w-full text-left p-1.5 px-3 hover:bg-white/10 active:bg-white/5 rounded-md flex items-center gap-2 cursor-default transition-all duration-100"
          >
            <span>🔄</span>
            <span>{t.refreshDesktop}</span>
          </button>

          <div className={`h-[1px] my-1 ${theme.theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`} />

          {/* Create Text Document */}
          <button
            onClick={async () => {
              setContextMenu(null);
              try {
                // Find a unique default name
                let fileName = lang === "id" ? "Catatan.txt" : "Notes.txt";
                let num = 1;
                while (desktopFiles.some(f => f.name === fileName)) {
                  fileName = lang === "id" ? `Catatan (${num}).txt` : `Notes (${num}).txt`;
                  num++;
                }

                const response = await fetch("/api/files/write", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    path: `Desktop/${fileName}`,
                    content: lang === "id" 
                      ? "Dibuat melalui Menu Konteks Desktop Windows.\nSilakan mulai mengedit di sini!" 
                      : "Created via Windows Desktop Context Menu.\nStart editing here!"
                  })
                });

                if (response.ok) {
                  await syncDesktopFiles();
                  // Automatically open in Notepad
                  handleLaunchApp("notepad", { filePath: `Desktop/${fileName}` });
                }
              } catch (err) {
                console.error("Failed to create context file:", err);
              }
            }}
            className="w-full text-left p-1.5 px-3 hover:bg-white/10 active:bg-white/5 rounded-md flex items-center gap-2 cursor-default transition-all duration-100"
          >
            <span>📄</span>
            <span>{t.createDocument}</span>
          </button>

          <div className={`h-[1px] my-1 ${theme.theme === 'dark' ? 'bg-white/10' : 'bg-black/5'}`} />

          {/* Personalization Options */}
          <button
            onClick={() => {
              setContextMenu(null);
              handleLaunchApp("settings");
            }}
            className="w-full text-left p-1.5 px-3 hover:bg-white/10 active:bg-white/5 rounded-md flex items-center gap-2 cursor-default transition-all duration-100"
          >
            <span>⚙️</span>
            <span>{t.personalization}</span>
          </button>

          {/* Lock Device Screen */}
          <button
            onClick={() => {
              setContextMenu(null);
              setLocked(true);
            }}
            className="w-full text-left p-1.5 px-3 hover:bg-white/10 active:bg-white/5 rounded-md flex items-center gap-2 cursor-default transition-all duration-100"
          >
            <span>🔒</span>
            <span>{t.lockWorkstation}</span>
          </button>
        </div>
      )}
    </div>
  );
  }
