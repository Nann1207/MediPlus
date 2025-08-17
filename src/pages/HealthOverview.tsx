import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Activity,
  Heart,
  Droplets,
  Wind,
  Thermometer,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ComposedChart,
} from "recharts";

/* ---------------- SEA-LION (demo: key in client) ---------------- */
const SEA_LION_KEY = "sk-TSbEBjqQN9HKMcutANxL5A";
const SEA_LION_URL = "https://api.sea-lion.ai/v1/chat/completions";
const SEA_LION_MODEL = "aisingapore/Llama-SEA-LION-v3-70B-IT";

async function seaLionChat(prompt: string, signal?: AbortSignal): Promise<string> {
  if (!SEA_LION_KEY) throw new Error("Missing SEA-LION API key");
  const r = await fetch(SEA_LION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SEA_LION_KEY}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      model: SEA_LION_MODEL,
      max_completion_tokens: 320,
      messages: [
        {
          role: "system",
          content:
            "You are a careful health coach. The user has diabetes and treated hypertension. " +
            "Write concise, safe, practical bullets. No medical diagnosis.",
        },
        { role: "user", content: prompt },
      ],
    }),
    signal,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || r.statusText);
  return (data?.choices?.[0]?.message?.content ?? "").trim();
}

// Treat user-initiated aborts as non-errors
const isAbortError = (e: any) =>
  e?.name === "AbortError" ||
  String(e?.message || "").toLowerCase().includes("abort");

/* ---------------- Shared store & types ---------------- */
type HOVitalKey = "Blood Pressure" | "Heart Rate" | "Blood Sugar" | "SpO2" | "Temperature";
type BPSample = { sys: number; dia: number };
type HOSample = { ts: number; kind: HOVitalKey; value: number | BPSample };
const HO_LS_KEY = "mediplus.samples";

/* ---------------- utils ---------------- */
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const dayNum = (d: Date) => d.getDate();
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const avg = (arr: number[]) => {
  const v = arr.filter((x) => Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
};

const load = (): HOSample[] => {
  try {
    return JSON.parse(localStorage.getItem(HO_LS_KEY) || "[]");
  } catch {
    return [];
  }
};
const save = (x: HOSample[]) => localStorage.setItem(HO_LS_KEY, JSON.stringify(x));

/* ---------------- seed realistic 2y data (once) ---------------- */
function seedIfEmpty() {
  if (load().length) return;
  const out: HOSample[] = [];
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 730); // ~2 years

  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const ts = d.getTime();
    const t = ts / 8.64e7;
    const spike = Math.random() < 0.07; // occasional spikes

    // Blood sugar (mg/dL)
    let sugar = 145 + 18 * Math.sin(t / 23) + (Math.random() * 22 - 11);
    if (spike) sugar += 40 + Math.random() * 40;
    sugar = clamp(Math.round(sugar), 100, 260);

    // Blood pressure
    let sys = 128 + 6 * Math.sin(t / 40) + (Math.random() * 12 - 6);
    let dia = 84 + 4 * Math.cos(t / 37) + (Math.random() * 8 - 4);
    if (spike) {
      sys += 20 + Math.random() * 15;
      dia += 10 + Math.random() * 8;
    }
    sys = clamp(Math.round(sys), 110, 175);
    dia = clamp(Math.round(dia), 70, 110);

    // HR/SpO2/Temp
    const hr = clamp(Math.round(84 + 5 * Math.sin(t / 55) + (Math.random() * 8 - 4)), 62, 110);
    const spo2 = clamp(Math.round(95 + 1.5 * Math.cos(t / 50) + (Math.random() * 2 - 1)), 90, 99);
    const temp = clamp(Number((36.6 + 0.2 * Math.sin(t / 60) + (Math.random() * 0.4 - 0.2)).toFixed(1)), 36.0, 37.8);

    out.push({ ts, kind: "Blood Sugar", value: sugar });
    out.push({ ts, kind: "Blood Pressure", value: { sys, dia } });
    out.push({ ts, kind: "Heart Rate", value: hr });
    out.push({ ts, kind: "SpO2", value: spo2 });
    out.push({ ts, kind: "Temperature", value: temp });
  }
  save(out);
}

/* ---------------- hooks ---------------- */
function useSamples() {
  const [samples, setSamples] = React.useState<HOSample[]>([]);
  React.useEffect(() => {
    seedIfEmpty();
    setSamples(load());
    const onUpd = () => setSamples(load());
    window.addEventListener("health:samples-updated", onUpd);
    return () => window.removeEventListener("health:samples-updated", onUpd);
  }, []);
  const months = React.useMemo(() => {
    const m = new Set(samples.map((s) => monthKey(new Date(s.ts))));
    return Array.from(m).sort().reverse(); // newest first
  }, [samples]);
  return { samples, months };
}

