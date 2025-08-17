import React from "react";
import SpecialtyTabs from "@/components/SpecialtyTabs";
import QuestionsList from "@/components/QuestionsList";
import MedBotSmallVer from "@/components/MedBotSmallVer";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCw } from "lucide-react";

/** ---------- SEA-LION (same creds style as HealthOverview.tsx) ---------- */
const SEA_LION_KEY = "sk-TSbEBjqQN9HKMcutANxL5A";
const SEA_LION_URL = "https://api.sea-lion.ai/v1/chat/completions";
const SEA_LION_MODEL = "aisingapore/Llama-SEA-LION-v3-70B-IT";

async function seaLionChatJSON(prompt: string, signal?: AbortSignal): Promise<any> {
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
      max_completion_tokens: 700,
      temperature: 0.25,
      messages: [
        {
          role: "system",
          content:
            "You are a careful health coach. Output MUST be valid, minified JSON with no commentary. " +
            "No diagnosis. Keep questions concise and patient-friendly.",
        },
        { role: "user", content: prompt },
      ],
    }),
    signal,
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message || r.statusText);
  const text = (data?.choices?.[0]?.message?.content ?? "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!m) throw new Error("AI did not return JSON");
    return JSON.parse(m[0]);
  }
}

/** ---------- Types & storage ---------- */
export type Question = {
  id: string;
  text: string;
  checked: boolean;
  createdAt: number;
  updatedAt: number;
  source?: "ai" | "user" | "medbot";
};

type QState = {
  version: number;
  specialties: string[];
  active: string; // active specialty name
  questions: Record<string, Question[]>;
};

const QS_KEY = "mediplus.questions.v2";

/** ---------- Helpers ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_SPECIALTIES = [
  "General Doctor",
  "Cardiologist",
  "Endocrinologist",
  "Psychiatrist",
  "Pulmonologist",
  "Dietitian",
];

function loadState(): QState {
  try {
    const obj = JSON.parse(localStorage.getItem(QS_KEY) || "null");
    if (obj?.version === 2 && obj?.specialties && obj?.questions) return obj;
  } catch (_e) {}
  const first = DEFAULT_SPECIALTIES[0];
  const blank: QState = {
    version: 2,
    specialties: [...DEFAULT_SPECIALTIES],
    active: first,
    questions: Object.fromEntries(DEFAULT_SPECIALTIES.map((s) => [s, []])),
  };
  localStorage.setItem(QS_KEY, JSON.stringify(blank));
  return blank;
}

function saveState(s: QState) {
  localStorage.setItem(QS_KEY, JSON.stringify(s));
}

/** ---------- Context collector (pulls data already saved by your app) ---------- */
const HO_SAMPLES_KEY = "mediplus.samples"; // from HealthOverview.tsx
// Optional context keys you may already use elsewhere:
const JOURNAL_KEY = "mediplus.journal.entries";
const MOOD_KEY = "mediplus.mood.log";
const SYMPTOMS_KEY = "mediplus.symptoms";
const CHAT_MEDBOT_KEY = "mediplus.chat.medbot";
const CHAT_MINDFUL_KEY = "mediplus.chat.mindfulbot";

