export interface AppWindow {
  id: string;
  title: string;
  icon: string; // name of lucide icon or path
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  isFocused: boolean;
  appType: "notepad" | "calculator" | "explorer" | "settings" | "terminal" | "browser" | "mediaplayer" | "clock" | "taskmanager";
  appData?: any; // e.g. path of open notepad file or folder directory
}

export interface DesktopIcon {
  id: string;
  label: string;
  icon: string; // Name of Lucide icon or custom SVG key
  type: "app" | "file" | "folder";
  appType?: AppWindow["appType"];
  filePath?: string; // rel path in sandbox if a file or directory
}

export interface FSItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
}

export interface SystemProcess {
  id: number;
  name: string;
  cpu: number;
  memory: number;
  status: string;
}

export interface SystemInfo {
  os: {
    platform: string;
    release: string;
    arch: string;
    uptime: number;
    hostname: string;
  };
  system: {
    cpuUsage: number;
    cpuCores: number;
    cpuModel: string;
    memTotal: number;
    memUsed: number;
    memPercentage: number;
    diskTotal: number;
    diskUsed: number;
  };
  processes: SystemProcess[];
}

export interface QuickSettings {
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  batterySaver: boolean;
  nightLight: boolean;
  volume: number;
  brightness: number;
}

export interface TaskbarTheme {
  theme: "light" | "dark";
  accentColor: string; // Tailwind hex color
  accentClass: string; // Tailwind color class e.g. bg-blue-600
  wallpaper: string; // Image URL/gradient class
}

export interface WidgetData {
  temp: number;
  city: string;
  condition: string;
  news: { title: string; source: string; time: string }[];
}