function useMonthList(samples: HOSample[]) {
  return React.useMemo(() => {
    const set = new Set<string>();
    for (const s of samples) set.add(monthKey(new Date(s.ts))); // "YYYY-MM"

    let list = Array.from(set);
    list.sort(); // ascending by "YYYY-MM"
    list.reverse(); // newest first

    // Fallback: if for some reason samples are empty, give last 24 months
    if (!list.length) {
      const d = new Date();
      const fallback: string[] = [];
      for (let i = 0; i < 24; i++) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        fallback.push(key);
        d.setMonth(d.getMonth() - 1);
      }
      list = fallback;
    }
    return list;
  }, [samples]);
}

/* ---------------- build daily/month/year series ---------------- */
type Pt = { d: number; value?: number; sys?: number; dia?: number };

function buildDailySeries(samples: HOSample[], kind: HOVitalKey, month: string | null): Pt[] {
  if (!month) return [];
  const inMonth = samples.filter((s) => monthKey(new Date(s.ts)) === month && s.kind === kind);
  if (!inMonth.length) return [];

  const byDay = new Map<number, { n: number; sum?: number; sumSys?: number; sumDia?: number }>();
  for (const s of inMonth) {
    const d = dayNum(new Date(s.ts));
    const rec = byDay.get(d) || { n: 0 };
    rec.n++;
    if (kind === "Blood Pressure") {
      const bp = s.value as BPSample;
      rec.sumSys = (rec.sumSys || 0) + bp.sys;
      rec.sumDia = (rec.sumDia || 0) + bp.dia;
    } else {
      rec.sum = (rec.sum || 0) + (s.value as number);
    }
    byDay.set(d, rec);
  }

  // Return all calendar days that actually have data for that month
  const days = Array.from(byDay.keys()).sort((a, b) => a - b);
  return days.map((d) => {
    const r = byDay.get(d)!;
    if (kind === "Blood Pressure") {
      return { d, sys: Math.round((r.sumSys || 0) / r.n), dia: Math.round((r.sumDia || 0) / r.n) };
    }
    return { d, value: Number(((r.sum || 0) / r.n).toFixed(1)) };
  });
}

// YEAR: 12 points (months 1..12)
function buildYearSeries(samples: HOSample[], kind: HOVitalKey, year: number): Pt[] {
  const byM = Array.from({ length: 12 }, () => [] as HOSample[]);
  for (const s of samples) {
    const d = new Date(s.ts);
    if (d.getFullYear() !== year || s.kind !== kind) continue;
    byM[d.getMonth()].push(s);
  }
  return byM.map((bucket, mi) => {
    if (!bucket.length) return { d: mi + 1 };
    if (kind === "Blood Pressure") {
      const sys = Math.round(avg(bucket.map((b) => (b.value as BPSample).sys)));
      const dia = Math.round(avg(bucket.map((b) => (b.value as BPSample).dia)));
      return { d: mi + 1, sys, dia };
    }
    const v = Number(avg(bucket.map((b) => b.value as number)).toFixed(1));
    return { d: mi + 1, value: v };
  });
}

// DAY: 24 points (00..23), using the day's average so it's never empty
function buildDaySeries(samples: HOSample[], kind: HOVitalKey, month: string, day: number): Pt[] {
  const dayRows = samples.filter((s) => {
    const d = new Date(s.ts);
    return monthKey(d) === month && d.getDate() === day && s.kind === kind;
  });

  if (!dayRows.length) return Array.from({ length: 24 }, (_, h) => ({ d: h, value: undefined }));

  if (kind === "Blood Pressure") {
    const sys = Math.round(avg(dayRows.map((b) => (b.value as BPSample).sys)));
    const dia = Math.round(avg(dayRows.map((b) => (b.value as BPSample).dia)));
    return Array.from({ length: 24 }, (_, h) => ({ d: h, sys, dia }));
  }
  const v = Number(avg(dayRows.map((b) => b.value as number)).toFixed(1));
  return Array.from({ length: 24 }, (_, h) => ({ d: h, value: v }));
}

/* ---------------- local insights/suggestions ---------------- */
const median = (arr: number[]) => {
  const a = [...arr].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
};

function monthInsights(samples: HOSample[], month: string | null): string[] {
  if (!month) return [];
  const data = samples.filter((s) => monthKey(new Date(s.ts)) === month);
  if (!data.length) return ["No data this month."];

  const a = (x: number[]) => x.reduce((p, c) => p + c, 0) / x.length;

  const bps = data.filter((d) => d.kind === "Blood Pressure").map((d) => d.value as BPSample);
  const aSys = Math.round(a(bps.map((b) => b.sys)));
  const aDia = Math.round(a(bps.map((b) => b.dia)));

  const sugars = data.filter((d) => d.kind === "Blood Sugar").map((d) => d.value as number);
  const aSugar = Math.round(a(sugars));
  const hiSugarDays = sugars.filter((v) => v >= 200).length;

  return [
    `Average BP about ${aSys}/${aDia} mmHg.`,
    `Average glucose about ${aSugar} mg/dL.`,
    hiSugarDays ? `${hiSugarDays} day(s) with glucose ≥ 200 mg/dL.` : "Glucose spikes were infrequent.",
  ];
}