function readLS<T = any>(k: string, fallback: any = []): T {
  try {
    return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

// --- small date helper for clear, doctor-friendly references like "20 Mar 2025"
const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate = (ts: number) => {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
};

// --- thresholds to detect "talking points"
const TH = {
  bpHigh:   { sys: 140, dia: 90 },
  bpVery:   { sys: 160, dia: 100 },
  sugarHigh: 180,
  sugarVery: 200,
  spo2Low:   92,
  hrHigh:   100, // resting tachycardia hint (contextual)
  hrLow:     60, // bradycardia hint (contextual)
  fever:   38.0,
};

/**
 * Turn raw samples into "signals" (events worth asking about).
 * Works directly on the same store as HealthOverview.tsx: mediplus.samples
 */
function analyzeSamples(samples: any[]) {
  if (!samples?.length) {
    return { hasData:false, summary:"No vitals recorded.", signals:{} as any };
  }

  // last 90 days to gather meaningful questions
  const since = Date.now() - 90*86400000;
  const recent = samples.filter(s => s.ts >= since);

  const signals = {
    bloodPressure: {
      veryHighEpisodes: [] as {date:string, sys:number, dia:number}[],
      highEpisodes: [] as {date:string, sys:number, dia:number}[],
      avgSys: null as number | null,
      avgDia: null as number | null,
      lastVeryHigh: null as null | {date:string, sys:number, dia:number},
      medsMentioned: false, // toggled from journal/symptoms if we detect "bp meds"
    },
    bloodSugar: {
      veryHighDays: [] as {date:string, value:number}[],
      highDays: [] as {date:string, value:number}[],
      avg: null as number | null,
      lastVeryHigh: null as null | {date:string, value:number},
      medsMentioned: false, // from journal/symptoms if "insulin", "metformin", etc.
    },
    heartRate: {
      highDays: [] as {date:string, value:number}[],
      lowDays: [] as {date:string, value:number}[],
      avg: null as number | null,
    },
    spo2: {
      lowDays: [] as {date:string, value:number}[],
      avg: null as number | null,
    },
    temperature: {
      feverDays: [] as {date:string, value:number}[],
      avg: null as number | null,
    }
  };

  // accumulators for averages
  const acc:any = { sys:[] as number[], dia:[] as number[], sugar:[] as number[], hr:[] as number[], spo2:[] as number[], temp:[] as number[] };

  for (const s of recent) {
    const date = fmtDate(s.ts);
    switch (s.kind) {
      case "Blood Pressure": {
        const sys = Number(s.value?.sys ?? NaN);
        const dia = Number(s.value?.dia ?? NaN);
        if (Number.isFinite(sys) && Number.isFinite(dia)) {
          acc.sys.push(sys); acc.dia.push(dia);
          if (sys >= TH.bpVery.sys || dia >= TH.bpVery.dia) {
            signals.bloodPressure.veryHighEpisodes.push({ date, sys, dia });
            signals.bloodPressure.lastVeryHigh = { date, sys, dia };
          } else if (sys >= TH.bpHigh.sys || dia >= TH.bpHigh.dia) {
            signals.bloodPressure.highEpisodes.push({ date, sys, dia });
          }
        }
        break;
      }
      case "Blood Sugar": {
        const v = Number(s.value);
        if (Number.isFinite(v)) {
          acc.sugar.push(v);
          if (v >= TH.sugarVery) {
            signals.bloodSugar.veryHighDays.push({ date, value: v });
            signals.bloodSugar.lastVeryHigh = { date, value: v };
          } else if (v >= TH.sugarHigh) {
            signals.bloodSugar.highDays.push({ date, value: v });
          }
        }
        break;
      }
      case "Heart Rate": {
        const v = Number(s.value);
        if (Number.isFinite(v)) {
          acc.hr.push(v);
          if (v > TH.hrHigh) signals.heartRate.highDays.push({ date, value: v });
          if (v < TH.hrLow)  signals.heartRate.lowDays.push({ date, value: v });
        }
        break;
      }
      case "SpO2": {
        const v = Number(s.value);
        if (Number.isFinite(v)) {
          acc.spo2.push(v);
          if (v < TH.spo2Low) signals.spo2.lowDays.push({ date, value: v });
        }
        break;
      }
      case "Temperature": {
        const v = Number(s.value);
        if (Number.isFinite(v)) {
          acc.temp.push(v);
          if (v >= TH.fever) signals.temperature.feverDays.push({ date, value: v });
        }
        break;
      }
    }
  }

  const avg = (a:number[]) => a.length ? Math.round(10*(a.reduce((p,c)=>p+c,0)/a.length))/10 : null;
  signals.bloodPressure.avgSys = avg(acc.sys);
  signals.bloodPressure.avgDia = avg(acc.dia);
  signals.bloodSugar.avg = avg(acc.sugar);
  signals.heartRate.avg = avg(acc.hr);
  signals.spo2.avg = avg(acc.spo2);
  signals.temperature.avg = acc.temp.length ? Math.round(10*(acc.temp.reduce((p,c)=>p+c,0)/acc.temp.length))/10 : null;

  const summary = [
    signals.bloodPressure.avgSys && signals.bloodPressure.avgDia ? `BP avg ~ ${signals.bloodPressure.avgSys}/${signals.bloodPressure.avgDia} mmHg` : null,
    signals.bloodSugar.avg ? `Glucose avg ~ ${signals.bloodSugar.avg} mg/dL` : null,
    signals.heartRate.avg ? `HR avg ~ ${signals.heartRate.avg} BPM` : null,
    signals.spo2.avg ? `SpO2 avg ~ ${signals.spo2.avg}%` : null,
    signals.temperature.avg ? `Temp avg ~ ${signals.temperature.avg} °C` : null,
  ].filter(Boolean).join("; ");

  return { hasData:true, summary, signals };
}

/** ---------- Build the payload the AI will see (vitals-first, no 'analyzed') ---------- */
function buildAIRequestPayload() {
  const samples = readLS<HOSample[]>(HO_SAMPLES_KEY, []);
  const latestMonth = latestMonthKeyFrom(samples);
  const monthStats = monthStatsForAI(samples, latestMonth);
  const specialtyHints = buildSpecialtyHints(monthStats);

  // Optional context from other parts of your app (safe if missing)
  const symptoms = readLS<any>(SYMPTOMS_KEY, {});
  const journal = readLS<any[]>(JOURNAL_KEY, []);
  const mood = readLS<any[]>(MOOD_KEY, []);
  const medbotRecent = readLS<any[]>(CHAT_MEDBOT_KEY, []).slice(-12);
  const mindfulRecent = readLS<any[]>(CHAT_MINDFUL_KEY, []).slice(-12);

  return {
    latestMonth,
    samplesSummary30d: summarizeSamples(samples),
    monthStats,         // same shape your HealthOverview.tsx uses
    specialtyHints,     // derived from monthStats (no analyzed/signals)
    symptoms,
    journalRecent: journal.slice(-10),
    moodRecent: mood.slice(-10),
    medbotRecent,
    mindfulRecent,
  };
}

/* ================== VITALS HELPERS (drop in once) ================== */
/* If these types/constants already exist in this file, remove the duplicates below. */
type HOVitalKey = "Blood Pressure" | "Heart Rate" | "Blood Sugar" | "SpO2" | "Temperature";
type BPSample = { sys: number; dia: number };
type HOSample = { ts: number; kind: HOVitalKey; value: number | BPSample };

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const avgNum = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const median = (arr: number[]) => {
  const a = arr.filter(Number.isFinite).slice().sort((x, y) => x - y);
  if (!a.length) return NaN;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
};
const rng = (a: number[]) => (a.length ? { min: Math.min(...a), max: Math.max(...a) } : { min: NaN, max: NaN });

/** ---- EXACTLY the same shape HealthOverview uses for its AI month stats ---- */
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

/** Newest "YYYY-MM" present in samples */
function latestMonthKeyFrom(samples: HOSample[]): string | null {
  if (!samples?.length) return null;
  const keys = Array.from(new Set(samples.map((s) => monthKey(new Date(s.ts)))));
  keys.sort();
  return keys[keys.length - 1] ?? null;
}

/** Compact last-30-days text summary (used as prompt hint) */
function summarizeSamples(samples: HOSample[]): string {
  if (!samples?.length) return "No vitals recorded.";
  const since = Date.now() - 30 * 86400000;
  const recent = samples.filter((s) => s.ts >= since);
  if (!recent.length) return "No recent vitals in last 30 days.";
  const acc = { sys: [] as number[], dia: [] as number[], su: [] as number[], hr: [] as number[], sp: [] as number[], te: [] as number[] };
  for (const s of recent) {
    if (s.kind === "Blood Pressure") { acc.sys.push((s.value as BPSample).sys); acc.dia.push((s.value as BPSample).dia); }
    else if (s.kind === "Blood Sugar") acc.su.push(s.value as number);
    else if (s.kind === "Heart Rate") acc.hr.push(s.value as number);
    else if (s.kind === "SpO2") acc.sp.push(s.value as number);
    else if (s.kind === "Temperature") acc.te.push(s.value as number);
  }
  const fmt = (x: number[]) => (x.length ? Math.round(avgNum(x)) : "—");
  return `BP ~ ${fmt(acc.sys)}/${fmt(acc.dia)} mmHg; Glucose ~ ${fmt(acc.su)} mg/dL; HR ~ ${fmt(acc.hr)}; SpO2 ~ ${fmt(acc.sp)}%; Temp ~ ${fmt(acc.te)}°C`;
}

/** Turn month-level stats into specialty “focus” hints the prompt can use */
function deriveConcernFlags(stats: ReturnType<typeof monthStatsForAI> | null) {
  if (!stats) {
    return {
      bpConcern: false,
      bpVeryHighDays: 0,
      sugarHigh: false,
      sugarVeryHighDays: 0,
      spo2Low: false,
      lowSpo2Days: 0,
      feverDays: 0,
      hrOutOfRange: false,
    };
  }
  const bpConcern = (stats.bloodPressure?.highDays ?? 0) > 0;
  const sugarHigh = (stats.bloodSugar?.highDays180 ?? 0) > 0 || (stats.bloodSugar?.veryHighDays200 ?? 0) > 0;
  const spo2Low = (stats.spo2?.lowDays92 ?? 0) > 0;
  const hr = stats.heartRate?.med ?? NaN;
  const hrOutOfRange = Number.isFinite(hr) ? (hr < 55 || hr > 100) : false;

  return {
    bpConcern,
    bpVeryHighDays: stats.bloodPressure?.veryHighDays ?? 0,
    sugarHigh,
    sugarVeryHighDays: stats.bloodSugar?.veryHighDays200 ?? 0,
    spo2Low,
    lowSpo2Days: stats.spo2?.lowDays92 ?? 0,
    feverDays: stats.temperature?.feverDays38 ?? 0,
    hrOutOfRange,
  };
}

function buildSpecialtyHints(stats: ReturnType<typeof monthStatsForAI> | null) {
  const f = deriveConcernFlags(stats);
  return {
    "General Doctor": {
      overview: true,
      flags: f,
    },
    Cardiologist: {
      focusBP: f.bpConcern || (stats?.bloodPressure?.avgSys ?? 0) >= 140,
      focusHR: f.hrOutOfRange,
      bpAvg: `${stats?.bloodPressure?.avgSys}/${stats?.bloodPressure?.avgDia}`,
      bpHighDays: stats?.bloodPressure?.highDays ?? 0,
      bpVeryHighDays: stats?.bloodPressure?.veryHighDays ?? 0,
    },
    Endocrinologist: {
      focusGlucose: f.sugarHigh,
      glucoseAvg: stats?.bloodSugar?.avg ?? null,
      glucoseVeryHighDays: stats?.bloodSugar?.veryHighDays200 ?? 0,
      glucoseHighDays180: stats?.bloodSugar?.highDays180 ?? 0,
    },
    Psychiatrist: {
      hrOutOfRange: f.hrOutOfRange,
      spo2Low: f.spo2Low,
      feverDays: f.feverDays,
    },
    Pulmonologist: {
      spo2Avg: stats?.spo2?.avg ?? null,
      lowDays92: stats?.spo2?.lowDays92 ?? 0,
    },
    Dietitian: {
      glucoseAvg: stats?.bloodSugar?.avg ?? null,
      glucoseSpikes: (stats?.bloodSugar?.veryHighDays200 ?? 0) + (stats?.bloodSugar?.highDays180 ?? 0),
      bpAvg: `${stats?.bloodPressure?.avgSys}/${stats?.bloodPressure?.avgDia}`,
    },
  };
}
/* ================== end helpers ================== */


/** ---------- AI prompts (patient POV, questions only) ---------- */
function questionsPromptForAllSpecialties(payload: any) {
  return (
    "You are generating a **patient-to-doctor** question bank for the user's next appointments.\n" +
    "Write **questions only** in first-person ('I', 'my'), each ending with a **question mark**.\n" +
    "Keep each ≤ 18 words, practical, and neutral. No advice, no diagnosis. Avoid medical jargon.\n" +
    "Use the 'signals' (events/dates) and 'summary' below to tailor what the patient might ask.\n" +
    "Specialties: General Doctor, Cardiologist, Endocrinologist, Psychiatrist, Pulmonologist, Dietitian.\n" +
    "If specific dates exist (e.g., very high BP on 20 Mar 2025), reference them.\n" +
    "If medication hints exist, include adherence/side-effect/adjustment questions.\n\n" +
    "CONTEXT:\n" +
    JSON.stringify(payload) +
    "\n\nRespond ONLY with minified JSON mapping specialties to arrays of strings, like:\n" +
    `{"General Doctor":["...?"],"Cardiologist":["...?"],"Endocrinologist":["...?"],"Psychiatrist":["...?"],"Pulmonologist":["...?"],"Dietitian":["...?" ]}`
  );
}

function questionsPromptForOneSpecialty(payload: any, specialty: string) {
  return (
    `Generate 5–8 **patient-to-doctor** questions for the ${specialty}.\n` +
    "Write **questions only** in first-person ('I', 'my'), each ending with a **question mark**.\n" +
    "Keep each ≤ 18 words, practical, and neutral. No advice, no diagnosis. Avoid medical jargon.\n" +
    "Use the 'signals' (events/dates) and 'summary' below to tailor what the patient might ask.\n" +
    "If specific dates exist (e.g., very high BP on 20 Mar 2025), reference them.\n" +
    "If medication hints exist, include adherence/side-effect/adjustment questions.\n\n" +
    "CONTEXT:\n" +
    JSON.stringify(payload) +
    `\n\nRespond ONLY with a minified JSON array of strings (questions ending with '?').`
  );
}

/** ---------- Page ---------- */
const QuestionsPage: React.FC = () => {
  const [state, setState] = React.useState<QState>(() => loadState());
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const active = state.active;
  const list = state.questions[active] || [];

  const save = React.useCallback((next: QState | ((s: QState) => QState)) => {
    setState((prev) => {
      const v = typeof next === "function" ? (next as any)(prev) : next;
      saveState(v);
      return v;
    });
  }, []);

  /** Tabs handlers (UI unchanged) */
  const selectTab = (name: string) => save((s) => ({ ...s, active: name }));
  const addSpecialty = async (name: string) => {
    save((s) => {
      if (s.specialties.includes(name)) return s;
      return {
        ...s,
        specialties: [...s.specialties, name],
        questions: { ...s.questions, [name]: [] },
        active: name,
      };
    });
    // auto-generate for new specialty (logic only)
    await generateForName(name);
  };
  const renameSpecialty = (oldName: string, newName: string) =>
    save((s) => {
      if (oldName === newName || s.specialties.includes(newName)) return s;
      const specialties = s.specialties.map((x) => (x === oldName ? newName : x));
      const questions = { ...s.questions, [newName]: s.questions[oldName] ?? [] };
      delete questions[oldName];
      const active = s.active === oldName ? newName : s.active;
      return { ...s, specialties, questions, active };
    });
  const deleteSpecialty = (name: string) =>
    save((s) => {
      const specialties = s.specialties.filter((x) => x !== name);
      const questions = { ...s.questions };
      delete questions[name];
      const active = s.active === name ? specialties[0] ?? "" : s.active;
      return { ...s, specialties, questions, active };
    });

  /** List handlers (UI unchanged) */
  const setList = (nextList: Question[]) =>
    save((s) => ({ ...s, questions: { ...s.questions, [active]: nextList } }));

  const addQuestion = (text: string, source: Question["source"] = "user") => {
    const now = Date.now();
    setList([
      ...list,
      { id: uid(), text: text.trim(), checked: false, createdAt: now, updatedAt: now, source },
    ]);
  };

  const insertMany = (arr: string[], source: Question["source"] = "ai") => {
    if (!arr?.length) return;
    const now = Date.now();

    // existing texts for dedupe (case/space-insensitive)
    const have = new Set(
      (state.questions[state.active] || []).map(q => q.text.trim().toLowerCase())
    );

    const items = arr
      .map((t) => String(t).trim())
      .filter(Boolean)
      .map((t) => (t.endsWith("?") ? t : `${t}?`)) // force question style
      .filter((t) => {
        const key = t.toLowerCase();
        if (have.has(key)) return false;
        have.add(key);
        return true;
      })
      .map((t) => ({ id: uid(), text: t, checked: false, createdAt: now, updatedAt: now, source }));

    if (!items.length) return;
    setList([...(state.questions[state.active] || []), ...items]);
  };

  /** AI generation */
  const abortRef = React.useRef<AbortController | null>(null);
  const isAbortError = (e: any) =>
    e?.name === "AbortError" || String(e?.message || "").toLowerCase().includes("abort");

  const generateAll = async () => {
    try {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setBusy(true);
      setError("");
      const payload = buildAIRequestPayload();
      const json = await seaLionChatJSON(questionsPromptForAllSpecialties(payload), ctrl.signal);

      const now = Date.now();
      save((s) => {
        const next = { ...s };
        for (const [spec, arr] of Object.entries(json || {})) {
          if (!next.specialties.includes(spec)) next.specialties.push(spec);
          const existing = next.questions[spec] ?? [];
          const existingSet = new Set(existing.map((q) => q.text.toLowerCase().trim()));
          const newbies: Question[] = (arr as any[])
            .map((t) => String(t).replace(/\s+/g, " ").trim())
            .filter((t) => !!t && !existingSet.has(t.toLowerCase()))
            .map((t) => ({ id: uid(), text: t, checked: false, createdAt: now, updatedAt: now, source: "ai" }));
          next.questions[spec] = [...existing, ...newbies];
        }
        return next;
      });
    } catch (e: any) {
      if (!isAbortError(e)) setError(e?.message || "Failed to generate");
    } finally {
      setBusy(false);
    }
  };

  const generateForActive = async () => {
    await generateForName(active);
  };

  const generateForName = async (name: string) => {
    try {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setBusy(true);
      setError("");
      const payload = buildAIRequestPayload();
      const json = await seaLionChatJSON(questionsPromptForOneSpecialty(payload, name), ctrl.signal);
      insertMany(json as string[], "ai");
    } catch (e: any) {
      if (!isAbortError(e)) setError(e?.message || "Failed to generate");
    } finally {
      setBusy(false);
    }
  };

  /** Auto pre-generate on first load (ONLY if all lists are empty) */
  React.useEffect(() => {
    const allEmpty = state.specialties.every((sp) => (state.questions[sp] ?? []).length === 0);
    if (!allEmpty) return;
    generateAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // once

  /** ---------------- UI (unchanged) ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Questions for Your Doctor</h1>
            <p className="text-gray-600">AI-generated, editable checklists tailored to your recent health data.</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
              onClick={generateForActive}
              disabled={busy || !active}
              title={`Generate more questions for ${active}`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate for {active || "—"}
            </Button>
            <Button
              variant="secondary"
              onClick={generateAll}
              disabled={busy}
              title="Generate across all specialties"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Generate All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_360px] gap-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <SpecialtyTabs
              tabs={state.specialties}
              active={active}
              onSelect={selectTab}
              onAdd={addSpecialty}
              onRename={renameSpecialty}
              onDelete={deleteSpecialty}
            />
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <QuestionsList
              items={list}
              onChange={setList}
              onAdd={(t) => addQuestion(t, "user")}
              busy={busy}
              error={error}
            />
          </div>

          <div className="bg-white rounded-2xl shadow p-0 overflow-hidden">
            <MedBotSmallVer
              onInsert={(arr) => insertMany(arr, "medbot")}
              activeSpecialty={active}
              seaLionConfig={{ SEA_LION_KEY, SEA_LION_MODEL, SEA_LION_URL }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionsPage;
