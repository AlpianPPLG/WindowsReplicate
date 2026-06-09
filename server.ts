import express from "express";
import path from "path";
import os from "os";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to our safe sandbox filesystem
const SANDBOX_DIR = path.join(process.cwd(), "sandbox");

// Initialize default filesystem if it doesn't exist
function initFileSystem() {
  if (!fs.existsSync(SANDBOX_DIR)) {
    fs.mkdirSync(SANDBOX_DIR, { recursive: true });
    
    // Create folders
    const subdirs = ["Documents", "Downloads", "Pictures", "Desktop"];
    subdirs.forEach((dir) => {
      fs.mkdirSync(path.join(SANDBOX_DIR, dir), { recursive: true });
    });

    // Create default files
    fs.writeFileSync(
      path.join(SANDBOX_DIR, "Welcome.txt"),
      "Welcome to Windows 11 Web Replication!\n\nThis is a fully-functional Web GUI of Windows 11 integrated with a real Node.js/Express backend.\n\nEnjoy the following apps:\n- File Explorer (reads and writes current files)\n- Notepad (open and save txt files)\n- Terminal (runs interactive system shell commands)\n- Calculator (standard & scientific)\n- Clock (timer & world clock)\n- Settings (wallpapers & accent color customized via tailwind)\n- Task Manager (monitors real-time server resources)\n- Browser (explore any iframe-compatible web URL)\n- Media Player (play audios/videos!)\n- Full Virtual Keyboard supporting key combinations!\n\nTry drawing windows, dragging, double clicking desktop files, resizing, or hitting standard Win shortcuts!\n"
    );

    fs.writeFileSync(
      path.join(SANDBOX_DIR, "Documents", "Meeting_Notes.txt"),
      "Reviewing project requirements for the cloud platform.\nAll components must fit beautiful glassmorphism gradients!"
    );

    fs.writeFileSync(
      path.join(SANDBOX_DIR, "Downloads", "credits.txt"),
      "Created with Vite, Express, TypeScript, and TailwindCSS.\nDesign credit: Microsoft Windows 11 Design Guidelines."
    );

    fs.writeFileSync(
      path.join(SANDBOX_DIR, "Desktop", "Readme_First.txt"),
      "Hello User! Double click this notepad icon from the desktop to open it!\nYou can save files directly to the server."
    );
  }
}

initFileSystem();

// Safe path validation helper to prevent path traversal
function getSafePath(relativePath: string): string {
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '');
  const absolutePath = path.join(SANDBOX_DIR, normalizedPath);
  if (!absolutePath.startsWith(SANDBOX_DIR)) {
    return SANDBOX_DIR;
  }
  return absolutePath;
}

// Global active server process emulation
const PROCESSES = [
  { id: 1, name: "System", cpu: 0.1, memory: 45.2, status: "Running" },
  { id: 2, name: "Registry", cpu: 0.0, memory: 12.1, status: "Running" },
  { id: 3, name: "Desktop Shell", cpu: 1.2, memory: 124.5, status: "Running" },
  { id: 4, name: "svchost.exe", cpu: 0.1, memory: 28.3, status: "Running" },
  { id: 5, name: "Vite Server", cpu: 0.5, memory: 92.1, status: "Running" },
  { id: 6, name: "Express API", cpu: 0.2, memory: 41.8, status: "Running" },
];

// Helper to monitor CPU ticks
let lastCpuInfo = getCpuTicks();

function getCpuTicks() {
  const cpus = os.cpus();
  let user = 0;
  let nice = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;
  
  if (!cpus || cpus.length === 0) return { idle: 1, total: 2 };

  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  const total = user + nice + sys + idle + irq;
  return { idle, total };
}

function getCpuUsage(): number {
  const currentCpuInfo = getCpuTicks();
  const idleDiff = currentCpuInfo.idle - lastCpuInfo.idle;
  const totalDiff = currentCpuInfo.total - lastCpuInfo.total;
  
  lastCpuInfo = currentCpuInfo;

  if (totalDiff === 0) return 5; // fallback
  const percentage = 100 - Math.round((100 * idleDiff) / totalDiff);
  return Math.min(Math.max(percentage, 0), 100);
}

// ----------------------
// BACKEND API ROUTES
// ----------------------