function selectedInsights(samples: HOSample[], kind: HOVitalKey): string[] {
  const since = Date.now() - 30 * 86400000;
  const recent = samples.filter((s) => s.ts >= since && s.kind === kind);
  if (!recent.length) return ["No recent entries."];

  if (kind === "Blood Pressure") {
    const sys = recent.map((r) => (r.value as BPSample).sys);
    const dia = recent.map((r) => (r.value as BPSample).dia);
    return [
      `30-day systolic median ≈ ${median(sys)} mmHg; diastolic median ≈ ${median(dia)} mmHg.`,
      Math.max(...sys) >= 160 || Math.max(...dia) >= 100
        ? "Occasional very high readings observed — recheck after 5 minutes rest when this happens."
        : "Readings mostly within the controlled range.",
    ];
  }
  if (kind === "Blood Sugar") {
    const vals = recent.map((r) => r.value as number);
    return [
      `30-day glucose range: ${Math.min(...vals)}–${Math.max(...vals)} mg/dL.`,
      vals.filter((v) => v >= 200).length
        ? "Hyperglycemia days present; review meal timing and meds adherence."
        : "Spikes were uncommon.",
    ];
  }
  if (kind === "Heart Rate") return [`Typical resting HR ≈ ${median(recent.map((r) => r.value as number))} BPM.`];
  if (kind === "SpO2") return ["SpO₂ mostly 92–98%. Values < 92% were rare."];
  if (kind === "Temperature") return ["Temperature within normal range most days."];
  return [];
}

function suggestions(kind: HOVitalKey): string[] {
  switch (kind) {
    case "Blood Pressure":
      return [
        "Reduce sodium; minimise processed foods.",
        "Walk 20–30 min most days; steady routine.",
        "Take antihypertensives at the same time daily.",
        "If BP > 180/110 or symptoms (chest pain, dizziness), seek urgent care.",
      ];
    case "Blood Sugar":
      return [
        "Keep meal times consistent; pair carbs with protein/fibre.",
        "10–15 min light walk after meals.",
        "Hydrate well; log higher-carb meals for patterns.",
      ];
    case "Heart Rate":
      return ["Practice 5-minute box-breathing twice daily.", "Build aerobic fitness gradually; monitor symptoms."];
    case "SpO2":
      return ["Evaluate sleep quality; try diaphragmatic breathing.", "Avoid smoking and second-hand smoke."];
    case "Temperature":
      return ["Hydrate and rest when unwell; seek care for persistent fever ≥ 38.0°C."];
  }
}

// Vital icons mapping
const vitalIcons = {
  "Blood Pressure": Heart,
  "Heart Rate": Activity,
  "Blood Sugar": Droplets,
  "SpO2": Wind,
  "Temperature": Thermometer,
};

// --- Sparklines for tiles ---
const Sparkline: React.FC<{ data: Pt[] }> = ({ data }) => (
  <div className="h-12">
    {data.length ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="d" hide />
          <YAxis hide />
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full rounded bg-muted/40" />
    )}
  </div>
);

const SparklineBP: React.FC<{ data: Pt[] }> = ({ data }) => (
  <div className="h-12">
    {data.length ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="d" hide />
          <YAxis hide domain={[60, 190]} />
          <Line type="monotone" dataKey="sys" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="dia" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="h-full rounded bg-muted/40" />
    )}
  </div>
);

/* --- Animated loader for AI sections --- */
const AILoading: React.FC<{ lines?: number }> = ({ lines = 5 }) => (
  <div className="space-y-3">
    <div className="inline-flex items-center gap-2 text-blue-200">
      <span>Analyzing health data</span>
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
      </span>
    </div>
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded animate-pulse bg-white/20" style={{ width: i === lines - 1 ? "80%" : "100%" }} />
      ))}
    </div>
  </div>
);

// --- date helpers / formatters ---
const ddmmyyyy = (monthKeyStr: string, day: number) => {
  const [y, m] = monthKeyStr.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, day || 1);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const aiToHTML = (s: string) => {
  let html = escapeHtml(s);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\r?\n/g, "<br/>");
  html = html.replace(/(^|<br\/>)\s*-\s+/g, "$1• ");
  return html;
};

