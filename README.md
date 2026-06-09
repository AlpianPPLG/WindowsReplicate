# 🪟 Win11-Web — Windows 11 GUI Replication
> Replikasi antarmuka Windows 11 berbasis web (TypeScript + HTML + CSS + JavaScript) dengan backend Python sebagai jembatan sistem (shutdown, file system, dll).

---

## 📋 Daftar Isi
1. [Gambaran Umum](#gambaran-umum)
2. [Tech Stack](#tech-stack)
3. [Arsitektur Proyek](#arsitektur-proyek)
4. [Struktur Direktori](#struktur-direktori)
5. [Library & Dependencies](#library--dependencies)
6. [Prioritas Fitur](#prioritas-fitur)
7. [Task List](#task-list)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Virtual Keyboard](#virtual-keyboard)
10. [Fitur Shutdown](#fitur-shutdown)
11. [Cara Menjalankan](#cara-menjalankan)
12. [Catatan Pengembangan](#catatan-pengembangan)

---

## 🎯 Gambaran Umum

Win11-Web adalah proyek replikasi antarmuka Windows 11 yang dibangun menggunakan teknologi web modern. Aplikasi ini di-*render* di dalam jendela browser (via **pywebview** atau **Electron**) sehingga terlihat dan berperilaku seperti aplikasi desktop sungguhan. Backend Python menangani operasi sistem seperti shutdown, membaca file system, dan komunikasi antar komponen.

**Filosofi desain:**
- Semirip mungkin secara visual dengan Windows 11 asli (Fluent Design System)
- Fungsional: setiap elemen UI yang ada benar-benar bisa dipakai
- Modular: setiap "aplikasi" di dalam Windows adalah modul terpisah
- Virtual keyboard penuh yang berfungsi dengan shortcut

---

## 🛠️ Tech Stack

| Layer | Teknologi | Peran |
|---|---|---|
| **Frontend UI** | HTML5, CSS3, TypeScript | Render seluruh antarmuka Windows 11 |
| **Logika Frontend** | JavaScript (compiled TS) | Event handler, animasi, state management |
| **Styling** | CSS (CSS Variables + Glassmorphism) | Fluent Design, Mica effect, blur, transparansi |
| **Backend** | Python 3.10+ | Server lokal, sistem operasi, IPC |
| **Jembatan Desktop** | pywebview | Membungkus HTML dalam jendela native desktop |
| **Build Tool** | Vite | Bundling TypeScript ke JavaScript |
| **Runtime JS** | Node.js | Kompilasi TypeScript, dev server |

### Mengapa pywebview sebagai jendela?
- Ringan dibanding Electron (~60MB vs ~150MB)
- Tidak perlu Chromium terpisah (menggunakan WebView2 di Windows, WebKit di Mac/Linux)
- Python bisa langsung expose fungsi ke JavaScript (two-way bridge)
- Mendukung frameless window, fullscreen, drag, resize — persis seperti window Windows 11

---

## 🏗️ Arsitektur Proyek

```
┌─────────────────────────────────────────────────────────┐
│                   JENDELA PYWEBVIEW                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              FRONTEND (HTML/TS/CSS)                │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │              Desktop Shell                  │  │  │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │  │
│  │  │  │  Taskbar │  │ Start    │  │ System   │  │  │  │
│  │  │  │  Manager │  │ Menu     │  │ Tray     │  │  │  │
│  │  │  └──────────┘  └──────────┘  └──────────┘  │  │  │
│  │  │  ┌──────────────────────────────────────┐   │  │  │
│  │  │  │         Window Manager               │   │  │  │
│  │  │  │  [App1]  [App2]  [App3]  [App...]    │   │  │  │
│  │  │  └──────────────────────────────────────┘   │  │  │
│  │  │  ┌──────────────────────────────────────┐   │  │  │
│  │  │  │         Virtual Keyboard             │   │  │  │
│  │  │  └──────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                        │  JS↔Python Bridge               │
│  ┌───────────────────────────────────────────────────┐  │
│  │              BACKEND (Python)                      │  │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │  │
│  │  │ pywebview│  │ OS API   │  │  File System   │  │  │
│  │  │  Server  │  │ (shutdown│  │  (Documents,   │  │  │
│  │  │          │  │  reboot) │  │  Downloads...) │  │  │
│  │  └──────────┘  └──────────┘  └────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Alur Komunikasi (IPC)
```
Frontend (JS) ──[pywebview.api]──► Python Backend
Python Backend ──[window.evaluate_js()]──► Frontend (JS)
```

---

## 📁 Struktur Direktori

```
win11-web/
│
├── main.py                    # Entry point: inisialisasi pywebview window
├── api.py                     # Python API class (exposed ke JS): shutdown, fs, dll
├── requirements.txt           # Python dependencies
├── package.json               # Node.js / Vite config
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite bundler config
│
├── src/                       # Source TypeScript/CSS utama
│   ├── main.ts                # Entry point frontend
│   ├── style.css              # Global CSS (variabel Fluent Design)
│   │
│   ├── shell/                 # Komponen inti "OS Shell"
│   │   ├── Desktop.ts         # Desktop background, icon grid, right-click menu
│   │   ├── Taskbar.ts         # Taskbar bawah: Start, Search, pinned apps, tray
│   │   ├── StartMenu.ts       # Start Menu dengan search, pinned, recommended
│   │   ├── SystemTray.ts      # Jam, notifikasi, volume, WiFi, baterai
│   │   ├── ActionCenter.ts    # Quick Settings panel (WiFi, Bluetooth, dll)
│   │   ├── NotificationCenter.ts  # Panel notifikasi kanan
│   │   ├── WindowManager.ts   # Buka, tutup, minimize, maximize, snap windows
│   │   └── ContextMenu.ts     # Right-click context menu (global)
│   │
│   ├── apps/                  # Aplikasi-aplikasi bawaan
│   │   ├── Notepad/
│   │   │   ├── Notepad.ts
│   │   │   └── Notepad.css
│   │   ├── FileExplorer/
│   │   │   ├── FileExplorer.ts
│   │   │   └── FileExplorer.css
│   │   ├── Calculator/
│   │   │   ├── Calculator.ts
│   │   │   └── Calculator.css
│   │   ├── Settings/
│   │   │   ├── Settings.ts
│   │   │   └── Settings.css
│   │   ├── Terminal/
│   │   │   ├── Terminal.ts
│   │   │   └── Terminal.css
│   │   ├── Browser/           # Mini browser (iframe-based)
│   │   │   ├── Browser.ts
│   │   │   └── Browser.css
│   │   ├── MediaPlayer/
│   │   │   ├── MediaPlayer.ts
│   │   │   └── MediaPlayer.css
│   │   └── Clock/
│   │       └── Clock.ts
│   │
│   ├── keyboard/              # Virtual Keyboard
│   │   ├── VirtualKeyboard.ts # Layout keyboard + event dispatch
│   │   ├── VirtualKeyboard.css
│   │   └── layouts/
│   │       ├── en-US.ts       # Layout QWERTY English
│   │       └── id-ID.ts       # Layout QWERTY Indonesian
│   │
│   ├── components/            # Komponen UI reusable
│   │   ├── Window.ts          # Base window class (title bar, drag, resize, snap)
│   │   ├── Button.ts          # Fluent button variants
│   │   ├── Modal.ts           # Dialog/modal (shutdown confirm, dll)
│   │   ├── Toast.ts           # Notifikasi toast
│   │   └── Tooltip.ts         # Tooltip hover
│   │
│   ├── state/                 # State management
│   │   ├── store.ts           # Central state store (reactive)
│   │   ├── windowState.ts     # State semua window terbuka
│   │   └── userState.ts       # Tema, wallpaper, preferensi
│   │
│   └── utils/
│       ├── bridge.ts          # Wrapper untuk pywebview.api calls ke Python
│       ├── shortcuts.ts       # Global keyboard shortcut registry
│       └── animations.ts      # CSS transition helpers
│
├── public/
│   ├── index.html             # HTML shell utama
│   ├── assets/
│   │   ├── wallpapers/        # Wallpaper default Windows 11
│   │   ├── sounds/            # Startup, shutdown, notif sounds
│   │   ├── icons/             # Icon aplikasi (SVG/PNG)
│   │   └── fonts/             # Segoe UI Variable (atau fallback)
│   └── favicon.ico
│
├── dist/                      # Output build Vite (auto-generated)
│
└── docs/
    ├── FEATURES.md
    └── SHORTCUTS.md
```

---

## 📦 Library & Dependencies

### Python (requirements.txt)
```
pywebview==5.3.4          # Jendela desktop native berbasis WebView
pywebview[qt]             # Backend Qt untuk pywebview (opsional, lebih stabil)
Pillow==10.x              # Manipulasi gambar (wallpaper processing)
psutil==5.9.x             # Info sistem: CPU, RAM, disk untuk Task Manager
```

### Node.js / Frontend (package.json)
```json
{
  "devDependencies": {
    "typescript": "^5.4",
    "vite": "^5.2",
    "@types/node": "^20"
  },
  "dependencies": {
    // Semua UI dibangun dari scratch (HTML/CSS/TS murni)
    // Tidak ada framework besar (React/Vue) untuk performa maksimal
    // Kecuali jika kompleksitas meningkat — bisa tambah Preact (3KB)
  }
}
```

> **Catatan:** Frontend sengaja **tanpa framework besar** (no React/Vue). Ini dipilih karena:
> - Windows 11 shell perlu kontrol penuh atas DOM dan CSS
> - Performa lebih tinggi tanpa virtual DOM overhead
> - Lebih mudah mengontrol animasi dan event secara langsung

---

## 🎯 Prioritas Fitur

### 🔴 CRITICAL — PRIORITY 1 (Foundation, harus ada dulu)
*Tanpa ini, aplikasi tidak bisa berjalan*

| ID | Fitur | Deskripsi |
|---|---|---|
| F-01 | **Desktop Shell** | Canvas desktop, wallpaper, icon grid |
| F-02 | **Taskbar** | Bar bawah dengan Start button, pinned apps, system tray, jam |
| F-03 | **Window Manager** | Buka/tutup/minimize/maximize window, z-index, drag, resize |
| F-04 | **Shutdown/Restart/Sleep** | Power menu + konfirmasi dialog + tutup jendela pywebview |
| F-05 | **Start Menu** | Buka dengan Win key, pinned apps, tombol power |
| F-06 | **pywebview Bridge** | Koneksi JS ↔ Python berjalan lancar |
| F-07 | **Fluent Design Base** | CSS variables, blur/glassmorphism, warna Windows 11 |

---

### 🟠 HIGH — PRIORITY 2 (Core Usability)
*Fitur yang paling sering dipakai pengguna Windows 11*

| ID | Fitur | Deskripsi |
|---|---|---|
| F-08 | **Virtual Keyboard** | Keyboard on-screen penuh, fungsional, shortcut support |
| F-09 | **Notepad** | Text editor sederhana, buka/simpan file |
| F-10 | **Calculator** | Kalkulator standar + scientific |
| F-11 | **Context Menu** | Right-click di desktop dan dalam aplikasi |
| F-12 | **Action Center** | Quick Settings: mode pesawat, WiFi toggle, brightness slider |
| F-13 | **Notification System** | Toast notifikasi + panel notifikasi |
| F-14 | **Window Snap** | Snap ke kiri/kanan/pojok (50/50 split, 25/75) |
| F-15 | **Task View** | Win+Tab: semua window terbuka, virtual desktop dasar |

---

### 🟡 MEDIUM — PRIORITY 3 (Enrichment)
*Membuat pengalaman semakin mendekati Windows 11 asli*

| ID | Fitur | Deskripsi |
|---|---|---|
| F-16 | **File Explorer** | Navigasi folder lokal, tampilan grid/list, breadcrumb |
| F-17 | **Settings App** | Personalisasi: tema, wallpaper, warna aksen |
| F-18 | **Terminal (CMD-like)** | Input command, output teks, beberapa command dasar |
| F-19 | **System Tray Detail** | Volume slider, WiFi list (mock), baterai, notif badge |
| F-20 | **Wallpaper Changer** | Pilih wallpaper dari folder assets |
| F-21 | **Dark/Light Mode** | Toggle tema gelap/terang global |
| F-22 | **Start Menu Search** | Search apps/files dalam Start Menu |
| F-23 | **Taskbar Pinning** | Pin/unpin app ke taskbar |
| F-24 | **Desktop Icons** | Double-click buka app, drag icons di desktop |
| F-25 | **Media Player** | Putar audio/video lokal (HTML5 audio/video) |

---

### 🟢 LOW — PRIORITY 4 (Polish & Advanced)
*Sentuhan akhir dan fitur lanjutan*

| ID | Fitur | Deskripsi |
|---|---|---|
| F-26 | **Spotlight/Lock Screen** | Layar lock dengan jam besar sebelum masuk desktop |
| F-27 | **Mini Browser** | Browser tab sederhana berbasis iframe |
| F-28 | **Task Manager** | CPU/RAM usage via psutil, daftar proses mock |
| F-29 | **Startup Animation** | Animasi boot/startup Windows-style |
| F-30 | **Shutdown Animation** | Fade out + animasi shutdown sebelum close |
| F-31 | **Sound Effects** | Suara startup, error, notifikasi |
| F-32 | **Multiple Desktops** | Virtual desktop (buat/hapus desktop) |
| F-33 | **Widgets Panel** | Panel widget: cuaca, kalender, berita (mock data) |
| F-34 | **Accent Color Picker** | Pilih warna aksen custom |
| F-35 | **Clipboard History** | Win+V: riwayat clipboard sederhana |

---

## ✅ Task List

### Phase 0 — Setup & Scaffold
- [ ] **T-001** Inisialisasi repo Git
- [ ] **T-002** Setup `package.json` + `tsconfig.json` + `vite.config.ts`
- [ ] **T-003** Setup virtual environment Python + `requirements.txt`
- [ ] **T-004** Buat `main.py` dengan pywebview window dasar (frameless, fullscreen)
- [ ] **T-005** Buat `api.py` dengan class `WindowsAPI` (placeholder methods)
- [ ] **T-006** Verifikasi JS↔Python bridge berjalan (test `pywebview.api.test()`)
- [ ] **T-007** Setup `public/index.html` sebagai shell HTML
- [ ] **T-008** Setup CSS global dengan Fluent Design variables

### Phase 1 — Desktop Shell (F-01 ~ F-07)
- [ ] **T-010** Implementasi `Desktop.ts`: render wallpaper + background
- [ ] **T-011** Implementasi `Taskbar.ts`: bar bawah dengan layout dasar
- [ ] **T-012** Implementasi `WindowManager.ts`: class Window, open/close/minimize/maximize
- [ ] **T-013** Implementasi drag & resize untuk setiap window
- [ ] **T-014** Implementasi `StartMenu.ts`: buka/tutup dengan animasi
- [ ] **T-015** Implementasi `api.py` method `shutdown()`, `restart()`, `sleep()`
- [ ] **T-016** Buat shutdown confirmation `Modal.ts`
- [ ] **T-017** Implementasi Power Menu di Start Menu → kirim ke Python → close window
- [ ] **T-018** Implementasi `SystemTray.ts`: jam real-time, ikon tray
- [ ] **T-019** Implementasi Fluent CSS: glassmorphism, blur, shadow, animasi

### Phase 2 — Virtual Keyboard (F-08)
- [ ] **T-020** Desain layout HTML keyboard (QWERTY penuh + numpad)
- [ ] **T-021** Implementasi `VirtualKeyboard.ts`: toggle show/hide
- [ ] **T-022** Implementasi key press → dispatch `KeyboardEvent` ke focused element
- [ ] **T-023** Implementasi Shift, Caps Lock, Fn layer switching
- [ ] **T-024** Implementasi shortcut keys (Ctrl, Alt, Win, dll) pada virtual keyboard
- [ ] **T-025** Styling VK: tombol dengan hover/active state Fluent
- [ ] **T-026** Implementasi drag VK (bisa dipindah posisinya)
- [ ] **T-027** Tombol keyboard di taskbar untuk toggle VK

### Phase 3 — Core Apps & UI (F-09 ~ F-15)
- [ ] **T-030** Implementasi `Calculator.ts`: mode standard + scientific
- [ ] **T-031** Implementasi `Notepad.ts`: textarea + menu bar + simpan ke Python
- [ ] **T-032** Implementasi `ContextMenu.ts`: right-click desktop + apps
- [ ] **T-033** Implementasi `ActionCenter.ts`: panel quick settings
- [ ] **T-034** Implementasi `Toast.ts`: sistem notifikasi pop-up
- [ ] **T-035** Implementasi Window Snap: drag ke tepi → snap preview → snap
- [ ] **T-036** Implementasi `TaskView.ts`: Win+Tab overlay semua window
- [ ] **T-037** Implementasi `shortcuts.ts`: registry shortcut global

### Phase 4 — Enrichment Apps (F-16 ~ F-25)
- [ ] **T-040** Implementasi `FileExplorer.ts`: baca direktori via Python API
- [ ] **T-041** Implementasi `api.py` method `list_dir()`, `open_file()`, `get_drives()`
- [ ] **T-042** Implementasi `Settings.ts`: halaman tema + wallpaper + warna
- [ ] **T-043** Implementasi `Terminal.ts`: input/output + beberapa command (ls, cd, echo)
- [ ] **T-044** Implementasi Dark/Light mode toggle (CSS class swap)
- [ ] **T-045** Implementasi Wallpaper Changer dari folder assets
- [ ] **T-046** Implementasi `MediaPlayer.ts`: HTML5 audio/video player
- [ ] **T-047** Implementasi pinning app ke taskbar (simpan di localStorage/state)
- [ ] **T-048** Implementasi Start Menu search filter

### Phase 5 — Polish (F-26 ~ F-35)
- [ ] **T-050** Implementasi Lock Screen dengan jam besar
- [ ] **T-051** Implementasi Boot animation (spinning dots Windows-style)
- [ ] **T-052** Implementasi Shutdown fade-out animation sebelum window close
- [ ] **T-053** Implementasi sound effects (startup chime, error beep)
- [ ] **T-054** Implementasi `TaskManager.ts`: CPU/RAM dari `psutil` via Python
- [ ] **T-055** Implementasi `WidgetsPanel.ts`: mock weather + kalender
- [ ] **T-056** Implementasi Multiple Virtual Desktops
- [ ] **T-057** Implementasi Clipboard History (Win+V)
- [ ] **T-058** Polishing seluruh CSS: spacing, animasi, konsistensi
- [ ] **T-059** Testing cross-platform: Windows, macOS, Linux

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Aksi |
|---|---|
| `Win` / `Ctrl+Esc` | Buka/tutup Start Menu |
| `Win + D` | Show/hide Desktop |
| `Win + E` | Buka File Explorer |
| `Win + L` | Lock Screen |
| `Win + Tab` | Task View |
| `Win + ←/→` | Snap window kiri/kanan |
| `Win + ↑` | Maximize window |
| `Win + ↓` | Minimize / Restore window |
| `Win + N` | Buka Notification Center |
| `Win + A` | Buka Action Center |
| `Win + K` | Toggle Virtual Keyboard |
| `Win + V` | Clipboard History |
| `Alt + F4` | Tutup aplikasi aktif |
| `Alt + Tab` | Berpindah antar window |
| `Ctrl + Alt + Del` | Munculkan Security Screen (mock) |
| `PrtScn` | Screenshot (simpan ke clipboard mock) |
| `Ctrl + Z/Y` | Undo/Redo (dalam app yang support) |

Semua shortcut di-handle di `src/utils/shortcuts.ts` dan bisa diinterpolasi ke Virtual Keyboard.

---

## 🎹 Virtual Keyboard

Virtual keyboard (`src/keyboard/VirtualKeyboard.ts`) bekerja dengan cara:

1. **Render**: Keyboard dirender sebagai HTML overlay absolut di atas semua elemen
2. **Focus Detection**: Saat input field difokus, VK otomatis muncul (jika mode auto-show aktif)
3. **Key Dispatch**: Setiap tombol yang ditekan mendispatch `new KeyboardEvent('keydown', ...)` dan `new InputEvent('input', ...)` ke `document.activeElement`
4. **Layers**:
   - Default layer: huruf kecil
   - Shift layer: huruf besar + simbol atas
   - Caps Lock layer: huruf besar persisten
   - Symbol layer: angka + simbol khusus
5. **Modifier keys**: Ctrl, Alt, Win ditahan (toggle) dan dikirim bersama key berikutnya
6. **Draggable**: Keyboard bisa digeser posisinya dengan drag di header

---

## ⚡ Fitur Shutdown

Shutdown adalah fitur kritis yang menghubungkan frontend ke backend Python.

### Alur:
```
User klik Start → Power → Shutdown
        │
        ▼
Modal konfirmasi muncul ("Apakah Anda yakin?")
        │
        ▼
User konfirmasi → JavaScript memanggil:
  await pywebview.api.shutdown()
        │
        ▼
Python `api.py` method shutdown():
  1. Kirim event ke frontend: window.evaluate_js("triggerShutdownAnimation()")
  2. Tunggu animasi selesai (1.5 detik)
  3. window.destroy() ← menutup jendela pywebview
        │
        ▼
Jendela tertutup = aplikasi selesai
```

### Kode Python (api.py):
```python
import webview, time, threading

class WindowsAPI:
    def __init__(self, window):
        self.window = window

    def shutdown(self):
        """Dipanggil dari JavaScript saat user memilih Shutdown"""
        def _do_shutdown():
            # Trigger animasi shutdown di frontend
            self.window.evaluate_js("triggerShutdownAnimation()")
            time.sleep(1.5)  # Tunggu animasi fade
            self.window.destroy()  # Tutup window
        threading.Thread(target=_do_shutdown).start()

    def restart(self):
        """Restart: tutup dan buka ulang window"""
        def _do_restart():
            self.window.evaluate_js("triggerShutdownAnimation()")
            time.sleep(1.5)
            self.window.destroy()
            # Re-launch window baru
            webview.create_window("Win11-Web", "dist/index.html", ...)
        threading.Thread(target=_do_restart).start()

    def sleep(self):
        """Sleep: tampilkan lock screen"""
        self.window.evaluate_js("triggerSleepAnimation()")
```

### Kode JavaScript (bridge.ts):
```typescript
export async function performShutdown(): Promise<void> {
  await (window as any).pywebview.api.shutdown();
}

// Animasi shutdown dipanggil dari Python
(window as any).triggerShutdownAnimation = () => {
  document.body.classList.add('shutting-down');
  // CSS transition: opacity 0, screen fade to black
};
```

---

## 🚀 Cara Menjalankan

### Prerequisites
```bash
# Python 3.10+
pip install pywebview Pillow psutil

# Node.js 18+
npm install
```

### Development
```bash
# Terminal 1: Jalankan Vite dev server
npm run dev

# Terminal 2: Jalankan pywebview dengan URL dev server
python main.py --dev
```

### Production
```bash
# Build frontend
npm run build

# Jalankan aplikasi (baca dari dist/)
python main.py
```

### main.py (entry point)
```python
import webview
from api import WindowsAPI
import sys

def main():
    is_dev = '--dev' in sys.argv
    url = 'http://localhost:5173' if is_dev else 'dist/index.html'

    window = webview.create_window(
        title='',                    # Frameless, no title
        url=url,
        width=1280,
        height=720,
        resizable=True,
        frameless=True,              # Hapus chrome browser/OS
        easy_drag=False,             # Kita handle drag sendiri
        background_color='#000000'
    )

    api = WindowsAPI(window)
    window.expose(api)               # Expose semua method ke JS

    webview.start(debug=is_dev)

if __name__ == '__main__':
    main()
```

---

## 📝 Catatan Pengembangan

### Fluent Design CSS Variables
```css
:root {
  /* Warna utama Windows 11 */
  --win-bg: #202020;
  --win-surface: rgba(32, 32, 32, 0.85);
  --win-accent: #0078D4;
  --win-accent-light: #60CDFF;
  --win-text: #FFFFFF;
  --win-text-secondary: rgba(255,255,255,0.6);

  /* Glassmorphism (Mica effect) */
  --win-blur: blur(20px) saturate(180%);
  --win-glass: rgba(255,255,255,0.08);

  /* Taskbar */
  --taskbar-height: 48px;
  --taskbar-bg: rgba(20, 20, 20, 0.9);
}
```

### Fonts
Gunakan **Segoe UI Variable** (bundled di Windows) atau fallback ke **Inter** / **Noto Sans** untuk cross-platform. Font bisa di-embed via `@font-face` dari folder `public/assets/fonts/`.

### Batasan yang Diketahui
- Virtual keyboard dispatch `KeyboardEvent` — beberapa browser sandboxing mungkin membatasi synthetic events pada beberapa elemen
- File Explorer terbatas pada direktori yang diizinkan Python API
- Shutdown menutup jendela aplikasi, bukan mematikan OS host (ini adalah simulasi)
- Efek Mica/Acrylic penuh membutuhkan Windows 11 host + WebView2; di OS lain degradasi graceful ke blur biasa

---

*README ini dibuat berdasarkan analisa arsitektur lengkap proyek Win11-Web. Setiap task dalam daftar di atas bisa langsung dikerjakan secara berurutan sesuai fase.*
