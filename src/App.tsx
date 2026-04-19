/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Settings, 
  Trash2, 
  Send, 
  Plus, 
  Calendar, 
  Clock, 
  X,
  Mic,
  MicOff,
  Sun,
  Moon,
  Sparkles,
  Activity,
  Search,
  FileText,
  Download,
  Upload,
  LayoutList,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  Shield,
  Database,
  Share2,
  QrCode,
  Palette
} from "lucide-react";
import { useState, useEffect, useMemo, ChangeEvent } from "react";
import QRCode from "react-qr-code";
import { Doctor, HealthEntry, AppSettings } from "./types";

// Speech Recognition Type (for TS)
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const INITIAL_DOCTORS: Doctor[] = [
  { id: 1, name: "Zubař", icon: "🦷", color: "#B197FC" },
  { id: 2, name: "Oční", icon: "👁️", color: "#74C0FC" },
  { id: 3, name: "Obvodní", icon: "🏥", color: "#63E6BE" },
  { id: 4, name: "Kardio", icon: "❤️", color: "#FF8787" },
  { id: 5, name: "Neuro", icon: "🧠", color: "#DA77F2" },
  { id: 6, name: "Laboratoř", icon: "🧪", color: "#94D82D" },
  { id: 7, name: "ORL", icon: "👂", color: "#FFD43B" },
  { id: 8, name: "Chirurgie", icon: "🩹", color: "#FF922B" },
  { id: 9, name: "Dětský", icon: "🧸", color: "#FCC419" },
  { id: 10, name: "Gynekologie", icon: "🤰", color: "#FAA2C1" },
  { id: 11, name: "Dermatologie", icon: "🧴", color: "#FFD8A8" },
  { id: 12, name: "Rehabilitace", icon: "🧘", color: "#82C91E" },
];

