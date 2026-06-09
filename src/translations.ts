export type Language = "id" | "en";

export interface SystemTranslations {
  // Common / Desktop UI
  refreshDesktop: string;
  createDocument: string;
  personalization: string;
  lockWorkstation: string;
  startGreeting: string;
  signIn: string;
  systemLoading: string;
  activeAdmin: string;
  startingServices: string;
  powerOnDesktop: string;
  verifiedSecure: string;

  // Taskbar / Quick Settings
  volume: string;
  brightness: string;
  nightLight: string;
  wifi: string;
  bluetooth: string;
  airplane: string;
  batterySaver: string;
  langSelect: string;

  // Start Menu
  searchPlaceholder: string;
  pinned: string;
  allApps: string;
  recommended: string;
  more: string;
  sleep: string;
  restart: string;
  shutdown: string;
  simulationToast: string;
  noMatchingApps: string;

  // Settings App
  systemDetails: string;
  themeStyling: string;
  themeToggleDesc: string;
  switchLightMode: string;
  switchDarkMode: string;
  chooseWallpaper: string;
  accentTitle: string;
  specifications: string;
  sysVersion: string;
  engine: string;
  compiler: string;
  directory: string;
  languageTitle: string;
  languageDesc: string;
}

export const TRANSLATIONS: Record<Language, SystemTranslations> = {
  id: {
    refreshDesktop: "Segarkan Desktop",
    createDocument: "Buat Dokumen Teks",
    personalization: "Personalisasi Desktop",
    lockWorkstation: "Kunci Komputer",
    startGreeting: "Memulai Sesi Desktop...",
    signIn: "Masuk ke Desktop",
    systemLoading: "Urutan mematikan daya selesai. Perangkat beroperasi aman di memori virtual.",
    activeAdmin: "Administrator Aktif",
    startingServices: "Memulai Layanan Web...",
    powerOnDesktop: "Nyalakan Komputer",
    verifiedSecure: "[AMAN TERVERIFIKASI]",

    volume: "Volume Suara",
    brightness: "Kecerahan Layar",
    nightLight: "Cahaya Malam",
    wifi: "Sinyal Wi-Fi",
    bluetooth: "Koneksi Bluetooth",
    airplane: "Mode Pesawat",
    batterySaver: "Penghemat Baterai",
    langSelect: "Pilih Bahasa",

    searchPlaceholder: "Cari aplikasi, berkas, dan pengaturan...",
    pinned: "Ditempelkan",
    allApps: "Semua aplikasi >",
    recommended: "Saran Berkas",
    more: "Lebih banyak >",
    sleep: "Tidur (Sleep)",
    restart: "Mulai Ulang (Restart)",
    shutdown: "Matikan Daya (Shutdown)",
    simulationToast: "Mode Simulasi: Meluncurkan aplikasi ini dinonaktifkan. Silakan pasang dari Microsoft Store!",
    noMatchingApps: "Aplikasi tidak ditemukan. Coba pencarian lain!",

    systemDetails: "Informasi Sistem",
    themeStyling: "Gaya Tema Visual",
    themeToggleDesc: "Ganti ke mode gelap atau terang",
    switchLightMode: "Ganti Mode Terang",
    switchDarkMode: "Ganti Mode Gelap",
    chooseWallpaper: "Pilih Gambar Latar Belakang",
    accentTitle: "Pilihan Warna Aksen",
    specifications: "Spesifikasi Komputer",
    sysVersion: "Versi OS",
    engine: "Mesin Inti",
    compiler: "Penyusun Gaya",
    directory: "Direktori Berkas",
    languageTitle: "Bahasa Sistem (Language)",
    languageDesc: "Ubah bahasa antarmuka OS secara keseluruhan"
  },
  en: {
    refreshDesktop: "Refresh Desktop",
    createDocument: "Create Text Document",
    personalization: "Personalization",
    lockWorkstation: "Lock Workstation",
    startGreeting: "Starting Desktop...",
    signIn: "Sign In to Desktop",
    systemLoading: "Power off sequence completed. Device operates safely inside sandboxed memory.",
    activeAdmin: "Active Administrator",
    startingServices: "Starting Web Services...",
    powerOnDesktop: "Power On Desktop",
    verifiedSecure: "VERIFIED SECURE",

    volume: "Volume Level",
    brightness: "Brightness Level",
    nightLight: "Night Light Mode",
    wifi: "Wi-Fi Connection",
    bluetooth: "Bluetooth",
    airplane: "Airplane Mode",
    batterySaver: "Battery Saver",
    langSelect: "Language Select",

    searchPlaceholder: "Search for apps, files, and settings...",
    pinned: "Pinned",
    allApps: "All apps >",
    recommended: "Recommended",
    more: "More >",
    sleep: "Sleep",
    restart: "Restart",
    shutdown: "Shutdown",
    simulationToast: "Simulation Mode: Launching this app is disabled. It can be installed from the Microsoft Store!",
    noMatchingApps: "No matching apps found. Try searching another term!",

    systemDetails: "System Details",
    themeStyling: "Theme Styling",
    themeToggleDesc: "Toggle dark mode / light mode colors",
    switchLightMode: "Switch Light Mode",
    switchDarkMode: "Switch Dark Mode",
    chooseWallpaper: "Choose Wallpaper Background",
    accentTitle: "Accent Custom Tint",
    specifications: "Computer Specifications",
    sysVersion: "System Version",
    engine: "Framework Engine",
    compiler: "CSS Compiler",
    directory: "File Directory",
    languageTitle: "System Language",
    languageDesc: "Change the overall interface language"
  }
};