// 1. Get Telemetry / CPU / RAM / Processes for Task Manager
app.get("/api/sysinfo", (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPct = parseFloat(((usedMem / totalMem) * 100).toFixed(1));

  // Simulating process load differences on every fetch
  const dynamicProcesses = PROCESSES.map((proc) => {
    if (proc.name === "System" || proc.name === "Registry" || proc.name === "svchost.exe") {
      return proc;
    }
    // inject small variance for realism
    const randomShift = (Math.random() - 0.5) * 0.4;
    return {
      ...proc,
      cpu: Math.max(0, parseFloat((proc.cpu + randomShift).toFixed(1))),
    };
  });

  res.json({
    os: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      uptime: os.uptime(),
      hostname: os.hostname(),
    },
    system: {
      cpuUsage: getCpuUsage(),
      cpuCores: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || "Unknown CPU",
      memTotal: totalMem,
      memUsed: usedMem,
      memPercentage: memPct,
      diskTotal: 128 * 1024 * 1024 * 1024, // 128GB simulated standard
      diskUsed: 37.4 * 1024 * 1024 * 1024, // 37.4GB simulated standard
    },
    processes: dynamicProcesses,
  });
});

// 2. Read File System Directory
app.get("/api/files/list", (req, res) => {
  const requestPath = (req.query.path as string) || "";
  const absolutePath = getSafePath(requestPath);

  try {
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "Directory does not exist" });
    }

    const stat = fs.statSync(absolutePath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: "Path is not a directory" });
    }

    const items = fs.readdirSync(absolutePath);
    const result = items.map((name) => {
      const itemPath = path.join(absolutePath, name);
      const fsStat = fs.statSync(itemPath);
      const relPath = path.relative(SANDBOX_DIR, itemPath);

      return {
        name,
        path: relPath || "",
        isDirectory: fsStat.isDirectory(),
        size: fsStat.size,
        modifiedAt: fsStat.mtime,
      };
    });

    res.json({
      currentPath: path.relative(SANDBOX_DIR, absolutePath) || "",
      items: result,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to list directory contents" });
  }
});

// 3. Read specific File Content
app.get("/api/files/read", (req, res) => {
  const filePath = (req.query.path as string) || "";
  const absolutePath = getSafePath(filePath);

  try {
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: "Cannot read a directory" });
    }

    const content = fs.readFileSync(absolutePath, "utf-8");
    res.json({
      path: path.relative(SANDBOX_DIR, absolutePath),
      content,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to read file" });
  }
});

// 4. Save/Write specific File
app.post("/api/files/write", (req, res) => {
  const { path: relativePath, content } = req.body;
  
  if (typeof relativePath !== "string") {
    return res.status(400).json({ error: "Path must be a string" });
  }

  const absolutePath = getSafePath(relativePath);

  try {
    // Make sure containing folder exists
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(absolutePath, content || "", "utf-8");
    res.json({
      success: true,
      path: path.relative(SANDBOX_DIR, absolutePath),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save file" });
  }
});

// 5. Delete specific File/Folder
app.post("/api/files/delete", (req, res) => {
  const { path: relativePath } = req.body;
  if (typeof relativePath !== "string" || !relativePath) {
    return res.status(400).json({ error: "Invalid path" });
  }

  const absolutePath = getSafePath(relativePath);

  try {
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "Item not found" });
    }

    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      fs.rmSync(absolutePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(absolutePath);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete item" });
  }
});