export default function App() {
  // --- STATE ---
  const [entries, setEntries] = useState<HealthEntry[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ names: ["Pacient 1", "Pacient 2"] });
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<"patients" | "doctors" | "appearance" | "data">("patients");
  const [editingDoctors, setEditingDoctors] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Theme & Style State
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accentColor, setAccentColor] = useState("#B197FC");
  const [styleMode, setStyleMode] = useState<"elegant" | "neu">("elegant");
  
  // New States for Search, Filters, and View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [activePatientFilter, setActivePatientFilter] = useState<string>("Všichni");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Modal and Confirmation State
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ show: false, title: "", message: "", action: () => {} });

  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  const showNotify = (msg: string, type: "success" | "error" = "success") => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // Form State
  const [form, setForm] = useState({
    person: "",
    date: new Date().toISOString().split("T")[0],
    time: "08:00",
    doctor: "",
    note: "",
    color: "#B197FC"
  });

  // Settings Form State
  const [newDoc, setNewDoc] = useState({ name: "", icon: "🏥", color: "#B197FC" });
  const [pNames, setPNames] = useState<[string, string]>(["Pacient 1", "Pacient 2"]);

  // --- INITIAL LOAD ---
  useEffect(() => {
    // Check for URL-based import
    const params = new URLSearchParams(window.location.search);
    const importDataStr = params.get("import");
    
    if (importDataStr) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(importDataStr)));
        setConfirmDialog({
          show: true,
          title: "Import dat",
          message: `Chcete importovat data pro pacienta ${decoded.person}? Stávající data budou přemazána.`,
          action: () => {
            if (decoded.entries) setEntries(decoded.entries);
            if (decoded.doctors) setDoctors(decoded.doctors);
            window.history.replaceState({}, document.title, window.location.pathname);
            setConfirmDialog(p => ({ ...p, show: false }));
            showNotify("Data úspěšně importována");
          }
        });
      } catch (e) {
        console.error("Chyba při importu:", e);
      }
    }

    const savedEntries = localStorage.getItem("health_entries");
    const savedDocs = localStorage.getItem("docs_data");
    const savedSettings = localStorage.getItem("app_names");
    const savedTheme = localStorage.getItem("theme_mode") as "dark" | "light";
    const savedStyle = localStorage.getItem("style_mode") as "elegant" | "neu";
    const savedAccent = localStorage.getItem("accent_color");

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedDocs) {
      setDoctors(JSON.parse(savedDocs));
    } else {
      setDoctors(INITIAL_DOCTORS);
      localStorage.setItem("docs_data", JSON.stringify(INITIAL_DOCTORS));
    }
    
    if (savedSettings) {
      const names = JSON.parse(savedSettings);
      setSettings({ names });
      setPNames(names);
      setForm(f => ({ ...f, person: names[0] }));
    } else {
      setForm(f => ({ ...f, person: "Pacient 1" }));
    }
    
    if (savedTheme) setTheme(savedTheme);
    if (savedStyle) setStyleMode(savedStyle);
    if (savedAccent) setAccentColor(savedAccent);
  }, []);

  // --- THEME SYNC ---
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme_mode", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
    localStorage.setItem("accent_color", accentColor);
  }, [accentColor]);

  useEffect(() => {
    document.body.setAttribute("data-style", styleMode);
    localStorage.setItem("style_mode", styleMode);
  }, [styleMode]);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("health_entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("docs_data", JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem("app_names", JSON.stringify(settings.names));
  }, [settings]);

  // --- NOTIFICATIONS ---
  useEffect(() => {
    const checkUpcoming = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      
      const now = new Date();
      let changed = false;
      const updatedEntries = entries.map(e => {
        const entryTime = new Date(`${e.date}T${e.time}`);
        const notifyTime = new Date(entryTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
        
        // Trigger if we are 24h or less before/at the event, but haven't notified yet
        if (now >= notifyTime && now < new Date(entryTime.getTime() + 3600000) && !e.notified) {
          const isToday = now.toISOString().split('T')[0] === e.date;
          const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] === e.date;
          
          let title = `Termín: ${e.doctor}`;
          if (isToday) title = `DNES: ${e.doctor}`;
          else if (isTomorrow) title = `ZÍTRA: ${e.doctor}`;

          new Notification(title, { 
            body: `V ${e.time} (${e.person}). Nezapomeňte!`,
            icon: "/favicon.ico"
          });
          changed = true;
          return { ...e, notified: true };
        }
        return e;
      });

      if (changed) setEntries(updatedEntries);
    };

    const interval = setInterval(checkUpcoming, 30000);
    return () => clearInterval(interval);
  }, [entries]);

  const requestNotif = () => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(p => {
      if (p === "granted") showNotify("Notifikace povoleny!");
    });
  };

  // --- HANDLERS ---
  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");
  const toggleStyle = () => setStyleMode(prev => prev === "elegant" ? "neu" : "elegant");

  const saveEntry = () => {
    if (!form.doctor || !form.date || !form.time || !form.person) {
      showNotify("Doplňte povinné údaje", "error");
      return;
    }

    const newEntry: HealthEntry = {
      id: Date.now(),
      ...form,
      notified: false
    };

    setEntries(prev => [...prev, newEntry]);
    setForm(f => ({ ...f, doctor: "", note: "" }));
  };

  const deleteEntry = (id: number) => {
    setConfirmDialog({
      show: true,
      title: "Smazat záznam",
      message: "Opravdu chcete tento záznam z deníku trvale odstranit?",
      action: () => {
        setEntries(prev => prev.filter(e => e.id !== id));
        setConfirmDialog(p => ({ ...p, show: false }));
        showNotify("Záznam byl smazán");
      }
    });
  };

  const sendWhatsApp = (entry: HealthEntry) => {
    const text = `Termín: ${entry.doctor} (${entry.person}) dne ${new Date(entry.date).toLocaleDateString("cs-CZ")} v ${entry.time}. Poznámka: ${entry.note}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const addDoctor = () => {
    if (!newDoc.name.trim()) return;
    const doc: Doctor = {
      id: Date.now(),
      name: newDoc.name.trim(),
      icon: newDoc.icon,
      color: newDoc.color
    };
    setDoctors(prev => [...prev, doc]);
    setNewDoc({ name: "", icon: "🏥", color: "#F27D26" });
  };

  const deleteDoctor = (id: number) => {
    setConfirmDialog({
      show: true,
      title: "Smazat lékaře",
      message: "Chcete tohoto specialistu odstranit ze seznamu?",
      action: () => {
        setDoctors(prev => prev.filter(d => d.id !== id));
        setConfirmDialog(p => ({ ...p, show: false }));
        showNotify("Lékař byl odebrán");
      }
    });
  };

  const updateNames = () => {
    const oldNames = settings.names;
    setEntries(prev => prev.map(e => {
      if (e.person === oldNames[0]) return { ...e, person: pNames[0] };
      if (e.person === oldNames[1]) return { ...e, person: pNames[1] };
      return e;
    }));
    setSettings({ names: pNames });
    setForm(f => ({ ...f, person: pNames[0] }));
    showNotify("Jména uložena");
  };

  const clearAllData = () => {
    setConfirmDialog({
      show: true,
      title: "TVRDÝ RESET",
      message: "POZOR: Tato akce smaže veškerá vaše data, historii i nastavení. Nelze vrátit zpět!",
      action: () => {
        localStorage.removeItem("health_entries");
        localStorage.removeItem("docs_data");
        localStorage.removeItem("app_names");
        localStorage.removeItem("theme_mode");
        localStorage.removeItem("style_mode");
        window.location.reload();
      }
    });
  };

  // --- NEW FEATURES ---
  const exportReport = () => {
    if (filteredAndSortedEntries.length === 0) {
      showNotify("Žádná data k exportu", "error");
      return;
    }
    
    let report = `ZDRAVÍ PRO - EXPORT DAT\n========================\nDatum exportu: ${new Date().toLocaleString('cs-CZ')}\nPacient: ${activePatientFilter}\n\n`;
    
    filteredAndSortedEntries.forEach(e => {
      report += `[${new Date(e.date).toLocaleDateString('cs-CZ')} ${e.time}]\n`;
      report += `Lékař: ${e.doctor}\n`;
      report += `Pacient: ${e.person}\n`;
      if (e.note) report += `Poznámka: ${e.note}\n`;
      report += `------------------------\n`;
    });

    const element = document.createElement("a");
    const file = new Blob([report], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `ZDRAVI_PRO_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const exportData = () => {
    const data = {
      entries,
      doctors,
      settings,
      theme,
      styleMode
    };
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(data)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `ZDRAVI_PRO_Zaloha_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
  };

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.entries) setEntries(data.entries);
        if (data.doctors) setDoctors(data.doctors);
        if (data.settings) setSettings(data.settings);
        showNotify("Záloha nahrána");
      } catch (err) {
        showNotify("Soubor je poškozený", "error");
      }
    };
    reader.readAsText(file);
  };

  const restoreDefaultDoctors = () => {
    setConfirmDialog({
      show: true,
      title: "Obnovit výchozí",
      message: "Vrátit seznam lékařů do původního stavu? Vaše změny budou ztraceny.",
      action: () => {
        setDoctors(INITIAL_DOCTORS);
        setConfirmDialog(p => ({ ...p, show: false }));
        showNotify("Seznam obnoven");
      }
    });
  };

  const getSyncUrl = () => {
    const payload = btoa(encodeURIComponent(JSON.stringify({
      entries,
      doctors,
      person: activePatientFilter === "Všichni" ? settings.names[0] : activePatientFilter
    })));
    return `${window.location.origin}${window.location.pathname}?import=${encodeURIComponent(payload)}`;
  };

  const shareSyncWhatsApp = () => {
    const url = getSyncUrl();
    const text = `Ahoj, posílám ti aktuální data ze Zdraví PRO. Klikni na odkaz pro nahrání: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotify("Hlas není podporován", "error");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'cs-CZ';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setForm(f => ({ ...f, note: f.note ? `${f.note} ${transcript}` : transcript }));
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // --- DERIVED DATA ---
  const filteredAndSortedEntries = useMemo(() => {
    return [...entries]
      .filter(e => {
        const matchesPatient = activePatientFilter === "Všichni" || e.person === activePatientFilter;
        const matchesSearch = e.doctor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             e.note.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesPatient && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.time}`).getTime();
        const timeB = new Date(`${b.date}T${b.time}`).getTime();
        return timeA - timeB;
      });
  }, [entries, searchQuery, activePatientFilter]);

  const upcomingEntries = useMemo(() => {
    return filteredAndSortedEntries.filter(e => new Date(`${e.date}T${e.time}`) >= new Date());
  }, [filteredAndSortedEntries]);

  const stats = useMemo(() => {
    const now = new Date();
    const future = entries.filter(e => new Date(`${e.date}T${e.time}`) >= now);
    const past = entries.filter(e => new Date(`${e.date}T${e.time}`) < now);
    
    let nextTermStr = "Není naplánován";
    if (future.length > 0) {
      const nextDate = new Date(`${future[0].date}T${future[0].time}`);
      const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      nextTermStr = diffDays === 1 ? "zítra" : diffDays === 0 ? "dnes" : `za ${diffDays} dní`;
    }

    return {
      planned: future.length,
      done: past.length,
      next: nextTermStr
    };
  }, [entries]);

  // --- RENDER ---
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--ink-primary)]">
      {/* Success Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-4 left-1/2 z-[100] px-6 py-3 rounded-2xl bg-[var(--surface)] border border-[var(--accent)]/30 shadow-2xl flex items-center gap-3 backdrop-blur-xl"
          >
            <Sparkles size={16} className="text-[var(--accent)]" />
            <span className="text-[12px] font-bold uppercase tracking-widest">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmDialog.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border-color)] rounded-[2.5rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-[14px] font-black uppercase tracking-widest mb-3">{confirmDialog.title}</h3>
              <p className="text-[13px] text-[var(--ink-secondary)] mb-8 leading-relaxed italic">
                {confirmDialog.message}
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDialog.action}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[2px] hover:bg-red-600 transition-all shadow-lg"
                >
                  Ano, provést akci
                </button>
                <button 
                  onClick={() => setConfirmDialog(p => ({ ...p, show: false }))}
                  className="w-full py-4 bg-[var(--surface-alt)] text-[var(--ink-secondary)] rounded-2xl text-[11px] font-black uppercase tracking-[2px] border border-[var(--border-color)] hover:bg-[var(--surface)] transition-all"
                >
                  Zrušit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* HEADER */}
      <header className="h-[70px] bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(177,151,252,0.3)]">
            <Activity size={20} className="text-[var(--bg)]" strokeWidth={3} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[16px] lg:text-[18px] font-black tracking-tighter uppercase text-[var(--ink-primary)]">
              Zdraví
            </span>
            <span className="text-[10px] font-bold tracking-[3px] uppercase text-[var(--accent)] opacity-80">
              PRO Edition
            </span>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 lg:gap-3 mx-4 overflow-x-auto no-scrollbar">
          {settings.names.map(name => (
            <button
              key={name}
              onClick={() => setForm(f => ({ ...f, person: name }))}
              className={`px-3 lg:px-4 py-1.5 rounded-full text-[11px] lg:text-[13px] border border-[var(--border)] whitespace-nowrap transition-all ${
                form.person === name 
                  ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)] font-semibold" 
                  : "hover:bg-[var(--surface-alt)]"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 lg:gap-4">
          <button 
            onClick={toggleStyle} 
            className={`transition-all ${styleMode === 'neu' ? 'text-[var(--accent)] scale-110' : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'}`}
            title="Přepnout styl (Elegantní / Neumorfní)"
          >
            <Sparkles size={18} className="lg:w-5 lg:h-5" />
          </button>
          <button 
            onClick={toggleTheme} 
            className="text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
            title="Přepnout režim (Tmavý / Světlý)"
          >
            {theme === "dark" ? <Sun size={18} className="lg:w-5 lg:h-5" /> : <Moon size={18} className="lg:w-5 lg:h-5" />}
          </button>
          <button onClick={requestNotif} className="text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]">
            <Bell size={18} className="lg:w-5 lg:h-5" />
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`transition-colors ${showSettings ? 'text-[var(--accent)]' : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'}`}
          >
            <Settings size={18} className="lg:w-5 lg:h-5" />
          </button>
        </div>
      </header>

      {/* MOBILE ONLY USER TABS */}
      <div className="sm:hidden flex bg-[var(--surface)] border-b border-[var(--border)] px-4 py-2 gap-2 overflow-x-auto no-scrollbar">
        {settings.names.map(name => (
          <button
            key={name}
            onClick={() => setForm(f => ({ ...f, person: name }))}
            className={`px-4 py-1.5 rounded-full text-[12px] border border-[var(--border)] whitespace-nowrap transition-all ${
              form.person === name 
                ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)] font-semibold" 
                : "bg-[var(--bg)] text-[var(--ink-secondary)]"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-[280px_1fr_340px] gap-px bg-[var(--border)]">
        
        {/* LEFT COLUMN: CATEGORIES & FILTER */}
        <section className="bg-[var(--bg)] p-6 lg:p-8 flex flex-col gap-6">
          <div className="space-y-4">
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--ink-secondary)]">
              Vybrat Pacienta
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Všichni", ...settings.names].map(name => (
                <button
                  key={name}
                  onClick={() => setActivePatientFilter(name)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                    activePatientFilter === name 
                      ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)]" 
                      : "border-[var(--border-color)] text-[var(--ink-secondary)] hover:border-[var(--ink-primary)]"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-[var(--border-color)]">
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--ink-secondary)]">
              Specialisté
            </h3>
            <button 
              onClick={() => setEditingDoctors(!editingDoctors)}
              className={`text-[10px] font-bold uppercase transition-colors ${editingDoctors ? 'text-red-500' : 'text-[var(--accent)]'}`}
            >
              {editingDoctors ? 'Hotovo' : 'Upravit'}
            </button>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 lg:gap-3">
            {doctors.map(doc => (
              <motion.div
                layout
                key={doc.id}
                onClick={() => setForm(f => ({ ...f, doctor: doc.name, color: doc.color }))}
                className={`relative panel-card p-3 lg:p-4 text-center cursor-pointer transition-all ${
                  form.doctor === doc.name ? 'border-[var(--accent)] bg-[var(--surface-alt)]' : 'hover:border-[var(--ink-secondary)]'
                }`}
              >
                <div className="text-xl lg:text-2xl mb-1 lg:mb-2">{doc.icon}</div>
                <div className="text-[10px] lg:text-[12px] font-medium truncate px-1">{doc.name}</div>
                
                <AnimatePresence>
                  {editingDoctors && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      onClick={(e) => { e.stopPropagation(); deleteDoctor(doc.id); }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <X size={10} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-4 lg:mt-auto pt-6 border-t border-[var(--border)]">
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--ink-secondary)] mb-4">
              Měsíční přehled
            </h3>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 lg:gap-3">
              <div className="flex flex-col lg:flex-row lg:justify-between text-[11px] lg:text-[12px]">
                <span className="opacity-60 mb-1 lg:mb-0">Plánované</span>
                <span className="font-bold">{stats.planned}</span>
              </div>
              <div className="flex flex-col lg:flex-row lg:justify-between text-[11px] lg:text-[12px]">
                <span className="opacity-60 mb-1 lg:mb-0">Dokončeno</span>
                <span className="font-bold">{stats.done}</span>
              </div>
              <div className="flex flex-col lg:flex-row lg:justify-between text-[11px] lg:text-[12px]">
                <span className="opacity-60 mb-1 lg:mb-0">Příští</span>
                <span className="text-[var(--accent)] font-bold">{stats.next}</span>
              </div>
            </div>
          </div>
        </section>

        {/* CENTER COLUMN: FORM & SEARCH */}
        <section className="bg-[var(--surface-alt)] p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--ink-secondary)]">
              Nový Záznam
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-secondary)]" />
                <input 
                  type="text" 
                  placeholder="Hledat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[var(--surface)] text-[12px] pl-9 pr-4 py-1.5 rounded-full border border-[var(--border-color)] outline-none focus:border-[var(--accent)] transition-all w-[150px]"
                />
              </div>
              <button 
                onClick={exportReport}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface)] border border-[var(--border-color)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all"
                title="Exportovat report"
              >
                <FileText size={16} />
              </button>
            </div>
          </div>
          
          <div className="panel-card bg-[var(--surface)] p-6 lg:p-8 border-[var(--border)] max-w-2xl mx-auto shadow-2xl mb-12">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] lg:text-[11px] text-[var(--ink-secondary)] uppercase mb-2 tracking-wider">
                  Pacient
                </label>
                <div className="flex gap-2">
                  {settings.names.map(name => (
                    <button
                      key={name}
                      onClick={() => setForm(f => ({ ...f, person: name }))}
                      className={`flex-1 py-2 rounded-xl text-[12px] font-bold border transition-all ${
                        form.person === name 
                          ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]" 
                          : "border-[var(--border-color)] text-[var(--ink-secondary)]"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] lg:text-[11px] text-[var(--ink-secondary)] uppercase mb-2 tracking-wider">
                  Lékař / Ambulance
                </label>
                <input 
                  type="text" 
                  placeholder="Např. Fakultní Nemocnice - Chirurgie"
                  value={form.doctor}
                  onChange={(e) => setForm(f => ({ ...f, doctor: e.target.value }))}
                  className="input-field w-full px-4 py-3 text-[14px] lg:text-[15px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 lg:gap-5">
                <div>
                  <label className="block text-[10px] lg:text-[11px] text-[var(--ink-secondary)] uppercase mb-2 tracking-wider">
                    Datum
                  </label>
                  <input 
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                    className="input-field w-full px-4 py-3 text-[14px] lg:text-[15px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] lg:text-[11px] text-[var(--ink-secondary)] uppercase mb-2 tracking-wider">
                    Čas
                  </label>
                  <input 
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
                    className="input-field w-full px-4 py-3 text-[14px] lg:text-[15px]"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-[10px] lg:text-[11px] text-[var(--ink-secondary)] uppercase mb-2 tracking-wider flex justify-between items-center">
                  Poznámky a doporučení
                  <button 
                    onClick={startListening}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${
                      isListening ? 'text-red-500 bg-red-500/10' : 'text-[var(--accent)] hover:bg-[var(--accent)]/10'
                    }`}
                    title="Hlasové zadávání"
                  >
                    {isListening ? (
                      <>
                        <MicOff size={10} className="animate-pulse" />
                        <span className="text-[9px] font-bold">Nahrávám...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={10} />
                        <span className="text-[9px] font-bold">Diktovat</span>
                      </>
                    )}
                  </button>
                </label>
                <textarea 
                  rows={3}
                  placeholder="Nalačno, vzít si sebou rentgen..."
                  value={form.note}
                  onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))}
                  className="input-field w-full px-4 py-3 text-[14px] lg:text-[15px] resize-none"
                />
              </div>

              <button 
                onClick={saveEntry}
                className="btn-primary w-full py-4 text-[12px] lg:text-[13px] tracking-[2px]"
              >
                Uložit do deníku
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowSettings(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="panel-card bg-[var(--surface)] w-full max-w-2xl overflow-hidden shadow-2xl border border-[var(--border-color)]"
                >
                  {/* Modal Header */}
                  <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                        <Settings size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-[15px] uppercase tracking-wider">Nastavení Aplikace</h4>
                        <p className="text-[10px] text-[var(--ink-secondary)] uppercase tracking-widest">Konfigurace Edice PRO</p>
                      </div>
                    </div>
                    <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-full hover:bg-[var(--surface-alt)] flex items-center justify-center transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex h-[450px]">
                    {/* Sidebar Tabs */}
                    <div className="w-48 border-r border-[var(--border-color)] bg-[var(--bg)]/30 p-4 flex flex-col gap-2">
                      <button
                        onClick={() => setActiveSettingsTab("patients")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase transition-all ${
                          activeSettingsTab === "patients" ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)]"
                        }`}
                      >
                        <Users size={16} /> Pacienti
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab("doctors")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase transition-all ${
                          activeSettingsTab === "doctors" ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)]"
                        }`}
                      >
                        <UserPlus size={16} /> Specialisté
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab("appearance")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase transition-all ${
                          activeSettingsTab === "appearance" ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)]"
                        }`}
                      >
                        <Palette size={16} /> Vzhled
                      </button>
                      <button
                        onClick={() => setActiveSettingsTab("data")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase transition-all ${
                          activeSettingsTab === "data" ? "bg-[var(--accent)] text-[var(--bg)]" : "text-[var(--ink-secondary)] hover:bg-[var(--surface-alt)]"
                        }`}
                      >
                        <Database size={16} /> Data & Záloha
                      </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto bg-[var(--surface)]">
                      {activeSettingsTab === "patients" && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                          <div>
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)] mb-4">Správa členů rodiny</h5>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-[var(--ink-secondary)] mb-1.5 ml-1">Jméno prvního pacienta</label>
                                <input 
                                  type="text"
                                  placeholder="Např. Eliška"
                                  value={pNames[0]}
                                  onChange={(e) => setPNames([e.target.value, pNames[1]])}
                                  className="input-field w-full px-4 py-3 text-[13px]"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] uppercase tracking-widest text-[var(--ink-secondary)] mb-1.5 ml-1">Jméno druhého pacienta</label>
                                <input 
                                  type="text"
                                  placeholder="Např. Tomáš"
                                  value={pNames[1]}
                                  onChange={(e) => setPNames([pNames[0], e.target.value])}
                                  className="input-field w-full px-4 py-3 text-[13px]"
                                />
                              </div>
                              <button onClick={updateNames} className="btn-primary w-full py-3.5 text-[11px] mt-2">Uložit jména</button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeSettingsTab === "doctors" && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)]">Vlastní Specialisté</h5>
                            <button 
                              onClick={restoreDefaultDoctors}
                              className="text-[9px] font-bold uppercase text-[var(--ink-secondary)] hover:text-red-500 transition-colors"
                            >
                              Resetovat seznam
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-[1fr_80px_auto] gap-2">
                            <input 
                              type="text"
                              placeholder="Název lékaře"
                              value={newDoc.name}
                              onChange={(e) => setNewDoc(d => ({ ...d, name: e.target.value }))}
                              className="input-field px-4 py-2.5 text-[12px]"
                            />
                            <select 
                              value={newDoc.icon}
                              onChange={(e) => setNewDoc(d => ({ ...d, icon: e.target.value }))}
                              className="input-field px-2 py-2.5 text-lg"
                            >
                              {["🏥", "🦷", "👁️", "💊", "🩺", "🩹", "🧪", "🦴", "🧠", "❤️", "🧸", "🤰", "🧴", "🧘", "🍏", "🦷", "🌡️", "💉", "🧑‍⚕️"].map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                            <button onClick={addDoctor} className="btn-primary px-4 py-2.5"><Plus size={18} /></button>
                          </div>

                          <div className="h-px bg-[var(--border-color)] my-4" />
                          
                          <div className="grid grid-cols-2 gap-2">
                            {doctors.map(doc => (
                              <div key={doc.id} className="flex items-center gap-2 p-2 bg-[var(--surface-alt)] rounded-xl border border-[var(--border-color)] text-[10px]">
                                <span className="text-sm">{doc.icon}</span>
                                <span className="font-bold truncate flex-1">{doc.name}</span>
                                <button onClick={() => deleteDoctor(doc.id)} className="text-red-500 p-1"><X size={12} /></button>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeSettingsTab === "appearance" && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                          <div className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)] mb-4">Motiv Aplikace</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setTheme("dark")}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-[var(--surface-alt)] border-[var(--border-color)] opacity-60'}`}
                              >
                                <Moon size={20} className={theme === 'dark' ? 'text-[var(--accent)]' : ''} />
                                <span className="text-[10px] font-bold uppercase">Tmavý</span>
                              </button>
                              <button 
                                onClick={() => setTheme("light")}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${theme === 'light' ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-[var(--surface-alt)] border-[var(--border-color)] opacity-60'}`}
                              >
                                <Sun size={20} className={theme === 'light' ? 'text-[var(--accent)]' : ''} />
                                <span className="text-[10px] font-bold uppercase">Světlý</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)] mb-4">Akcentová barva</h5>
                            <div className="grid grid-cols-5 gap-3">
                              {["#B197FC", "#74C0FC", "#63E6BE", "#FF8787", "#FCC419"].map(color => (
                                <button
                                  key={color}
                                  onClick={() => setAccentColor(color)}
                                  className="w-full aspect-square rounded-full border-2 border-white/10 flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                                  style={{ backgroundColor: color }}
                                >
                                  {accentColor === color && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)] mb-4">Styl rozhraní</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => setStyleMode("elegant")}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${styleMode === 'elegant' ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-[var(--surface-alt)] border-[var(--border-color)] opacity-60'}`}
                              >
                                <LayoutList size={20} className={styleMode === 'elegant' ? 'text-[var(--accent)]' : ''} />
                                <span className="text-[10px] font-bold uppercase">Elegantní</span>
                              </button>
                              <button 
                                onClick={() => setStyleMode("neu")}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${styleMode === 'neu' ? 'bg-[var(--accent)]/10 border-[var(--accent)]' : 'bg-[var(--surface-alt)] border-[var(--border-color)] opacity-60'}`}
                              >
                                <Grid3X3 size={20} className={styleMode === 'neu' ? 'text-[var(--accent)]' : ''} />
                                <span className="text-[10px] font-bold uppercase">Neumorfní</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {activeSettingsTab === "data" && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                          <div className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)] mb-4">Správa Databáze</h5>
                            <div className="grid grid-cols-1 gap-3">
                              <button 
                                onClick={exportData}
                                className="flex items-center justify-between px-5 py-4 bg-[var(--surface-alt)] border border-[var(--border-color)] rounded-2xl text-[11px] font-bold uppercase hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <Download size={18} className="text-[var(--accent)] group-hover:text-[var(--bg)]" />
                                  <span>Exportovat kompletní zálohu</span>
                                </div>
                                <ChevronRight size={14} />
                              </button>
                              
                              <label className="flex items-center justify-between px-5 py-4 bg-[var(--surface-alt)] border border-[var(--border-color)] rounded-2xl text-[11px] font-bold uppercase cursor-pointer hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all group">
                                <div className="flex items-center gap-3">
                                  <Upload size={18} className="text-[var(--accent)] group-hover:text-[var(--bg)]" />
                                  <span>Importovat data ze souboru</span>
                                </div>
                                <input type="file" accept=".json" onChange={importData} className="hidden" />
                                <ChevronRight size={14} />
                              </label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)] mb-4">Rychlý přenos do jiného tel.</h5>
                            <div className="p-4 bg-[var(--surface-alt)] border border-[var(--border-color)] rounded-2xl space-y-4">
                              <div className="flex flex-col items-center gap-4 py-4">
                                <div className="p-4 bg-white rounded-2xl shadow-inner">
                                  <QRCode value={getSyncUrl()} size={140} />
                                </div>
                                <p className="text-[10px] text-center text-[var(--ink-secondary)] uppercase tracking-widest leading-relaxed">
                                  Namiřte fotoaparát druhého telefonu na tento kód.<br/>
                                  Kód obsahuje historii návštěv a lékaře.
                                </p>
                              </div>
                              <button 
                                onClick={shareSyncWhatsApp}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-[#25d366] text-white rounded-2xl text-[11px] font-bold uppercase hover:bg-[#1ebe57] transition-all"
                              >
                                <Send size={18} /> Poslat odkaz přes WhatsApp
                              </button>
                            </div>
                          </div>

                          <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
                              <Shield size={14} /> Nebezpečná Zóna
                            </h5>
                            <p className="text-[10px] text-[var(--ink-secondary)] mb-4 leading-relaxed uppercase tracking-tighter">
                              Smaže veškerá data o pacientech, lékařích i historii návštěv. Tuto akci nelze vrátit.
                            </p>
                            <button 
                              onClick={clearAllData}
                              className="w-full py-3 text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-[2px] hover:bg-red-500 hover:text-white transition-all"
                            >
                              Tvrdý Reset Aplikace
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT COLUMN: TIMELINE & CALENDAR */}
        <section className="bg-[var(--bg)] p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[11px] uppercase tracking-widest text-[var(--ink-secondary)]">
              {viewMode === 'list' ? 'Deník záznamů' : 'Kalendář'}
            </h3>
            <div className="flex bg-[var(--surface-alt)] p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[var(--accent)] text-[var(--bg)] shadow-lg' : 'text-[var(--ink-secondary)] hover:text-white'}`}
                title="Seznam"
              >
                <LayoutList size={14} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-[var(--accent)] text-[var(--bg)] shadow-lg' : 'text-[var(--ink-secondary)] hover:text-white'}`}
                title="Mřížka"
              >
                <Grid3X3 size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {viewMode === 'list' ? (
              <AnimatePresence mode="popLayout">
                {filteredAndSortedEntries.map((entry, idx) => {
                  const isFuture = new Date(`${entry.date}T${entry.time}`) >= new Date();
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`panel-card p-5 relative group overflow-hidden ${!isFuture ? 'opacity-70 grayscale-[0.3]' : ''}`}
                    >
                    {/* Accent Highlight Bar from the image style */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1.5" 
                      style={{ backgroundColor: entry.color }}
                    />

                    {idx === 0 && (
                      <div className="absolute top-4 right-4 text-[10px] px-2 py-0.5 bg-[var(--accent)] text-[var(--bg)] rounded-full font-bold uppercase tracking-widest leading-none">
                        Nyní
                      </div>
                    )}
                    
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="absolute right-2 bottom-2 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="flex items-start gap-4">
                      <div 
                        className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-xl bg-[var(--surface-alt)]"
                        style={{ color: entry.color }}
                      >
                        {doctors.find(d => d.name === entry.doctor)?.icon || "🏥"}
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-[11px] text-[var(--ink-secondary)] mb-1 uppercase tracking-wider font-semibold">
                          {new Date(entry.date).toLocaleDateString("cs-CZ", { weekday: 'short', day: 'numeric', month: 'short' })} • {entry.time}
                          {!isFuture && <span className="ml-2 text-[8px] border border-[var(--border-color)] px-1 rounded">Minulost</span>}
                        </div>
                        
                        <div className="text-[16px] font-bold mb-1">
                          {entry.doctor}
                        </div>

                        <div className="text-[12px] opacity-60 font-medium mb-3">
                          Pacient: {entry.person}
                        </div>
                        
                        {entry.note && (
                          <div className="text-[13px] text-[var(--ink-secondary)] leading-tight mb-4 bg-[var(--bg)]/30 p-2 rounded-xl border border-[var(--border-color)]">
                            {entry.note}
                          </div>
                        )}

                        <button 
                          onClick={() => sendWhatsApp(entry)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25d366]/10 text-[#25d366] text-[10px] font-bold uppercase hover:bg-[#25d366]/20 transition-colors"
                        >
                          <Send size={12} /> Sdílet přes WhatsApp
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
                {filteredAndSortedEntries.length === 0 && (
                  <div className="text-center py-24 opacity-40 text-[12px] uppercase tracking-[0.2em] flex flex-col items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-[var(--surface-alt)] flex items-center justify-center border border-[var(--border-color)]">
                      <Activity size={32} className="text-[var(--accent)] opacity-50" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="font-black">Deník je prázdný</p>
                      <p className="text-[10px] lowercase italic tracking-normal">naplánujte si první prohlídku</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            ) : (
              <CalendarGrid 
                currentDate={currentCalendarDate} 
                setCurrentDate={setCurrentCalendarDate}
                entries={filteredAndSortedEntries}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// --- AUXILIARY COMPONENTS ---

function CalendarGrid({ currentDate, setCurrentDate, entries }: { 
  currentDate: Date, 
  setCurrentDate: (d: Date) => void,
  entries: HealthEntry[]
}) {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  
  // Adjusted for Czech week (starts on Monday)
  const emptyDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const days: { day: number, type: 'prev' | 'current' | 'next', dateStr: string }[] = [];

  // Prev month days
  for (let i = emptyDays - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const date = new Date(year, month, d - (emptyDays - 1 - i)); // Simplified logic
    const dateObj = new Date(year, month - 1, d);
    days.push({ day: d, type: 'prev', dateStr: dateObj.toISOString().split('T')[0] });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({ day: d, type: 'current', dateStr: date.toISOString().split('T')[0] });
  }

  // Next month days
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    days.push({ day: d, type: 'next', dateStr: date.toISOString().split('T')[0] });
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[14px] font-bold text-[var(--ink-primary)]">
          {currentDate.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="flex gap-1">
          <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-[var(--surface-alt)] rounded-lg transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-2 text-[10px] font-bold uppercase hover:bg-[var(--surface-alt)] rounded-lg transition-colors">
            Dnes
          </button>
          <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-[var(--surface-alt)] rounded-lg transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-[var(--border-color)] border border-[var(--border-color)] rounded-2xl overflow-hidden">
        {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
          <div key={d} className="bg-[var(--surface)] text-center py-2 text-[10px] font-bold text-[var(--ink-secondary)] uppercase">
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          const dayEntries = entries.filter(e => e.date === d.dateStr);
          const isToday = d.dateStr === new Date().toISOString().split('T')[0];
          
          return (
            <div 
              key={i} 
              className={`min-h-[70px] bg-[var(--bg)] p-1.5 flex flex-col gap-1 transition-colors ${
                d.type !== 'current' ? 'opacity-30' : ''
              }`}
            >
              <div className="flex justify-between items-center px-1">
                <span className={`text-[11px] font-medium ${isToday ? 'w-5 h-5 flex items-center justify-center bg-[var(--accent)] text-[var(--bg)] rounded-full' : 'text-[var(--ink-primary)]'}`}>
                  {d.day}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {dayEntries.map(e => (
                  <div 
                    key={e.id}
                    title={`${e.doctor} (${e.person})`}
                    className="text-[8px] px-1 py-0.5 rounded-sm truncate font-bold border-l-2"
                    style={{ backgroundColor: `${e.color}15`, color: e.color, borderColor: e.color }}
                  >
                    {e.time} {e.doctor}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
