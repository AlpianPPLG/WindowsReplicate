import React, { useState, useEffect } from "react";
import { TaskbarTheme } from "../types";
import { Language } from "../translations";
import { 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  Home, 
  Sparkles, 
  ExternalLink, 
  Bookmark, 
  Compass, 
  Globe, 
  Clock, 
  ChevronRight, 
  Languages, 
  HelpCircle 
} from "lucide-react";

interface BrowserProps {
  theme: TaskbarTheme;
  lang: Language;
}

interface WikiSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

interface SmartAnswer {
  title: string;
  summary: string;
  facts: string[];
}

export default function Browser({ theme, lang }: BrowserProps) {
  // Navigation states
  const [url, setUrl] = useState("");
  const [iframeUrl, setIframeUrl] = useState("https://wikipedia.org");
  const [viewMode, setViewMode] = useState<"home" | "search" | "iframe">("home");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState<"google" | "wikipedia" | "duckduckgo">("google");
  const [wikiLang, setWikiLang] = useState<"id" | "en">("id");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<WikiSearchResult[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "news" | "images" | "maps">("all");

  const isDark = theme.theme === "dark";

  // Match main language default
  useEffect(() => {
    setWikiLang(lang === "id" ? "id" : "en");
  }, [lang]);

  // Translatable texts setup
  const t = {
    searchPlaceholder: lang === "id" 
      ? "Cari Google, Wiki, DuckDuckGo atau ketik URL (contoh: google.com)..." 
      : "Search Google, Wiki, DuckDuckGo or enter URL (e.g., google.com)...",
    peopleAlsoAsk: lang === "id" ? "Orang Juga Bertanya" : "People Also Ask",
    browserFacility: lang === "id" ? "Protokol Penjelajah Web" : "Web Browser Platform",
    browserDesc: lang === "id" 
      ? "Anda sedang menggunakan Edge Engine Replica. Masukkan URL penuh (contoh: wikipedia.org) ke bilah alamat untuk merender frame penuh."
      : "You are using the Edge Engine Replica. Type a full URL address (e.g., wikipedia.org) in the bar above to load a live sandbox iframe.",
    backToHome: lang === "id" ? "Kembali ke Beranda" : "Back to Home",
    searchBtn: lang === "id" ? "Cari Informasi" : "Search Engine",
    resultsFor: lang === "id" ? "Hasil Pencarian Untuk" : "Search Results For",
    searchingApi: lang === "id" ? "Menghubungkan ke API secara langsung..." : "Connecting to active API indexes...",
    foundAround: lang === "id" ? "Ditemukan sekitar" : "Found approximately",
    speedDial: lang === "id" ? "Kejut Pintar (Speed Dial)" : "Speed Dial Shortcuts",
    noResults: lang === "id" ? "Hasil pencarian nihil" : "No results found",
    noResultsDesc: lang === "id" 
      ? "Cobalah masukkan kata kunci menarik seperti 'Semarang', 'Indonesia', 'React', atau 'Kucing'!"
      : "Try entering high-density key terms like 'Semarang', 'Indonesia', 'React', or 'Kucing'!",
    readMore: lang === "id" ? "Baca Selengkapnya" : "Read Full Story",
    externalLabel: lang === "id" ? "BUKA DI JENDELA BARU" : "OPEN IN NEW WINDOW",
    all: lang === "id" ? "Semua" : "All",
    news: lang === "id" ? "Berita" : "News",
    images: lang === "id" ? "Gambar" : "Images",
    maps: lang === "id" ? "Peta" : "Maps",
    wikipediaLabel: "WIKIPEDIA OFFICIAL ENCYCLOPEDIA",
    googleDisclaimer: lang === "id" ? "Buka hasil real di Tab Baru" : "Open live query in external Tab",
    searchBoxPlaceholder: lang === "id" 
      ? `Cari apa saja menggunakan ${searchEngine === 'google' ? 'Google' : searchEngine === 'wikipedia' ? 'Wikipedia' : 'DuckDuckGo'}...`
      : `Search anything using ${searchEngine === 'google' ? 'Google' : searchEngine === 'wikipedia' ? 'Wikipedia' : 'DuckDuckGo'}...`
  };

  // Pre-coded smart search summaries (responsive in both ID and EN)
  const SMART_ANSWERS: Record<string, SmartAnswer> = {
    semarang: {
      title: "Semarang — Ibukota Jawa Tengah",
      summary: "Semarang adalah ibukota Provinsi Jawa Tengah, Indonesia, sekaligus kota metropolitan terbesar kelima di Indonesia. Terkenal sebagai kota pusat perdagangan pesisir utara Jawa, memiliki kekayaan budaya hasil asimilasi etnis Jawa, Tionghoa, Arab, dan kolonial Belanda. Ikon lokalnya yang legendaris meliputi Lawang Sewu, Kota Lama, Lumpia Semarang, dan Bandeng Presto.",
      facts: [
        "Wilayah Administratif: Jawa Tengah, NKRI",
        "Kuliner Khas: Lumpia, Wingko Babat, Tahu Gimbal",
        "Destinasi Populer: Lawang Sewu, Pagoda Avalokitesvara, Kelenteng Sam Poo Kong"
      ]
    },
    indonesia: {
      title: "Republik Indonesia (NKRI)",
      summary: "Indonesia adalah negara kepulauan terbesar di dunia yang terletak di antara Asia Tenggara dan Oseania. Negara ini melintasi khatulistiwa, memanjang dari Sabang hingga Merauke, serta kaya akan keanekaragaman hayati, budaya, bahasa daerah, dan geografi vulkanik. Indonesia memegang posisi ekonomi terbesar di Asia Tenggara dan merupakan anggota G20.",
      facts: [
        "Ibukota: Nusantara (IKN) / DKI Jakarta",
        "Populasi: Sekitar 278 juta jiwa",
        "Mata Uang: Rupiah (IDR)",
        "Ideologi Negara: Pancasila"
      ]
    },
    react: {
      title: "React — Library JS untuk Antarmuka Pengguna",
      summary: "React adalah pustaka JavaScript sumber terbuka berskala industri yang dikembangkan oleh Meta (Facebook) dan komunitas developer dunia. Didesain menggunakan pola Component-Based untuk menciptakan UI web deklaratif yang responsif. React mengandalkan rekonsiliasi Virtual DOM guna mempercepat rendering dan mendukung ekosistem luas seperti Next.js, Redux, dan React Native.",
      facts: [
        "Rilis Perdana: Mei 2013 oleh Jordan Walke",
        "Paradigme Utama: Declarative, Component-Based, Learn Once Write Anywhere",
        "Prinsip Utama: Virtual DOM, JSX Syntax, Unidirectional Data Flow"
      ]
    },
    kucing: {
      title: "Kucing Domestik (Felis catus)",
      summary: "Kucing adalah mamalia karnivora kecil dari keluarga Felidae yang telah mendampingi peradaban manusia sejak ribuan tahun silam. Terkenal dengan kelenturan fisiknya yang luar biasa, kemampuan mengonservasi energi, indra pendengaran tajam, serta penglihatan malam yang superior. Mereka berkomunikasi melalui vokalisasi meow, purring (purr), mendesis, dan gestur tubuh.",
      facts: [
        "Status Konservasi: Jinak (Dipelihara)",
        "Spesies Populer: Angora, Persia, British Shorthair, Kucing Kampung",
        "Harapan Hidup: 12 - 15 Tahun (rata-rata domestik)"
      ]
    },
    cuaca: {
      title: "Informasi Cuaca & Iklim Tropis",
      summary: "Prakiraan cuaca regional menunjukkan aktivitas tekanan atmosfer yang seimbang. Kelembaban udara terpantau berada di angka 72% dengan hembusan angin sepoi-sepoi berkecepatan 12 km/jam mengarah ke barat laut. Kondisi langit secara umum cerah berawan dengan potensi peningkatan kelembabab di wilayah dataran tinggi sore hari.",
      facts: [
        "Suhu Rata-rata: 29°C - 33°C",
        "Status: Cerah Berawan",
        "Indeks UV: Level 6 (Sedang-Tinggi)"
      ]
    }
  };

  // Get matching smart answer with helper
  const getSmartAnswer = (query: string): SmartAnswer | null => {
    const qLower = query.toLowerCase().trim();
    if (qLower.includes("semarang")) return SMART_ANSWERS.semarang;
    if (qLower.includes("indonesia")) return SMART_ANSWERS.indonesia;
    if (qLower.includes("react")) return SMART_ANSWERS.react;
    if (qLower.includes("kucing") || qLower.includes("cat")) return SMART_ANSWERS.kucing;
    if (qLower.includes("cuaca") || qLower.includes("weather") || qLower.includes("hujan")) return SMART_ANSWERS.cuaca;
    return null;
  };

  // Firing live API call to Wikipedia
  const performSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setViewMode("search");
    setSearchQuery(queryText);
    setUrl(queryText);

    try {
      // Fetch live Wikipedia results matching query via OpenSearch API
      const apiEndpoint = `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryText)}&utf8=&format=json&origin=*`;
      const response = await fetch(apiEndpoint);
      const data = await response.json();
      
      if (data && data.query && data.query.search) {
        setSearchResults(data.query.search);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Wikipedia Live Search Error:", err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = url.trim();
    if (!input) return;

    // Direct url check (has schema or domain layout like google.com, wikipedia.org, local files)
    const isUrl = /^https?:\/\//i.test(input) || (input.includes(".") && !input.includes(" "));
    
    if (isUrl) {
      let formattedUrl = input;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = "https://" + formattedUrl;
      }
      setUrl(formattedUrl);
      setIframeUrl(formattedUrl);
      setViewMode("iframe");
    } else {
      performSearch(input);
    }
  };

  const handleBookmarkClick = (targetUrl: string, isQuery: boolean = false) => {
    if (isQuery) {
      setUrl(targetUrl);
      performSearch(targetUrl);
    } else {
      setUrl(targetUrl);
      setIframeUrl(targetUrl);
      setViewMode("iframe");
    }
  };

  const handleResultClick = (title: string) => {
    const fullWikiUrl = `https://${wikiLang}.m.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    setUrl(fullWikiUrl);
    setIframeUrl(fullWikiUrl);
    setViewMode("iframe");
  };

  const goHome = () => {
    setUrl("");
    setSearchQuery("");
    setViewMode("home");
  };

  const bookmarks = [
    { name: "Google", url: "Google Search", isQuery: true },
    { name: "Semarang", url: "Semarang", isQuery: true },
    { name: "Wikipedia", url: "https://wikipedia.org", isQuery: false },
    { name: "ReactJS", url: "React JS", isQuery: true },
    { name: "Tailwind CSS", url: "https://tailwindcss.com", isQuery: false },
    { name: "Games Portal", url: "https://aistudiogame.io", isQuery: false }
  ];

  const matchedSmart = getSmartAnswer(searchQuery);

function openOnExternalEngine(event: MouseEvent<HTMLButtonElement,MouseEvent>): void {
throw new Error("Function not implemented.");
}

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent text-inherit select-none h-full font-sans relative">
      
      {/* 1. Address bar header */}
      <div className={`p-2 px-3 border-b flex gap-2.5 items-center select-none ${
        isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-350/10"
      }`}>
        {/* Navigation Buttons */}
        <div className="flex gap-1.5">
          <button 
            type="button"
            onClick={goHome}
            title="Home"
            className="p-1.5 hover:bg-slate-500/10 active:scale-95 rounded transition cursor-default"
          >
            <Home className="w-4 h-4 text-inherit" />
          </button>
          
          <button 
            disabled={viewMode === "home"}
            onClick={goHome}
            title="Go Back"
            className={`p-1.5 rounded cursor-default transition ${
              viewMode === "home" ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-500/10 active:scale-95"
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-inherit" />
          </button>

          <button 
            disabled 
            className="p-1.5 rounded opacity-30 cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button 
            onClick={() => {
              if (viewMode === "iframe") {
                setIframeUrl(url);
              } else if (viewMode === "search") {
                performSearch(searchQuery);
              }
            }} 
            className="p-1.5 hover:bg-slate-500/10 rounded active:scale-90 transition cursor-default"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-inherit" />
          </button>
        </div>

        {/* Address Input Form */}
        <form onSubmit={handleAddressSubmit} className={`flex-1 flex items-center gap-2 px-3 leading-none h-8.5 border rounded-full text-xs shadow-sm transition-all duration-150 ${
          isDark 
            ? "border-white/10 bg-black/25 focus-within:border-sky-500/50 focus-within:bg-black/40" 
            : "border-slate-300 bg-white focus-within:border-indigo-500/50 focus-within:shadow-indigo-500/5"
        }`}>
          {viewMode === "iframe" ? (
            <Globe className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          ) : (
            <Search className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-inherit text-[11px] font-medium"
            spellCheck="false"
          />
        </form>

        {/* Language selector for Wikipedia API */}
        <div className={`flex items-center gap-1 p-0.5 border rounded-lg text-[9px] font-extrabold select-none ${
          isDark ? "border-white/10 bg-black/20" : "border-slate-300 bg-slate-100"
        }`}>
          <Languages className="w-3 h-3 text-slate-400 mx-1" />
          <button 
            type="button"
            onClick={() => setWikiLang("id")}
            className={`px-1.5 py-0.5 rounded ${wikiLang === "id" ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-slate-500/10 text-slate-400"}`}
          >
            Indonesia
          </button>
          <button 
            type="button"
            onClick={() => setWikiLang("en")}
            className={`px-1.5 py-0.5 rounded ${wikiLang === "en" ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-slate-500/10 text-slate-400"}`}
          >
            English
          </button>
        </div>
      </div>

      {/* 2. Bookmark Navigation Bar */}
      <div className={`p-1 px-4 border-b flex gap-4 text-[10.5px] font-semibold text-slate-500 leading-none select-none justify-start items-center ${
        isDark ? "bg-black/5 border-white/5 text-slate-400" : "bg-slate-50 border-slate-350/10 text-slate-600"
      }`}>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-1">
          <Bookmark className="w-3 h-3" /> Bookmarks:
        </span>
        {bookmarks.map((bm) => (
          <button
            key={bm.name}
            onClick={() => handleBookmarkClick(bm.url, bm.isQuery)}
            className="hover:text-indigo-500 hover:underline transition cursor-default flex items-center gap-0.5"
          >
            <span>{bm.isQuery ? "🔍" : "🔖"}</span>
            <span>{bm.name}</span>
          </button>
        ))}
      </div>

      {/* 3. Browser Main Display Stage */}
      <div className="flex-1 bg-transparent min-h-0 relative overflow-y-auto">
        
        {/* VIEW 1: HOME PAGE (SearchPortal) */}
        {viewMode === "home" && (
          <div className="flex flex-col items-center justify-center min-h-full p-6 text-center max-w-xl mx-auto space-y-7 select-none animate-fade-in">
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">🌐</span>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 tracking-tight font-sans">
                  Edge SearchLens
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">{lang === "id" ? "Browser Web Sandbox Multi-Mesin" : "Multi-Engine Sandbox Web Browser"}</p>
            </div>

            {/* Custom Interactive Search Engine selector tab */}
            <div className={`flex p-1 rounded-xl border text-[11px] font-bold gap-1 w-full max-w-md ${
              isDark ? "bg-black/25 border-white/10" : "bg-slate-100 border-slate-350"
            }`}>
              {[
                { id: "google", label: "Google", desc: lang === "id" ? "Hasil Global" : "Global Web", icon: "🌐" },
                { id: "wikipedia", label: "WikiSearch", desc: lang === "id" ? "Ensiklopedia" : "Encyclopedia", icon: "📚" },
                { id: "duckduckgo", label: "DuckDuckGo", desc: lang === "id" ? "Privasi" : "Privacy Search", icon: "🦆" }
              ].map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => setSearchEngine(engine.id as any)}
                  className={`flex-1 py-1 px-2 rounded-lg flex flex-col items-center transition cursor-default ${
                    searchEngine === engine.id
                      ? "bg-indigo-600 text-white shadow shadow-indigo-500/20"
                      : "hover:bg-slate-500/10 text-slate-400"
                  }`}
                >
                  <span className="text-xs font-bold flex items-center gap-1 mt-0.5">
                    <span>{engine.icon}</span>
                    <span>{engine.label}</span>
                  </span>
                  <span className="text-[8px] font-normal opacity-70 leading-none mt-0.5">{engine.desc}</span>
                </button>
              ))}
            </div>

            {/* Large Search Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                performSearch(searchQuery);
              }}
              className="w-full max-w-md"
            >
              <div className={`flex items-center rounded-2xl border p-2 h-12 shadow-md focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all ${
                isDark 
                  ? "border-white/10 bg-zinc-900/60 focus-within:border-indigo-500/50" 
                  : "border-slate-300 bg-white focus-within:border-indigo-500/50"
              }`}>
                <Search className="w-5 h-5 text-slate-400 mx-2" />
                <input
                  type="text"
                  placeholder={t.searchBoxPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setUrl(e.target.value);
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-inherit"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[10px] font-bold p-1 hover:text-red-400 text-slate-400"
                  >
                    {lang === "id" ? "Hapus" : "Clear"}
                  </button>
                )}
              </div>

              <div className="flex gap-2.5 justify-center mt-3">
                <button
                  type="submit"
                  className="p-1.5 px-4 text-[10.5px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition text-white shadow-sm cursor-default"
                >
                  {t.searchBtn}
                </button>
              </div>
            </form>

            {/* Quick Speed Dials */}
            <div className="w-full max-w-md pt-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-left mb-2 leading-none">{t.speedDial}</span>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { name: lang === "id" ? "Kota Semarang" : "Semarang City", q: "Semarang", color: "bg-amber-500", icon: "🏛️" },
                  { name: "Indonesia", q: "Indonesia", color: "bg-red-500", icon: "🇮🇩" },
                  { name: "React JS", q: "React JS", color: "bg-sky-500", icon: "⚛️" },
                  { name: "Kucing", q: "Kucing", color: "bg-emerald-500", icon: "🐈" },
                  { name: "Weather Tropis", q: "Cuaca", color: "bg-blue-500", icon: "☀️" },
                  { name: "Programming", q: "Programming", color: "bg-purple-900", icon: "💻" },
                  { name: "Wikipedia ID", q: "Wikipedia", color: "bg-indigo-500", icon: "📚" },
                  { name: "AI Studio", q: "Artificial Intelligence", color: "bg-violet-600", icon: "✨" }
                ].map((dial) => (
                  <button
                    key={dial.name}
                    onClick={() => {
                      setSearchQuery(dial.q);
                      performSearch(dial.q);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 cursor-default transition-all duration-150 hover:scale-[1.03] ${
                      isDark 
                        ? "bg-zinc-900/30 border-white/5 hover:bg-zinc-900/60" 
                        : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-md text-white shadow ${dial.color}`}>
                      {dial.icon}
                    </div>
                    <span className="text-[9.5px] font-bold truncate w-full px-0.5 leading-none">{dial.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SEARCH RESULTS PAGE */}
        {viewMode === "search" && (
          <div className="p-4 md:p-6 text-left select-text max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Search metadata details */}
            <div className="flex justify-between items-baseline border-b border-white/10 pb-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.resultsFor}</span>
                <h1 className="text-lg font-black text-indigo-400 font-serif leading-none mt-0.5">"{searchQuery}"</h1>
              </div>
              <div className="flex items-center gap-3 select-none">
                {/* Outward Engine Escape Hatch */}
                <button
                  type="button"
                  onClick={openOnExternalEngine}
                  className="flex items-center gap-1 text-[9.5px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md transition font-bold"
                >
                  <span>{t.googleDisclaimer} ({searchEngine === "google" ? "Google" : searchEngine === "duckduckgo" ? "DuckDuckGo" : "Wiki"})</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
                <span className="text-[9.5px] font-mono text-slate-500">
                  {isLoading ? t.searchingApi : `${t.foundAround} ${searchResults.length || 5}`}
                </span>
              </div>
            </div>

            {/* Custom result filters menu tab */}
            <div className="flex gap-4 text-xs font-bold text-slate-400 border-b border-light select-none pb-0.5">
              <button onClick={() => setActiveTab("all")} className={`pb-1 px-1 border-b-2 cursor-default ${activeTab === "all" ? "border-indigo-500 text-indigo-400" : "border-transparent"}`}>{t.all}</button>
              <button onClick={() => setActiveTab("news")} className={`pb-1 px-1 border-b-2 cursor-default ${activeTab === "news" ? "border-indigo-500 text-indigo-400" : "border-transparent"}`}>{t.news}</button>
              <button onClick={() => setActiveTab("images")} className={`pb-1 px-1 border-b-2 cursor-default ${activeTab === "images" ? "border-indigo-500 text-indigo-400" : "border-transparent"}`}>{t.images}</button>
              <button onClick={() => setActiveTab("maps")} className={`pb-1 px-1 border-b-2 cursor-default ${activeTab === "maps" ? "border-indigo-500 text-indigo-400" : "border-transparent"}`}>{t.maps}</button>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2.5">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-xs text-slate-500 font-bold font-mono tracking-wider">{lang === "id" ? "Menghubungkan ke API Layanan Terdistribusi..." : "Connecting to system distributed API indexes..."}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. LEFT CONTAINER: SEARCH CARDS LISTS */}
                <div className="md:col-span-2 space-y-5">
                  
                  {/* --- GOOGLE-STYLE AI OVERVIEW CARD --- */}
                  {matchedSmart && activeTab === "all" && (
                    <div className={`p-4 rounded-xl border border-indigo-500/20 shadow-lg relative overflow-hidden animate-slide-in ${
                      isDark ? "bg-gradient-to-br from-indigo-950/20 to-purple-950/10" : "bg-gradient-to-br from-indigo-50/70 to-purple-50/50 shadow-indigo-100"
                    }`}>
                      <div className="absolute top-0 right-0 p-1 bg-indigo-600/10 text-indigo-400 text-[8px] font-bold rounded-bl-lg flex items-center gap-1 uppercase tracking-widest px-2.5 py-1">
                        <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> AI Overview
                      </div>

                      <div className="flex gap-1.5 items-center mb-2.5">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-black text-indigo-500 font-sans tracking-wide">{lang === "id" ? "Ringkasan Pintar AI" : "AI Smart Summary"}</span>
                      </div>

                      <h3 className="text-sm font-extrabold text-indigo-400 leading-snug">{matchedSmart.title}</h3>
                      <p className="text-[11px] leading-relaxed mt-1.5 opacity-90">{matchedSmart.summary}</p>
                      
                      <div className="h-[1px] bg-indigo-500/15 my-3" />
                      
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-black text-indigo-500 uppercase tracking-widest block leading-none">{lang === "id" ? "Fakta Utama" : "Key Facts"}</span>
                        <div className="grid grid-cols-1 gap-1 pt-1">
                          {matchedSmart.facts.map((fact, index) => (
                            <div key={index} className="flex gap-1.5 items-start text-[10.5px]">
                              <span className="text-indigo-500">✦</span>
                              <span className="opacity-80 font-medium">{fact}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback AI summary for unmatched terms */}
                  {!matchedSmart && activeTab === "all" && (
                    <div className={`p-3.5 rounded-xl border relative ${
                      isDark ? "bg-zinc-900/30 border-white/5" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="flex gap-1.5 items-center mb-2 text-indigo-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold leading-none">{lang === "id" ? "Asisten AI Pencarian" : "Search AI Assistant"}</span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-slate-400">
                        {lang === "id" ? (
                          <>Topik pencarian untuk <strong>"{searchQuery}"</strong> didukung oleh rekam indeks global. Di bawah ini adalah referensi artikel terverifikasi dan detail informatif web sandbox.</>
                        ) : (
                          <>Search query for <strong>"{searchQuery}"</strong> is mapped to active global indexes. Below are verified articles, reference entries, and dynamic details.</>
                        )}
                      </p>
                    </div>
                  )}

                  {/* --- ORGANIC REAL RESULTS (Wikipedia query results) --- */}
                  <div className="space-y-4">
                    {searchResults.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                        <span className="text-2xl">🔍</span>
                        <span className="text-[11.5px] font-bold">{t.noResults}</span>
                        <span className="text-[10px] text-slate-400">{t.noResultsDesc}</span>
                      </div>
                    ) : (
                      searchResults.map((res) => {
                        // Dynamically mock domain names to look like actual organic web results for google and duckduckgo!
                        const host = searchEngine === "google" 
                          ? ["github.com", "dev.to", "medium.com", "wikipedia.org", "codepen.io"][res.pageid % 5]
                          : searchEngine === "duckduckgo"
                            ? ["techcrunch.com", "stackoverflow.com", "reddit.com", "wikipedia.org"][res.pageid % 4]
                            : `${wikiLang}.wikipedia.org`;

                        return (
                          <div 
                            key={res.pageid}
                            className={`p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 text-left flex flex-col ${
                              isDark 
                                ? "bg-zinc-950/40 border-white/5 hover:bg-zinc-950/80 hover:border-indigo-500/30 shadow-md" 
                                : "bg-white border-slate-200 shadow hover:shadow-md hover:border-indigo-400/50"
                            }`}
                          >
                            {/* Breadcrumb path wrapper with dynamic engine support */}
                            <div className="flex items-center gap-1.5 text-[9.5px] text-emerald-500 font-medium font-mono leading-none truncate col-span-2 select-none">
                              <span>https://{host}</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                              <span>{searchEngine === "wikipedia" ? "wiki" : "search"}</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[150px]">{res.title.toLowerCase().replace(/\s+/g, '-')}</span>
                            </div>

                            <button
                              onClick={() => handleResultClick(res.title)}
                              className="text-sm font-extrabold text-blue-500 hover:text-indigo-500 hover:underline leading-tight mt-1.5 text-left cursor-default flex items-center gap-1"
                            >
                              <span>{res.title}</span>
                              <ExternalLink className="w-3 h-3 opacity-50" />
                            </button>

                            <p 
                              className="text-[10.5px] leading-relaxed text-slate-400 mt-1.5 opacity-90"
                              dangerouslySetInnerHTML={{ __html: res.snippet + "..." }}
                            />

                            <div className="flex gap-2.5 mt-2.5 pt-2 border-t border-white/5 justify-between items-center text-[9.5px] font-bold select-none">
                              <span className="text-slate-500 text-[8.5px] font-mono leading-none uppercase">
                                {searchEngine === "google" ? "GOOGLE ORGANIC RESULT" : searchEngine === "duckduckgo" ? "DUCKDUCKGO INDEX" : t.wikipediaLabel}
                              </span>
                              <button
                                onClick={() => handleResultClick(res.title)}
                                className="text-indigo-400 hover:text-indigo-300 leading-none"
                              >
                                {searchEngine === "wikipedia" ? t.readMore : t.externalLabel} &gt;
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* 2. RIGHT CONTAINER: QUICK FACTS SIDEBAR */}
                <div className="space-y-4">
                  {/* People Also Ask card */}
                  <div className={`p-4 rounded-xl border text-left ${
                    isDark ? "bg-zinc-900/40 border-white/5" : "bg-white border-slate-200 shadow"
                  }`}>
                    <span className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-light pb-1.5 mb-2.5 leading-none">{t.peopleAlsoAsk}</span>
                    <div className="space-y-2.5 text-[10.5px]">
                      {lang === "id" ? [
                        `Apa sejarah dan asal usul "${searchQuery}"?`,
                        `Bagaimana panduan lengkap mengenai "${searchQuery}"?`,
                        `Kenapa "${searchQuery}" sangat terkenal di Indonesia?`
                      ].map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(searchQuery);
                            performSearch(searchQuery);
                          }}
                          className="w-full text-left font-bold text-indigo-400 hover:underline flex gap-1 items-start leading-snug cursor-default text-[10px]"
                        >
                          <span className="text-[9px]">❓</span>
                          <span>{q}</span>
                        </button>
                      )) : [
                        `What is the true origin of "${searchQuery}"?`,
                        `How to read a comprehensive guide on "${searchQuery}"?`,
                        `Why is "${searchQuery}" trending globally?`
                      ].map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(searchQuery);
                            performSearch(searchQuery);
                          }}
                          className="w-full text-left font-bold text-indigo-400 hover:underline flex gap-1 items-start leading-snug cursor-default text-[10px]"
                        >
                          <span className="text-[9px]">❓</span>
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Browser Developer disclaimer sandbox info */}
                  <div className={`p-4 rounded-xl border text-left flex flex-col gap-2 ${
                    isDark ? "bg-indigo-950/10 border-indigo-500/10" : "bg-sky-50 border-sky-100"
                  }`}>
                    <div className="flex gap-1.5 items-center text-slate-400">
                      <HelpCircle className="w-4 h-4 text-indigo-500" />
                      <span className="text-[10.5px] font-extrabold leading-none text-indigo-500">{t.browserFacility}</span>
                    </div>
                    <p className="text-[9.5px] leading-relaxed text-slate-450 font-medium">
                      {t.browserDesc}
                    </p>
                    <button
                      onClick={goHome}
                      className="w-full mt-1.5 py-1 text-[9.5px] font-bold rounded-md bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-center transition cursor-default"
                    >
                      {t.backToHome}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LIVE IFRAME STAGE */}
        {viewMode === "iframe" && (
          <div className="w-full h-full relative">
            <iframe
              src={iframeUrl}
              onError={() => alert("Perhatian: Website yang dituju memblokir embedding frame (CORS). Anda dapat menggunakan menu di pojok kiri atas untuk kembali.")}
              className="w-full h-full border-none select-text bg-white"
              title="Edge Web Sandbox Framework"
              referrerPolicy="no-referrer"
            />

            {/* Float control overlay at bottom */}
            <div className={`absolute bottom-3 left-3 flex items-center justify-between gap-4 p-2 px-3 rounded-lg text-[9.5px] font-bold shadow-xl border select-none max-w-sm ${
              isDark 
                ? "bg-zinc-950/95 text-slate-100 border-white/10 shadow-black/80 animate-fade-in" 
                : "bg-white text-slate-900 border-neutral-300 shadow-neutral-400/40 animate-fade-in"
            }`}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="max-w-[200px] truncate">Halaman aktif: {iframeUrl}</span>
              </div>
              <a 
                href={iframeUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="p-1 px-2.5 rounded bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 hover:scale-[1.03] transition flex items-center gap-0.5 shadow-md active:scale-95 whitespace-nowrap"
              >
                New Tab <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function BrowserIcon() {
  return <span className="text-[15px]">🌐</span>;
}