// 6. Create Folder
app.post("/api/files/create-folder", (req, res) => {
  const { path: relativePath, name } = req.body;
  if (typeof relativePath !== "string" || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid details" });
  }

  const absolutePath = path.join(getSafePath(relativePath), name);

  try {
    if (fs.existsSync(absolutePath)) {
      return res.status(400).json({ error: "Folder already exists" });
    }

    fs.mkdirSync(absolutePath, { recursive: true });
    res.json({ success: true, path: path.relative(SANDBOX_DIR, absolutePath) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create folder" });
  }
});

// 7. Simulating Terminal commands execution
app.post("/api/terminal/exec", (req, res) => {
  const { command, currentDir } = req.body;
  const parts = (command || "").trim().split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  const arg = parts.slice(1).join(" ");

  const absolutePath = getSafePath(currentDir || "");

  try {
    if (cmd === "ls" || cmd === "dir") {
      const items = fs.readdirSync(absolutePath);
      const list = items.map((item) => {
        const itemStat = fs.statSync(path.join(absolutePath, item));
        const sizeStr = itemStat.isDirectory() ? "<DIR>     " : `${itemStat.size} bytes`;
        return `${itemStat.mtime.toISOString().split('T')[0]}  ${sizeStr.padEnd(14)} ${item}`;
      });
      return res.json({
        output: list.length > 0 ? list.join("\n") : "Directory is empty.",
        nextDir: currentDir,
      });
    }

    if (cmd === "cd") {
      if (!arg) {
        return res.json({ output: currentDir || "\\", nextDir: currentDir });
      }
      const targetPath = path.join(absolutePath, arg);
      const safeTarget = getSafePath(path.relative(SANDBOX_DIR, targetPath));
      if (fs.existsSync(safeTarget) && fs.statSync(safeTarget).isDirectory()) {
        return res.json({
          output: "",
          nextDir: path.relative(SANDBOX_DIR, safeTarget) || "",
        });
      } else {
        return res.json({ output: `Error: Directory not found: ${arg}`, nextDir: currentDir });
      }
    }

    if (cmd === "cat" || cmd === "type") {
      if (!arg) {
        return res.json({ output: "Usage: cat <filename>", nextDir: currentDir });
      }
      const targetFile = path.join(absolutePath, arg);
      const safeTarget = getSafePath(path.relative(SANDBOX_DIR, targetFile));
      if (fs.existsSync(safeTarget)) {
        if (fs.statSync(safeTarget).isDirectory()) {
          return res.json({ output: `Error: ${arg} is a directory`, nextDir: currentDir });
        }
        const text = fs.readFileSync(safeTarget, "utf-8");
        return res.json({ output: text, nextDir: currentDir });
      } else {
        return res.json({ output: `Error: File not found: ${arg}`, nextDir: currentDir });
      }
    }

    if (cmd === "rm" || cmd === "del") {
      if (!arg) {
        return res.json({ output: "Usage: del <filename>", nextDir: currentDir });
      }
      const targetFile = path.join(absolutePath, arg);
      const safeTarget = getSafePath(path.relative(SANDBOX_DIR, targetFile));
      if (fs.existsSync(safeTarget)) {
        const stat = fs.statSync(safeTarget);
        if (stat.isDirectory()) {
          fs.rmSync(safeTarget, { recursive: true, force: true });
        } else {
          fs.unlinkSync(safeTarget);
        }
        return res.json({ output: `Removed: ${arg}`, nextDir: currentDir });
      } else {
        return res.json({ output: `Error: Item not found: ${arg}`, nextDir: currentDir });
      }
    }

    if (cmd === "mkdir" || cmd === "md") {
      if (!arg) {
        return res.json({ output: "Usage: mkdir <foldername>", nextDir: currentDir });
      }
      const newFolder = path.join(absolutePath, arg);
      const safeFolder = getSafePath(path.relative(SANDBOX_DIR, newFolder));
      if (fs.existsSync(safeFolder)) {
        return res.json({ output: `Error: Folder already exists: ${arg}`, nextDir: currentDir });
      }
      fs.mkdirSync(safeFolder, { recursive: true });
      return res.json({ output: `Directory created: ${arg}`, nextDir: currentDir });
    }

    if (cmd === "neofetch") {
      const loadAvg = os.loadavg();
      const output = [
        "                  ..                   OS: Windows 11 Web GUI (Express Sandbox)",
        "               .8888b.                 Host: " + os.hostname() + " (" + os.arch() + ")",
        "             .88888888b.               Kernel: Express v" + process.versions.node + " / Vite v6",
        "            .88888888888.              Uptime: " + Math.floor(os.uptime() / 60) + " mins",
        "            8888888888888              Shell: Win11 Terminal PowerShell Emulator",
        "            8888888888888              Resolution: Web Sandbox Dynamic Canvas",
        "            '88888888888'              DE: Fluent UI Design",
        "             '88888888':               Theme: Custom Glassmorphism Canvas Color",
        "               '8888':                 CPU: " + os.cpus()[0]?.model + " (" + os.cpus().length + " Cores)",
        "                 ''                    Memory: " + Math.round((os.totalmem() - os.freemem()) / (1024 * 1024)) + "MB / " + Math.round(os.totalmem() / (1024 * 1024)) + "MB"
      ].join("\n");
      return res.json({ output, nextDir: currentDir });
    }

    if (cmd === "help") {
      return res.json({
        output: [
          "Available command prompt functions inside Sandbox:",
          "  ls, dir           - List directory files and folders",
          "  cd <folder>       - Change current active directory",
          "  cat, type <file>  - Output contents of a file to screen",
          "  rm, del <file>    - Remove a file or directory",
          "  mkdir, md <name>  - Create a new folder directory",
          "  neofetch          - Render system design details and statistics",
          "  clear, cls        - Clear terminal stream output",
          "  help              - List all available command sets",
          "  whoami            - Display active session user",
          "  echo <msg>        - Print message back to shell"
        ].join("\n"),
        nextDir: currentDir,
      });
    }

    if (cmd === "whoami") {
      return res.json({ output: "win11-user\\administrator", nextDir: currentDir });
    }

    if (cmd === "echo") {
      return res.json({ output: arg || "", nextDir: currentDir });
    }

    // Default: run mock error message
    return res.json({
      output: `'${cmd}' is not recognized as an internal or external command, operable program or batch file.\nType 'help' to see available sandbox commands.`,
      nextDir: currentDir,
    });
  } catch (err: any) {
    res.json({ output: `Error: ${err.message || "Failed to execute Command"}`, nextDir: currentDir });
  }
});

// Vite Middleware integrated after API endpoints
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