// ---- Month-wide stats for ALL vitals (for AI + fallback) ----
function monthStatsForAI(samples: HOSample[], month: string | null) {
  if (!month) return null;
  const inMonth = samples.filter((s) => monthKey(new Date(s.ts)) === month);
  if (!inMonth.length) return { month, days: 0 };

  const take = <T,>(kind: HOVitalKey, map: (x: HOSample) => T) => inMonth.filter((s) => s.kind === kind).map(map);

  const bpSys = take("Blood Pressure", (s) => (s.value as BPSample).sys);
  const bpDia = take("Blood Pressure", (s) => (s.value as BPSample).dia);
  const sugar = take("Blood Sugar", (s) => s.value as number);
  const hr = take("Heart Rate", (s) => s.value as number);
  const spo2 = take("SpO2", (s) => s.value as number);
  const temp = take("Temperature", (s) => s.value as number);

  const avgNum = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
  const rng = (a: number[]) => (a.length ? { min: Math.min(...a), max: Math.max(...a) } : { min: NaN, max: NaN });

  return {
    month,
    counts: {
      bp: bpSys.length,
      sugar: sugar.length,
      hr: hr.length,
      spo2: spo2.length,
      temp: temp.length,
    },
    bloodPressure: {
      avgSys: Math.round(avgNum(bpSys)),
      avgDia: Math.round(avgNum(bpDia)),
      medSys: median(bpSys),
      medDia: median(bpDia),
      veryHighDays: bpSys.some(Boolean) ? bpSys.filter((v, i) => v >= 160 || bpDia[i] >= 100).length : 0,
      highDays: bpSys.some(Boolean) ? bpSys.filter((v, i) => v >= 140 || bpDia[i] >= 90).length : 0,
      ...rng(bpSys),
      maxDia: Math.max(...bpDia),
      minDia: Math.min(...bpDia),
    },
    bloodSugar: {
      avg: Math.round(avgNum(sugar)),
      med: median(sugar),
      highDays180: sugar.filter((v) => v >= 180).length,
      veryHighDays200: sugar.filter((v) => v >= 200).length,
      ...rng(sugar),
    },
    heartRate: {
      avg: Math.round(avgNum(hr)),
      med: median(hr),
      ...rng(hr),
    },
    spo2: {
      avg: Math.round(avgNum(spo2)),
      lowDays92: spo2.filter((v) => v < 92).length,
      ...rng(spo2),
    },
    temperature: {
      avg: Number(avgNum(temp).toFixed(1)),
      feverDays38: temp.filter((v) => v >= 38.0).length,
      ...rng(temp),
    },
  };
}

function monthInsightsFallback(stats: ReturnType<typeof monthStatsForAI>): string {
  if (!stats || !stats.counts) return "No data this month.";
  const bp = stats.bloodPressure,
    su = stats.bloodSugar,
    hr = stats.heartRate,
    sp = stats.spo2,
    te = stats.temperature;
  const bullets: string[] = [];

  bullets.push("Focus: Diabetes & Blood Pressure");
  bullets.push(
    `• BP avg ≈ ${bp.avgSys}/${bp.avgDia} mmHg (median ${bp.medSys}/${bp.medDia}). High-days ≥140/90: ${bp.highDays}; very-high ≥160/100: ${bp.veryHighDays}.`
  );
  bullets.push(
    `• Glucose avg ≈ ${su.avg} mg/dL (median ${su.med}); spikes ≥200 mg/dL: ${su.veryHighDays200}, ≥180 mg/dL: ${su.highDays180}.`
  );

  bullets.push("Other vitals");
  bullets.push(`• Heart rate avg ≈ ${hr.avg} BPM (range ${hr.min}–${hr.max}).`);
  bullets.push(`• SpO₂ avg ≈ ${sp.avg}% (low <92% days: ${sp.lowDays92}).`);
  bullets.push(`• Temperature avg ≈ ${te.avg}°C (fever ≥38.0°C days: ${te.feverDays38}).`);

  return bullets.join("\n");
}

// --- formatter helpers ---
const MONTH_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const monthAbbr = (m: number) => MONTH_ABBR[(m - 1 + 12) % 12];

const vitalUnit = (k: HOVitalKey) =>
  k === "Blood Pressure" ? "mmHg" : k === "Heart Rate" ? "BPM" : k === "Blood Sugar" ? "mg/dL" : k === "SpO2" ? "%" : "°C";

