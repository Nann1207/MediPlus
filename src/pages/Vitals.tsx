// src/pages/Vitals.tsx
import React, { useState } from "react";
import type { PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  HeartPulse,
  Droplet,
  Droplets,
  Thermometer,
  Weight,
  Percent,
  Moon,
  Sun,
  Flame,
  Pill,
  Syringe,
  Stethoscope,
  Bandage,
  Brain,
  Dna,
  Wind,
  Dumbbell,
  Bed,
  Watch,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Send,
  X 
} from "lucide-react";

/* ---------- CSS-only fade/slide helper ---------- */
type FadeSlideProps = PropsWithChildren<{ show: boolean; className?: string }>;
const FadeSlide: React.FC<FadeSlideProps> = ({ show, className, children }) => (
  <div
    className={[
      "transition-all duration-300 ease-out",
      show ? "opacity-100 translate-y-0 max-h-[2000px]" : "opacity-0 -translate-y-2 max-h-0 overflow-hidden",
      className || "",
    ].join(" ")}
  >
    {children}
  </div>
);

// Inline popup (CSS-animated)
type PopupKind = "submit" | "save";

const FeedbackPopup: React.FC<{
  open: boolean;
  kind: PopupKind;
  message?: string;
  onClose: () => void;
  autoCloseMs?: number;
}> = ({ open, kind, message, onClose, autoCloseMs = 2400 }) => {
  React.useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, autoCloseMs);
    return () => clearTimeout(id);
  }, [open, autoCloseMs, onClose]);

  if (!open) return null;

  const content =
    kind === "submit"
      ? { title: "Submitted", body: message ?? "Your new vital value has been submitted.", Icon: Send, iconClass: "text-primary" }
      : { title: "Saved", body: message ?? "Your health log was saved to Health Overview.", Icon: CheckCircle2, iconClass: "text-green-600" };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn  { 0% { transform: translateY(16px) scale(.98); opacity: 0 }
                            100%{ transform: translateY(0)     scale(1);   opacity: 1 } }
      `}</style>

      <div className="fixed inset-0 z-[70]">
        <div className="absolute inset-0 bg-black/30" style={{ animation: "fadeIn 160ms ease-out" }} onClick={onClose} />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border shadow-xl p-5"
               style={{ animation: "popIn 220ms cubic-bezier(.18,.89,.32,1.28)" }}
               role="alertdialog" aria-modal="true">
            <div className="flex items-start gap-3">
              <content.Icon className={`w-6 h-6 mt-1 ${content.iconClass}`} />
              <div className="flex-1">
                <div className="text-base font-semibold">{content.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{content.body}</p>
              </div>
              <button aria-label="Close" onClick={onClose} className="rounded-md p-1 hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={onClose} className="min-w-[100px]">OK</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


/* ---------- Friendly symptom form options (same as before) ---------- */
const SYMPTOM_FORM = {
  feelingToday: ["Great (no symptoms)", "Good (minor)", "Okay", "Not great", "Unwell"] as const,
  symptoms: [
    "Dizziness / lightheaded",
    "Headache",
    "Blurred vision",
    "Shaky / sweating",
    "Very thirsty / dry mouth",
    "Frequent urination",
    "Shortness of breath",
    "Chest discomfort / pain",
    "Palpitations (fast / irregular)",
    "Swelling (ankles/hands)",
    "Numbness / tingling (feet/hands)",
    "Nausea / abdominal pain",
    "Fatigue / unusual tiredness",
  ] as const,
  impact: ["Not at all", "A bit", "Quite a bit", "A lot"] as const,
  onset: ["Just now (<1h)", "Past few hours", "Since morning", "Since yesterday", "Intermittent today", "Woke me from sleep"] as const,
  triggers: [
    "Missed/late meal",
    "Heavy/high-carb meal",
    "High-salt meal",
    "Stress / anxiety",
    "Dehydration",
    "Exercise / exertion",
    "Poor sleep",
    "Illness / infection",
    "New / missed medication",
  ] as const,
};

/* ---------- Built-in vitals ---------- */
type VitalKey =
  | "Blood pressure"
  | "Heart rate"
  | "Blood Sugar"
  | "SpO2"
  | "Sleep"
  | "Temperature"
  | "Weight";

type VitalState = {
  bp: { sys: number; dia: number; unit: "mmHg" };
  hr: { value: number; unit: "BPM" };
  sugar: { value: number | null; unit: "mg/dL" };
  spo2: { value: number; unit: "%" };
  sleep: { value: number; unit: "Hours" };
  temp: { value: number; unit: "°C" };
  weight: { value: number | null; unit: "kg" };
};

const initialVitals: VitalState = {
  bp: { sys: 110, dia: 78, unit: "mmHg" },
  hr: { value: 90, unit: "BPM" },
  sugar: { value: null, unit: "mg/dL" },
  spo2: { value: 92, unit: "%" },
  sleep: { value: 9, unit: "Hours" },
  temp: { value: 36, unit: "°C" },
  weight: { value: null, unit: "kg" },
};

/* ---------- Custom vitals ---------- */
type IconKey =
  | "Activity" | "HeartPulse" | "Droplet" | "Droplets" | "Thermometer" | "Weight" | "Percent" | "Moon" | "Sun" | "Flame"
  | "Pill" | "Syringe" | "Stethoscope" | "Bandage" | "Brain" | "Dna" | "Wind" | "Dumbbell" | "Bed" | "Watch";

const ICONS: Record<IconKey, React.ElementType> = {
  Activity, HeartPulse, Droplet, Droplets, Thermometer, Weight, Percent, Moon, Sun, Flame,
  Pill, Syringe, Stethoscope, Bandage, Brain, Dna, Wind, Dumbbell, Bed, Watch,
};

type CustomVital = {
  id: string;
  title: string;
  unit: string;
  value: number | null;
  icon: IconKey;
};

/* ---------- Pretty backgrounds ---------- */
const tileBackground = (title: string): string => {
  // Built-ins with specific feel
  switch (title) {
    case "Blood pressure":
      return "linear-gradient(180deg,#FFE1DC 0%,#FFC9C2 100%)"; // peach
    case "Heart rate":
      return "linear-gradient(180deg,#FFD6E5 0%,#FBB8D0 100%)"; // pink
    case "Blood Sugar":
      return "linear-gradient(180deg,#EEF5FF 0%,#E1EBFF 100%)"; // powder blue
    case "SpO2":
      return "linear-gradient(180deg,#EAF0FF 0%,#DDE6FF 100%)"; // light indigo
    case "Sleep":
      return "linear-gradient(180deg,#EDEBFF 0%,#DDD8FF 100%)"; // lavender
    case "Temperature":
      return "linear-gradient(180deg,#F3F5FF 0%,#E6E9FF 100%)"; // cool violet
    case "Weight":
      return "linear-gradient(180deg,#F0F7F4 0%,#DBEFE6 100%)"; // mint
    default:
      break;
  }
  // Customs rotate a palette based on title hash
  const palettes = [
    "linear-gradient(180deg,#EAF7FF 0%,#D7EFFF 100%)", // sky
    "linear-gradient(180deg,#FFF0F6 0%,#FFD7E8 100%)", // rose
    "linear-gradient(180deg,#F3FFF5 0%,#E0FFE8 100%)", // mint
    "linear-gradient(180deg,#FFF6E5 0%,#FFE9C9 100%)", // sand
    "linear-gradient(180deg,#F0EEFF 0%,#E2DEFF 100%)", // lavender
    "linear-gradient(180deg,#FDF6FF 0%,#F5E6FF 100%)", // lilac
    "linear-gradient(180deg,#F2FFF9 0%,#DEFFF0 100%)", // aqua
  ];
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return palettes[h % palettes.length];
};

/* ---------- Random QR helpers ---------- */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const QRVisual: React.FC<{ size?: number; seed?: number }> = ({ size = 160, seed = Date.now() }) => {
  const rand = mulberry32(seed);
  const N = 25; // grid size
  const cell = size / N;
  const isFinder = (x: number, y: number) => {
    const zones = [{ x0: 0, y0: 0 }, { x0: N - 7, y0: 0 }, { x0: 0, y0: N - 7 }];
    return zones.some(({ x0, y0 }) => x >= x0 && x < x0 + 7 && y >= y0 && y < y0 + 7);
  };
  const modules: Array<{ x: number; y: number; on: boolean }> = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (isFinder(x, y)) continue;
    modules.push({ x, y, on: rand() < 0.45 });
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width={size} height={size} fill="#fff" />
      {[{ x: 0, y: 0 }, { x: size - cell * 7, y: 0 }, { x: 0, y: size - cell * 7 }].map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width={cell * 7} height={cell * 7} fill="#000" />
          <rect x={p.x + cell} y={p.y + cell} width={cell * 5} height={cell * 5} fill="#fff" />
          <rect x={p.x + cell * 2} y={p.y + cell * 2} width={cell * 3} height={cell * 3} fill="#000" />
        </g>
      ))}
      {modules.map((m, i) => (m.on ? <rect key={i} x={m.x * cell} y={m.y * cell} width={cell} height={cell} fill="#000" /> : null))}
    </svg>
  );
};
const QRCard: React.FC<{ label: string; seed: number }> = ({ label, seed }) => (
  <Card className="shadow-sm border-0" style={{ background: "linear-gradient(180deg,#FFE6B8 0%,#FBD392 100%)" }}>
    <CardContent className="p-6 flex flex-col items-center justify-center">
      <div className="text-sm font-medium mb-4 text-center">Scan to sync your {label}</div>
      <div className="rounded-lg bg-white shadow-inner p-3">
        <QRVisual size={160} seed={seed} />
      </div>
    </CardContent>
  </Card>
);

/* ---------- Generic tile ---------- */
const Tile: React.FC<{
  title: string;
  value?: string | number;
  unit?: string;
  Icon: React.ElementType;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void; // keep if you support deleting custom vitals
}> = ({ title, value, unit, Icon, selected, onClick, onRemove }) => (
  <div className="relative">
    {onRemove && (
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-2 -right-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow hover:bg-red-50"
        title={`Remove ${title}`}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    )}

    <button
      onClick={onClick}
      className={[
        "w-full rounded-2xl p-4 text-left border transition-all hover:shadow-sm",
        selected ? "ring-2 ring-primary/60 border-primary/40" : "border-border",
      ].join(" ")}
      style={{ background: tileBackground(title) }}
    >
      {/* Title row */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span className="whitespace-nowrap">{title}</span>
      </div>

      {/* Value block (now UNDER the title) */}
      {value !== undefined && (
        <div className="mt-2">
          <div className="text-2xl font-bold leading-tight whitespace-nowrap">
            {String(value)} {unit && <span className="text-base font-semibold">{unit}</span>}
          </div>
        </div>
      )}

      {/* Optional mini trend area (keep or remove) */}
      <div className="mt-3 h-10 rounded-md bg-white/40 border border-white/50" />
    </button>
  </div>
);

/* ---------- Page ---------- */
const Vitals: React.FC = () => {
  const navigate = useNavigate();
  const [vitals, setVitals] = useState<VitalState>(initialVitals);
  const [customVitals, setCustomVitals] = useState<CustomVital[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newIcon, setNewIcon] = useState<IconKey>("Activity");

  // For pop-up
  const [popup, setPopup] = React.useState<{ open: boolean; kind: PopupKind; message?: string }>({
    open: false, kind: "save"
  });

  const showFeedback = (kind: PopupKind, message?: string) =>
    setPopup({ open: true, kind, message });

  const closeFeedback = () => setPopup(p => ({ ...p, open: false }));

  // --- feedback triggers ---
  const handleSubmitVital = () => {
    // persist the edited vital
    saveEditor();
    // friendly message using the selected label
    const vitalTitle = (labelOfSelected() || "vital").toLowerCase();
    showFeedback("submit", `Your ${vitalTitle} value was submitted.`);
  };

  const handleSaveGreat = () => {
    // persist a "Great (no symptoms)" entry if you store it
    showFeedback("save", "Your health log was saved to Health Overview.");
  };

  const handleSaveExpanded = () => {
    const missingSymptoms = symptoms.length === 0;
    const missingImpact = !impact;
    const missingOnset = !onset;
    const missingTriggers = triggers.length === 0;

    if (missingSymptoms || missingImpact || missingOnset || missingTriggers) {
      setShowFormErrors(true);
      return;
    }
    setShowFormErrors(false);
    // persist symptoms/impact/onset/triggers as needed
    showFeedback("save", "Your health log was saved to Health Overview.");
  };

  // selection (built-in or custom)
  type Selected = { kind: "builtin"; key: VitalKey } | { kind: "custom"; id: string } | null;
  const [selected, setSelected] = useState<Selected>(null);

  // QR seed (randomized on open)
  const [qrSeed, setQrSeed] = useState<number>(Date.now());

  // symptoms form state (unchanged)
  const [feeling, setFeeling] = useState<FeelingLabel>("Great (no symptoms)");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [impact, setImpact] = useState<string>("");
  const [onset, setOnset] = useState<string>("");
  const [triggers, setTriggers] = useState<string[]>([]);

  // flag to show errors after clicking Save
  const [showFormErrors, setShowFormErrors] = useState(false);

  /* ----- Editor local state (per vital) ----- */
  const [editBP, setEditBP] = useState({ sys: vitals.bp.sys, dia: vitals.bp.dia });
  const [editNumber, setEditNumber] = useState<number | "">("");

  const openBuiltIn = (key: VitalKey) => {
    setSelected({ kind: "builtin", key });
    setQrSeed(Date.now() + Math.floor(Math.random() * 1e6)); // randomize QR per open
    if (key === "Blood pressure") {
      setEditBP({ sys: vitals.bp.sys, dia: vitals.bp.dia });
    } else {
      const map: Record<VitalKey, number | null> = {
        "Blood pressure": NaN,
        "Heart rate": vitals.hr.value,
        "Blood Sugar": vitals.sugar.value,
        SpO2: vitals.spo2.value,
        Sleep: vitals.sleep.value,
        Temperature: vitals.temp.value,
        Weight: vitals.weight.value,
      };
      setEditNumber(map[key] ?? "");
    }
  };

  const openCustom = (id: string) => {
    setSelected({ kind: "custom", id });
    setQrSeed(Date.now() + Math.floor(Math.random() * 1e6));
    const cv = customVitals.find(v => v.id === id);
    setEditNumber(cv?.value ?? "");
  };

  const saveEditor = () => {
    if (!selected) return;
    if (selected.kind === "builtin") {
      const key = selected.key;
      switch (key) {
        case "Blood pressure":
          setVitals(v => ({ ...v, bp: { ...v.bp, sys: Number(editBP.sys) || 0, dia: Number(editBP.dia) || 0 } }));
          break;
        case "Heart rate":
          if (editNumber !== "") setVitals(v => ({ ...v, hr: { ...v.hr, value: Number(editNumber) } }));
          break;
        case "Blood Sugar":
          if (editNumber !== "") setVitals(v => ({ ...v, sugar: { ...v.sugar, value: Number(editNumber) } }));
          break;
        case "SpO2":
          if (editNumber !== "") setVitals(v => ({ ...v, spo2: { ...v.spo2, value: Number(editNumber) } }));
          break;
        case "Sleep":
          if (editNumber !== "") setVitals(v => ({ ...v, sleep: { ...v.sleep, value: Number(editNumber) } }));
          break;
        case "Temperature":
          if (editNumber !== "") setVitals(v => ({ ...v, temp: { ...v.temp, value: Number(editNumber) } }));
          break;
        case "Weight":
          if (editNumber !== "") setVitals(v => ({ ...v, weight: { ...v.weight, value: Number(editNumber) } }));
          break;
      }
    } else {
      setCustomVitals(arr =>
        arr.map(cv => (cv.id === selected.id ? { ...cv, value: editNumber === "" ? null : Number(editNumber) } : cv))
      );
    }
  };

  /* ----- Helpers for tiles & labels ----- */
  const labelOfSelected = (): string | null =>
    selected ? (selected.kind === "builtin" ? selected.key : customVitals.find(v => v.id === selected.id)?.title || "Custom Vital") : null;

  const unitOfSelected = (): string | null => {
    if (!selected) return null;
    if (selected.kind === "builtin") {
      const k = selected.key;
      return k === "Blood pressure" ? vitals.bp.unit
        : k === "Heart rate" ? vitals.hr.unit
        : k === "Blood Sugar" ? vitals.sugar.unit
        : k === "SpO2" ? vitals.spo2.unit
        : k === "Sleep" ? vitals.sleep.unit
        : k === "Temperature" ? vitals.temp.unit
        : vitals.weight.unit;
    }
    return customVitals.find(v => v.id === selected.id)?.unit || "";
  };

  const tileValueBuiltIn = (key: VitalKey): string | number => {
    switch (key) {
      case "Blood pressure": return `${vitals.bp.sys}/${vitals.bp.dia}`;
      case "Heart rate": return vitals.hr.value;
      case "Blood Sugar": return vitals.sugar.value ?? "–";
      case "SpO2": return vitals.spo2.value;
      case "Sleep": return vitals.sleep.value;
      case "Temperature": return vitals.temp.value;
      case "Weight": return vitals.weight.value ?? "–";
    }
  };
  const tileUnitBuiltIn = (key: VitalKey): string => {
    switch (key) {
      case "Blood pressure": return vitals.bp.unit;
      case "Heart rate": return vitals.hr.unit;
      case "Blood Sugar": return vitals.sugar.unit;
      case "SpO2": return vitals.spo2.unit;
      case "Sleep": return vitals.sleep.unit;
      case "Temperature": return vitals.temp.unit;
      case "Weight": return vitals.weight.unit;
    }
  };

  /* ----- Add More (custom vital with icon picker) ----- */
  const addCustomVital = () => {
    if (!newTitle.trim()) return;
    const id = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    setCustomVitals(prev => [...prev, { id, title: newTitle.trim(), unit: newUnit.trim() || "", value: null, icon: newIcon }]);
    setNewTitle(""); setNewUnit(""); setNewIcon("Activity"); setAdding(false);
  };

  const FEELINGS = [
    { label: "Great (no symptoms)", emoji: "😄" },
    { label: "Good (minor)",        emoji: "🙂" },
    { label: "Okay",                emoji: "😐" },
    { label: "Not great",           emoji: "😕" },
    { label: "Unwell",              emoji: "🤒" },
  ] as const;
  type FeelingLabel = typeof FEELINGS[number]["label"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-grey-50 to-purple-50">

      {/* Top header row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-0">
            Vitals
          </h1>
          <p className="text-gray-600">
            Track your daily vitals and log key health indicators in one place
          </p>
        </div>
        <Button
          className="mt-4 md:mt-0"
          onClick={() => navigate("/HealthOverview")} // or router.push("/HealthOverview")
        >
          See Health Overview
        </Button>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT COLUMN */}
          <section className="space-y-4 lg:col-span-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">My health</h2>

            {/* Your Vitals – built-ins + custom */}
            <Card
              className="shadow-sm border-0"
              style={{ background: "linear-gradient(0deg, #fcd4d2ff 0%, #ffdad8ff 30%, #fff2f1ff 60%)" }}
            >
              <CardContent className="p-5">
                <div className="text-foreground/90 w-full">
                  {/* Header row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-foreground/5 border border-foreground/10">
                        <Stethoscope className="w-4 h-4 text-foreground" />
                      </span>
                      <div className="text-2xl font-bold">Your Vitals</div>
                    </div>
                    <span className="whitespace-nowrap font-bold">
                      31/07 · 9:41
                    </span>
                  </div>

                  {/* extra left padding; wider gap between the two columns */}
                  <div className="mt-4 pl-2 md:pl-2 lg:pl-4">
                    <div className="grid grid-cols-2 gap-y-4 gap-x-16 md:gap-x-20 lg:gap-x-24 text-sm">
                      {/* built-ins */}
                      <div>
                        <div className="text-muted-foreground whitespace-nowrap">Blood Pressure</div>
                        <div className="text-2xl font-bold whitespace-nowrap">
                          {vitals.bp.sys}/{vitals.bp.dia} <span className="text-base">{vitals.bp.unit}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground whitespace-nowrap">Heart Rate</div>
                        <div className="text-2xl font-bold whitespace-nowrap">
                          {vitals.hr.value} <span className="text-base">{vitals.hr.unit}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground whitespace-nowrap">Blood Sugar</div>
                        <div className="text-2xl font-bold whitespace-nowrap">
                          {vitals.sugar.value ?? "—"} <span className="text-base">{vitals.sugar.unit}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground whitespace-nowrap">SpO2</div>
                        <div className="text-2xl font-bold whitespace-nowrap">
                          {vitals.spo2.value} <span className="text-base">{vitals.spo2.unit}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground whitespace-nowrap">Sleep</div>
                        <div className="text-2xl font-bold whitespace-nowrap">
                          {vitals.sleep.value} <span className="text-base">{vitals.sleep.unit}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground whitespace-nowrap">Temperature</div>
                        <div className="text-2xl font-bold whitespace-nowrap">
                          {vitals.temp.value} <span className="text-base">{vitals.temp.unit}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground whitespace-nowrap">Weight</div>
                        <div className="text-2xl font-bold whitespace-nowrap">
                          {vitals.weight.value ?? "—"} <span className="text-base">{vitals.weight.unit}</span>
                        </div>
                      </div>

                      {/* custom vitals inside the same grid */}
                      {customVitals.map((cv) => (
                        <div key={cv.id}>
                          <div className="text-muted-foreground whitespace-nowrap">{cv.title}</div>
                          <div className="text-2xl font-bold whitespace-nowrap">
                            {cv.value ?? "—"} {cv.unit && <span className="text-base">{cv.unit}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How is your health today? */}
            <Card className="shadow-sm" style={{ background: "linear-gradient(180deg,#F5F9FF 0%,#E8EAFF 100%)" }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">How is your health today?</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* TOP: Vertical emoji scale (always visible) */}
                <div className="relative pl-7">
                  <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-border" />
                  {FEELINGS.map((f) => {
                    const active = feeling === f.label;
                    return (
                      <label key={f.label} className="flex items-center gap-3 py-2 cursor-pointer">
                        <span
                          className={[
                            "inline-flex h-6 w-6 items-center justify-center rounded-full border",
                            active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border",
                          ].join(" ")}
                        >
                          <span className={["h-2.5 w-2.5 rounded-full", active ? "bg-primary-foreground" : "bg-muted-foreground/40"].join(" ")} />
                        </span>
                        <input
                          type="radio"
                          name="feeling"
                          className="sr-only"
                          checked={active}
                          onChange={() => setFeeling(f.label)}
                        />
                        <span className="text-sm flex items-center gap-2">
                          <span className="text-base">{f.emoji}</span>
                          {f.label}
                        </span>
                      </label>
                    );
                  })}

                  {/* Save under "Unwell" — ONLY when feeling is Great */}
                  {feeling === "Great (no symptoms)" && (
                    <div className="mt-3">
                      <Button className="min-w-[120px]" onClick={handleSaveGreat}>Save</Button>
                    </div>
                  )}
                </div>

                {/* BOTTOM: Expanded fields (only when NOT Great) */}
                <FadeSlide show={feeling !== "Great (no symptoms)"} className="space-y-5">
                  {/* Top-level error banner */}
                  {showFormErrors && (symptoms.length === 0 || !impact || !onset || triggers.length === 0) && (
                    <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
                      Please fill all sections before saving.
                    </div>
                  )}

                  {/* Symptoms (up to 5) */}
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      What symptoms do you want to log?
                      <span className="text-muted-foreground">(pick up to 5)</span>
                      {showFormErrors && symptoms.length === 0 && (
                        <span className="text-red-600 text-xs font-medium">* need to be filled</span>
                      )}
                    </div>

                    <div
                      className={[
                        "mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2",
                        showFormErrors && symptoms.length === 0 ? "ring-1 ring-red-400 rounded-md p-1" : "",
                      ].join(" ")}
                    >
                      {SYMPTOM_FORM.symptoms.map((s) => {
                        const checked = symptoms.includes(s);
                        const disabled = !checked && symptoms.length >= 5;
                        return (
                          <label
                            key={s}
                            className={[
                              "grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg border px-3 py-3 min-h-[56px] bg-background",
                              checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                              disabled ? "opacity-60 cursor-not-allowed hover:bg-background" : "cursor-pointer",
                            ].join(" ")}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => {
                                if (disabled) return;
                                setSymptoms((prev) => (checked ? prev.filter((x) => x !== s) : [...prev, s]));
                              }}
                            />
                            <span className="text-sm leading-snug break-words">{s}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Impact */}
                  <div>
                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                      How much is this affecting you?
                      {showFormErrors && !impact && (
                        <span className="text-red-600 text-xs font-medium">* need to be filled</span>
                      )}
                    </div>
                    <select
                      value={impact}
                      onChange={(e) => setImpact(e.target.value)}
                      className={[
                        "w-full rounded-md border px-3 py-2 bg-background",
                        showFormErrors && !impact ? "border-red-500 focus-visible:ring-red-500" : "",
                      ].join(" ")}
                    >
                      <option value="" disabled>Choose…</option>
                      {SYMPTOM_FORM.impact.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* Onset */}
                  <div>
                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                      When did it start?
                      {showFormErrors && !onset && (
                        <span className="text-red-600 text-xs font-medium">* need to be filled</span>
                      )}
                    </div>
                    <select
                      value={onset}
                      onChange={(e) => setOnset(e.target.value)}
                      className={[
                        "w-full rounded-md border px-3 py-2 bg-background",
                        showFormErrors && !onset ? "border-red-500 focus-visible:ring-red-500" : "",
                      ].join(" ")}
                    >
                      <option value="" disabled>Choose…</option>
                      {SYMPTOM_FORM.onset.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>


                  {/* Triggers */}
                  <div>
                    <div className="text-sm font-medium mb-1 flex items-center gap-2">
                      What do you think triggered it?
                      {showFormErrors && triggers.length === 0 && (
                        <span className="text-red-600 text-xs font-medium">* need to be filled</span>
                      )}
                    </div>
                    <div
                      className={[
                        "grid grid-cols-1 sm:grid-cols-2 gap-2",
                        showFormErrors && triggers.length === 0 ? "ring-1 ring-red-400 rounded-md p-1" : "",
                      ].join(" ")}
                    >
                      {SYMPTOM_FORM.triggers.map((t) => {
                        const checked = triggers.includes(t);
                        return (
                          <label
                            key={t}
                            className={[
                              "grid grid-cols-[auto_1fr] items-center gap-2 rounded-lg border px-3 py-3 min-h-[56px] bg-background cursor-pointer",
                              checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                            ].join(" ")}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() =>
                                setTriggers((prev) => (checked ? prev.filter((x) => x !== t) : [...prev, t]))
                              }
                            />
                            <span className="text-sm leading-snug break-words">{t}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Save for expanded state */}
                  <div className="pt-2 flex justify-end">
                    <Button className="min-w-[120px]" onClick={handleSaveExpanded}>Save</Button>
                  </div>
                </FadeSlide>
              </CardContent>
            </Card>
          </section>

          {/* RIGHT COLUMN: All Vitals + Editor under it */}
          <section className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">All Vitals</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* built-in tiles */}
              <Tile title="Blood pressure" value={tileValueBuiltIn("Blood pressure")} unit={tileUnitBuiltIn("Blood pressure")} Icon={Activity}
                    selected={selected?.kind === "builtin" && selected.key === "Blood pressure"} onClick={() => openBuiltIn("Blood pressure")} />
              <Tile title="Heart rate" value={tileValueBuiltIn("Heart rate")} unit={tileUnitBuiltIn("Heart rate")} Icon={HeartPulse}
                    selected={selected?.kind === "builtin" && selected.key === "Heart rate"} onClick={() => openBuiltIn("Heart rate")} />
              <Tile title="Blood Sugar" value={tileValueBuiltIn("Blood Sugar")} unit={tileUnitBuiltIn("Blood Sugar")} Icon={Droplet}
                    selected={selected?.kind === "builtin" && selected.key === "Blood Sugar"} onClick={() => openBuiltIn("Blood Sugar")} />
              <Tile title="SpO2" value={tileValueBuiltIn("SpO2")} unit={tileUnitBuiltIn("SpO2")} Icon={Percent}
                    selected={selected?.kind === "builtin" && selected.key === "SpO2"} onClick={() => openBuiltIn("SpO2")} />
              <Tile title="Sleep" value={tileValueBuiltIn("Sleep")} unit={tileUnitBuiltIn("Sleep")} Icon={Moon}
                    selected={selected?.kind === "builtin" && selected.key === "Sleep"} onClick={() => openBuiltIn("Sleep")} />
              <Tile title="Temperature" value={tileValueBuiltIn("Temperature")} unit={tileUnitBuiltIn("Temperature")} Icon={Thermometer}
                    selected={selected?.kind === "builtin" && selected.key === "Temperature"} onClick={() => openBuiltIn("Temperature")} />
              <Tile title="Weight" value={tileValueBuiltIn("Weight")} unit={tileUnitBuiltIn("Weight")} Icon={Weight}
                    selected={selected?.kind === "builtin" && selected.key === "Weight"} onClick={() => openBuiltIn("Weight")} />

              {/* custom tiles */}
              {customVitals.map(cv => {
                const Icon = ICONS[cv.icon] || Flame;
                return (
                  <Tile
                    key={cv.id}
                    title={cv.title}
                    value={cv.value ?? "–"}
                    unit={cv.unit}
                    Icon={Icon}
                    selected={selected?.kind === "custom" && selected.id === cv.id}
                    onClick={() => openCustom(cv.id)}
                    onRemove={() => setCustomVitals(arr => arr.filter(v => v.id !== cv.id))}  // NEW
                  />
                );
              })}
            </div>

            {/* Add More with icon picker */}
            <div className="mt-3">
              {!adding ? (
                <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                  + Add More
                </Button>
              ) : (
                <div className="rounded-xl border p-3 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground block mb-1">New vital name</label>
                      <input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="e.g., Hydration"
                        className="w-full rounded-md border bg-background px-3 py-2 outline-none"
                      />
                    </div>
                    <div className="sm:w-40">
                      <label className="text-xs text-muted-foreground block mb-1">Unit (optional)</label>
                      <input
                        value={newUnit}
                        onChange={e => setNewUnit(e.target.value)}
                        placeholder="e.g., %"
                        className="w-full rounded-md border bg-background px-3 py-2 outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addCustomVital} disabled={!newTitle.trim()}>Add</Button>
                      <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setNewTitle(""); setNewUnit(""); setNewIcon("Activity"); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>

                  {/* Icon picker (20 options) */}
                  <div>
                    <div className="text-xs text-muted-foreground mb-2">Choose an icon</div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {(Object.keys(ICONS) as IconKey[]).map(key => {
                        const Ico = ICONS[key];
                        const selectedIcon = newIcon === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setNewIcon(key)}
                            className={[
                              "h-10 rounded-lg border flex items-center justify-center",
                              selectedIcon ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"
                            ].join(" ")}
                            title={key}
                          >
                            <Ico className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Editor appears here, centered; compact height */}
            <div className="mt-4 flex justify-center">
              <div className={`w-full ${selected ? "md:max-w-4xl" : "md:max-w-xl"}`}>
                <h2 className="text-xl font-semibold text-center">
                  {selected ? `What is your ${labelOfSelected()} today?` : "Choose one of the Vitals to Update"}
                </h2>
                <div className="mx-auto mt-2 h-px bg-border w-full max-w-sm" />

                <FadeSlide show={!!selected} className="mt-4">
                  <div className={`grid grid-cols-1 ${selected ? "md:grid-cols-2" : ""} gap-4`}>
                    {/* QR for all selected (randomized per open) */}
                    {selected && <QRCard label={labelOfSelected() || "vital"} seed={qrSeed} />}

                    {/* Entry card – compact; buttons pinned bottom-right */}
                    <Card className="shadow-sm border-0 relative" style={{ background: "linear-gradient(180deg,#DFF5F0 0%,#CBECE6 100%)" }}>
                      <CardContent className="p-6 pb-16">
                        {selected?.kind === "builtin" && selected.key === "Blood pressure" ? (
                          <>
                            <div className="text-sm font-medium mb-4 flex items-center gap-2">
                              <Activity className="w-4 h-4" /> Enter your Blood Pressure:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-muted-foreground block mb-1">Systolic (SYS)</label>
                                <input
                                  type="number"
                                  value={editBP.sys}
                                  onChange={e => setEditBP(bp => ({ ...bp, sys: Number(e.target.value) }))}
                                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground block mb-1">Diastolic (DIA)</label>
                                <input
                                  type="number"
                                  value={editBP.dia}
                                  onChange={e => setEditBP(bp => ({ ...bp, dia: Number(e.target.value) }))}
                                  className="w-full rounded-lg border bg-background px-3 py-2 outline-none"
                                />
                              </div>
                            </div>
                          </>
                        ) : selected ? (
                          <>
                            <div className="text-sm font-medium mb-3 flex items-center gap-2">
                              {selected.kind === "builtin" && selected.key === "Heart rate" && <HeartPulse className="w-4 h-4" />}
                              {selected.kind === "builtin" && selected.key === "Blood Sugar" && <Droplet className="w-4 h-4" />}
                              {selected.kind === "builtin" && selected.key === "SpO2" && <Percent className="w-4 h-4" />}
                              {selected.kind === "builtin" && selected.key === "Sleep" && <Moon className="w-4 h-4" />}
                              {selected.kind === "builtin" && selected.key === "Temperature" && <Thermometer className="w-4 h-4" />}
                              {selected.kind === "builtin" && selected.key === "Weight" && <Weight className="w-4 h-4" />}
                              <span>Enter your {labelOfSelected()}:</span>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-2">Value</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step={
                                    (selected.kind === "builtin" &&
                                      (selected.key === "Sleep" || selected.key === "Temperature" || selected.key === "Weight")) ||
                                    selected.kind === "custom"
                                      ? "0.1"
                                      : "1"
                                  }
                                  value={editNumber}
                                  onChange={e => setEditNumber(e.target.value === "" ? "" : Number(e.target.value))}
                                  placeholder="e.g., 110"
                                  className="flex-1 rounded-lg border bg-background px-3 py-2 outline-none"
                                />
                                <span className="text-sm px-3 py-2 rounded-lg bg-white/70 border">
                                  {unitOfSelected() || ""}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : null}

                        {/* Save/Cancel pinned bottom-right (small padding reserved via pb-16) */}
                        {selected && (
                          <div className="absolute bottom-4 right-4 flex gap-2">
                            <Button onClick={handleSubmitVital}>
                              Submit <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                            <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </FadeSlide>
              </div>
            </div>
          </section>
        </div>
      </main>
                        
      <FeedbackPopup
        open={popup.open}
        kind={popup.kind}
        message={popup.message}
        onClose={closeFeedback}
      />

    </div>
  );
};

export default Vitals;