/* ---------------- page ---------------- */
const HealthOverview: React.FC = () => {
  const { samples } = useSamples();
  const months = useMonthList(samples);

  const [monthPick, setMonthPick] = React.useState<string | null>(null);
  const [openMonthly, setOpenMonthly] = React.useState(true);
  const [selected, setSelected] = React.useState<HOVitalKey | null>(null);

  // Run-id guards so only the newest request can set state
  const aiMonthRunRef = React.useRef(0);
  const aiVitalRunRef = React.useRef(0);

  // Default month to newest
  React.useEffect(() => {
    if (!monthPick && months.length) setMonthPick(months[0]);
  }, [months, monthPick]);

  // AI UI state
  const [aiInsights, setAiInsights] = React.useState<string>("");
  const [aiSuggestions, setAiSuggestions] = React.useState<string>("");
  const [aiBusy, setAiBusy] = React.useState(false);
  const [aiError, setAiError] = React.useState<string>("");

  // Monthly AI (overview across ALL vitals)
  const [aiMonthText, setAiMonthText] = React.useState("");
  const [aiMonthBusy, setAiMonthBusy] = React.useState(false);
  const [aiMonthErr, setAiMonthErr] = React.useState<string>("");

  React.useEffect(() => {
    if (!monthPick) { setAiMonthText(""); return; }

    const id = ++aiMonthRunRef.current;           // mark this run as latest
    const ctrl = new AbortController();

    setAiMonthBusy(true);
    setAiMonthErr("");

    const stats = monthStatsForAI(samples, monthPick);
    const prettyMonth = new Date(`${monthPick}-01`).toLocaleString(undefined, { month: "long", year: "numeric" });
    const prompt =
      `You are a careful health coach. The user has diabetes and treated hypertension. ` +
      `Given the month-wide stats (JSON below), produce concise insights **covering ALL vitals**. ` +
      `Output exactly two sections with bullets:\n` +
      `Focus: Diabetes & Blood Pressure\n- 3–5 short bullets about blood sugar and blood pressure\n` +
      `Other vitals\n- 3–5 short bullets about heart rate, SpO2, and temperature\n` +
      `Avoid diagnosis; be practical and neutral. Month: ${prettyMonth}.\n\n` +
      `STATS:\n${JSON.stringify(stats)}`;

    (async () => {
      try {
        const text = await seaLionChat(prompt, ctrl.signal);
        if (aiMonthRunRef.current !== id) return; // newer run took over
        setAiMonthText(text.trim());
      } catch (e: any) {
        if (aiMonthRunRef.current !== id || isAbortError(e)) return; // ignore aborts or stale runs
        setAiMonthErr(e?.message || "Failed to generate");
        setAiMonthText(monthInsightsFallback(stats!));               // fallback
      } finally {
        if (aiMonthRunRef.current === id) setAiMonthBusy(false);     // only latest run flips busy off
      }
    })();

    return () => ctrl.abort(); // abort when month/view changes
  }, [monthPick, samples]);


  // ----------- view state and selected day for Daily view -----------
  const [view, setView] = React.useState<"day" | "month" | "year">("month");
  const [selDay, setSelDay] = React.useState<number>(() => new Date().getDate()); // default to 'today' on open

  // days in currently picked month
  const daysInSelectedMonth = React.useMemo(() => {
    if (!monthPick) return 31;
    const [y, m] = monthPick.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  }, [monthPick]);

  // When switching to Daily (or month changes while in Daily): default to today if current month, else clamp to last day
  React.useEffect(() => {
    if (!monthPick || view !== "day") return;
    const [y, m] = monthPick.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === y && now.getMonth() + 1 === m;
    const defaultDay = isCurrentMonth ? now.getDate() : last;
    setSelDay((d) => {
      if (d >= 1 && d <= last) return d;
      return defaultDay;
    });
  }, [view, monthPick]);

  // Pretty month / year
  const prettyMonth = React.useMemo(
    () => (monthPick ? new Date(`${monthPick}-01`).toLocaleString(undefined, { month: "long", year: "numeric" }) : ""),
    [monthPick]
  );
  const yearLabel = monthPick ? monthPick.split("-")[0] : String(new Date().getFullYear());

  // Recompute chart series when selection/month/view change
  const chartData = React.useMemo<Pt[]>(() => {
    if (!selected || !monthPick) return [];
    if (view === "year") {
      const year = Number(monthPick.split("-")[0]);
      return buildYearSeries(samples, selected, year);
    }
    if (view === "day") {
      const day = clamp(selDay || 1, 1, daysInSelectedMonth);
      return buildDaySeries(samples, selected, monthPick, day);
    }
    return buildDailySeries(samples, selected, monthPick);
  }, [samples, selected, monthPick, view, selDay, daysInSelectedMonth]);

  // --- AI insights & suggestions for the currently selected vital ---
  React.useEffect(() => {
    if (!selected || !monthPick) return;

    const id = ++aiVitalRunRef.current;
    const ctrl = new AbortController();

    setAiBusy(true);
    setAiError("");

    // Build a compact series for the current view (same as you already do)
    let series: Pt[] = [];
    if (view === "year") {
      const year = Number(monthPick.split("-")[0]);
      series = buildYearSeries(samples, selected, year);
    } else if (view === "day") {
      const day = clamp(selDay || 1, 1, daysInSelectedMonth);
      series = buildDaySeries(samples, selected, monthPick, day);
    } else {
      series = buildDailySeries(samples, selected, monthPick);
    }

    const compact = (selected === "Blood Pressure")
      ? series.slice(-31).map(p => ({ d: p.d, sys: p.sys, dia: p.dia }))
      : series.slice(-31).map(p => ({ d: p.d, value: p.value }));

    const prettyMonth = new Date(`${monthPick}-01`).toLocaleString(undefined, { month: "long", year: "numeric" });
    
    const insightsPrompt = 
      `Summarize key insights for ${selected} in ${prettyMonth}. ` +
      `Give 4–6 concise bullets. Daily values (most recent first): ${JSON.stringify(compact)}.`;
    
      const suggestionsPrompt = 
      `Based on ${selected} for ${prettyMonth} and the user's diabetes & treated hypertension, ` +
      `give 5 actionable suggestions (diet, activity, sleep, hydration, adherence). ` +
      `Each bullet under 18 words. No diagnosis.`;

    (async () => {
      try {
        const [ins, sug] = await Promise.all([
          seaLionChat(insightsPrompt, ctrl.signal),
          seaLionChat(suggestionsPrompt, ctrl.signal),
        ]);
        if (aiVitalRunRef.current !== id) return;
        setAiInsights(ins);
        setAiSuggestions(sug);
      } catch (e: any) {
        if (aiVitalRunRef.current !== id || isAbortError(e)) return; // ignore aborts/stale
        setAiError(e?.message || "Failed to generate with SEA-LION");
        setAiInsights(selectedInsights(samples, selected).map(s => `• ${s}`).join("\n"));
        setAiSuggestions(suggestions(selected).map(s => `• ${s}`).join("\n"));
      } finally {
        if (aiVitalRunRef.current === id) setAiBusy(false);
      }
    })();

    return () => ctrl.abort();
  }, [selected, monthPick, view, selDay, samples, daysInSelectedMonth]);

  // X-Axis tick formatter per view
  const formatXTick = React.useCallback(
    (v: number) => {
      if (view === "year") return MONTH_ABBR[(v - 1 + 12) % 12]; // 1..12 -> JAN..DEC
      if (view === "day") return `${String(v).padStart(2, "0")}:00`; // HH:00
      return String(v).padStart(2, "0"); // DD
    },
    [view]
  );

  // Non-BP tooltip: value + unit, date per view
  const GenericTooltipComp: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const v = payload[0]?.payload?.value;
    if (v == null) return null;

    let when = "";
    if (view === "year") {
      const year = Number(monthPick?.split("-")[0] || new Date().getFullYear());
      when = `${MONTH_ABBR[(Number(label) - 1 + 12) % 12]} ${year}`;
    } else if (view === "day") {
      const d = clamp(selDay || 1, 1, daysInSelectedMonth);
      const date = ddmmyyyy(monthPick!, d);
      when = `${date} ${String(Number(label)).padStart(2, "0")}:00`;
    } else {
      when = ddmmyyyy(monthPick!, Number(label));
    }

    const unit = selected ? vitalUnit(selected) : "";

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="font-medium text-gray-900">{when}</div>
        <div className="text-gray-600">{`${v} ${unit}`}</div>
      </div>
    );
  };

  // BP tooltip
  const BPTooltipComp: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload || {};
    let when = "";
    if (view === "year") {
      const year = Number(monthPick?.split("-")[0] || new Date().getFullYear());
      when = `${MONTH_ABBR[(Number(label) - 1 + 12) % 12]} ${year}`;
    } else if (view === "day") {
      const d = clamp(selDay || 1, 1, daysInSelectedMonth);
      const date = ddmmyyyy(monthPick!, d);
      when = `${date} ${String(Number(label)).padStart(2, "0")}:00`;
    } else {
      when = ddmmyyyy(monthPick!, Number(row.d ?? label));
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <div className="font-medium text-gray-900">{when}</div>
        <div className="text-gray-600">Systolic: {row.sys} mmHg</div>
        <div className="text-gray-600">Diastolic: {row.dia} mmHg</div>
      </div>
    );
  };

  // Scroll width + right-arrow hint
  const pointWidth = view === "year" ? 80 : view === "day" ? 56 : 40;
  const minChartWidth = Math.max((chartData?.length || 0) * pointWidth, 640);
  const needsScroll = (chartData?.length || 0) > (view === "year" ? 8 : 15);

  const today = new Date();
  const isThisMonth = monthPick === monthKey(today);
  const todayX = today.getDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Health Overview</h1>
          <p className="text-gray-600">Comprehensive health monitoring and AI-powered insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDEBAR */}
          <div className="space-y-6">
            {/* MONTHLY AI INSIGHTS */}
            <div className="bg-gradient-to-br from-blue-400 to-purple-300 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">MONTHLY AI INSIGHTS</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpenMonthly((v) => !v)}
                  className="text-white hover:bg-white/20"
                >
                  {openMonthly ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              <div className={openMonthly ? "block" : "line-clamp-3"}>
                {aiMonthBusy && <AILoading lines={4} />}
                {!aiMonthBusy && aiMonthErr && (
                  <div className="text-red-200 bg-red-500/20 p-3 rounded-lg border border-red-300/30">
                    AI analysis unavailable: {aiMonthErr}
                  </div>
                )}
                {!aiMonthBusy && (
                  <div className="space-y-2 text-sm leading-relaxed">
                    {(aiMonthText || monthInsights(samples, monthPick).map((b) => `• ${b}`).join("\n"))
                      .split("\n")
                      .map((line, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ __html: aiToHTML(line) }} />
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* MONTHLY AVERAGES */}
            <div className="bg-gradient-to-br from-blue-400 to-purple-300 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">MONTHLY AVERAGES</h3>
                <select
                  className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={monthPick || ""}
                  onChange={(e) => setMonthPick(e.target.value)}
                >
                  {months.map((m) => (
                    <option key={m} value={m} className="text-gray-900">
                      {new Date(m + "-01").toLocaleString(undefined, { month: "long", year: "numeric" })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {(["Blood Pressure", "Heart Rate", "Blood Sugar", "SpO2", "Temperature"] as HOVitalKey[]).map((k) => {
                  const monthData = buildDailySeries(samples, k, monthPick);
                  const IconComponent = vitalIcons[k];

                  let label = "—";
                  let unit = "";
                  let unitColor = "text-green-400";

                  if (k === "Blood Pressure") {
                    const sys = Math.round(avg(monthData.map((p) => p.sys ?? NaN)));
                    const dia = Math.round(avg(monthData.map((p) => p.dia ?? NaN)));
                    if (Number.isFinite(sys) && Number.isFinite(dia)) {
                      label = `${sys}/${dia}`;
                      unit = "mmHg";
                      if (sys >= 160 || dia >= 100) unitColor = "text-red-400";
                      else if (sys >= 140 || dia >= 90) unitColor = "text-yellow-400";
                    }
                  } else {
                    const v = avg(monthData.map((p) => p.value ?? NaN));
                    if (Number.isFinite(v)) {
                      switch (k) {
                        case "Heart Rate":
                          label = `${Math.round(v)}`;
                          unit = "BPM";
                          if (v > 100 || v < 60) unitColor = "text-yellow-400";
                          break;
                        case "SpO2":
                          label = `${Math.round(v)}`;
                          unit = "%";
                          if (v < 92) unitColor = "text-red-400";
                          else if (v < 95) unitColor = "text-yellow-400";
                          break;
                        case "Blood Sugar":
                          label = `${Math.round(v)}`;
                          unit = "mg/dL";
                          if (v >= 200) unitColor = "text-red-400";
                          else if (v >= 180) unitColor = "text-yellow-400";
                          break;
                        case "Temperature":
                          label = `${(v as number).toFixed(1)}`;
                          unit = "°C";
                          if (v >= 38.0) unitColor = "text-yellow-400";
                          break;
                      }
                    }
                  }

                  return (
                    <div key={k} className="bg-white rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">AVG</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="text-gray-900 font-medium text-sm">{k}</div>
                        <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                          {label}
                          <span className={`text-sm font-normal ${unitColor}`}>{unit}</span>
                        </div>
                      </div>

                      <div className="mb-3">{k === "Blood Pressure" ? <SparklineBP data={monthData} /> : <Sparkline data={monthData} />}</div>

                      <Button
                        className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-full py-2 text-sm font-medium"
                        size="sm"
                        onClick={() => {
                          setSelected(k);
                          // if user immediately switches to Daily later, selDay is already 'today'
                        }}
                      >
                        SEE MORE
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: chart & summaries */}
          <div className="lg:col-span-2 space-y-6">
            {/* HEALTH STATISTICS CHART */}
            <div className="bg-white rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">HEALTH STATISTICS</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{yearLabel}</span>
                    <div className="flex items-center gap-2">
                      {[
                        { key: "day", label: "Daily" },
                        { key: "month", label: "Monthly" },
                        { key: "year", label: "Annually" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setView(key as "day" | "month" | "year")}
                          className={`px-3 py-1 rounded-full text-xs ${
                            view === key ? "bg-[#1e293b] text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Day picker (only in Daily view) */}
                    {view === "day" && (
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          aria-label="Previous day"
                          className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs"
                          onClick={() => setSelDay((d) => clamp((d || 1) - 1, 1, daysInSelectedMonth))}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <select
                          className="bg-white rounded-full px-3 py-1 text-xs border border-gray-200 text-gray-700"
                          value={clamp(selDay || 1, 1, daysInSelectedMonth)}
                          onChange={(e) => setSelDay(clamp(parseInt(e.target.value, 10), 1, daysInSelectedMonth))}
                        >
                          {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              {String(d).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <button
                          aria-label="Next day"
                          className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs"
                          onClick={() => setSelDay((d) => clamp((d || 1) + 1, 1, daysInSelectedMonth))}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {selected && (
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {selected === "Blood Pressure" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                          <span>Systolic</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                          <span>Diastolic</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                        <span>{selected}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {(selected || "Blood Pressure") + " — " + (view === "year" ? "Annually" : view === "day" ? "Daily" : "Monthly")}
                </h4>

                <div className="h-[300px] relative">
                  {!selected && (
                    <div className="absolute inset-0 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <div className="text-lg font-medium text-gray-600 mb-1">Select a Vital Sign</div>
                        <div className="text-sm text-gray-500">Choose from the vitals panel to view detailed trends</div>
                      </div>
                    </div>
                  )}

                  {selected && (
                    <div className="absolute inset-0">
                      {/* Horizontal scroll container */}
                      <div className="h-full w-full overflow-x-auto pr-10">
                        <div style={{ minWidth: minChartWidth, height: "100%" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            {selected === "Blood Pressure" ? (
                              <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="d"
                                  tick={{ fontSize: 12, fill: "#64748b" }}
                                  axisLine={{ stroke: "#e2e8f0" }}
                                  tickFormatter={formatXTick}
                                />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} domain={[60, 190]} />
                                <Tooltip content={(props) => <BPTooltipComp {...props} />} />
                                {view === "month" && isThisMonth && <ReferenceLine x={todayX} stroke="#8b5cf6" strokeDasharray="2 2" />}
                                <Area type="monotone" dataKey="sys" stroke="#8b5cf6" fill="#8b5cf6" opacity={0.1} />
                                <Area type="monotone" dataKey="dia" stroke="#f59e0b" fill="#f59e0b" opacity={0.1} />
                                <Line
                                  type="monotone"
                                  dataKey="sys"
                                  stroke="#8b5cf6"
                                  strokeWidth={3}
                                  dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="dia"
                                  stroke="#f59e0b"
                                  strokeWidth={3}
                                  dot={{ fill: "#f59e0b", strokeWidth: 0, r: 4 }}
                                />
                              </ComposedChart>
                            ) : (
                              <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="d"
                                  tick={{ fontSize: 12, fill: "#64748b" }}
                                  axisLine={{ stroke: "#e2e8f0" }}
                                  tickFormatter={formatXTick}
                                />
                                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} />
                                <Tooltip content={(props) => <GenericTooltipComp {...props} />} />
                                {view === "month" && isThisMonth && <ReferenceLine x={todayX} stroke="#8b5cf6" strokeDasharray="2 2" />}
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" opacity={0.15} />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#8b5cf6"
                                  strokeWidth={3}
                                  dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 4 }}
                                />
                              </AreaChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Right arrow hint */}
                      {needsScroll && (
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 flex items-center justify-center">
                          <div className="h-24 w-full bg-gradient-to-l from-white to-transparent rounded-l-lg flex items-center justify-center animate-pulse">
                            <ChevronRight className="text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: AI INSIGHTS + SUGGESTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* AI INSIGHTS */}
              <div className="bg-gradient-to-br from-purple-400 to-orange-300 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">AI INSIGHTS</h3>
                </div>

                <div className="space-y-3">
                  {aiBusy && <AILoading lines={5} />}
                  {!aiBusy && aiError && (
                    <div className="text-red-200 bg-red-500/20 p-3 rounded-lg border border-red-300/30">
                      AI analysis unavailable: {aiError}
                    </div>
                  )}
                  {!aiBusy && (
                    <div className="text-sm leading-relaxed">
                      {(
                        aiInsights && aiInsights.trim().length
                          ? aiInsights
                          : selected
                            ? selectedInsights(samples, selected).map(s => `• ${s}`).join("\n")
                            : "—"
                      )
                        .split("\n")
                        .map((line, i) => (
                          <div key={i} dangerouslySetInnerHTML={{ __html: aiToHTML(line) }} />
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SUGGESTIONS BY AI */}
              <div className="bg-gradient-to-br from-purple-400 to-orange-300 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ChevronUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">SUGGESTIONS BY AI</h3>
                </div>

                <div className="space-y-3">
                  {aiBusy && <AILoading lines={5} />}
                  {!aiBusy && aiError && (
                    <div className="text-red-200 bg-red-500/20 p-3 rounded-lg border border-red-300/30">
                      AI recommendations unavailable: {aiError}
                    </div>
                  )}
                  {!aiBusy && !aiError && (
                    <div className="text-sm leading-relaxed">
                      {(aiSuggestions || (selected ? "Select a vital sign to view personalized recommendations." : "—"))
                        .split("\n")
                        .map((line, i) => (
                          <div key={i} dangerouslySetInnerHTML={{ __html: aiToHTML(line) }} />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthOverview;
