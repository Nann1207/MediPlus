import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import logo from "@/assets/mediplusLogo.png";
import { Link, NavLink, useLocation } from 'react-router-dom';

const linkBase = "text-foreground hover:text-primary transition-colors font-medium";
const active = "text-primary";

/* ===== SEA-LION (hardcoded) + translate helpers ===== */
const SEA_LION_ENDPOINT = 'https://api.sea-lion.ai/v1/chat/completions';
const SEA_LION_KEY = 'sk-Y8L5mwaeYGh4PSl2xXDbAA';

// SE Asia + region labels (menu shows labels only)
const LANGS = [
  { label: 'Indonesian', code: 'id' },
  { label: 'Malay', code: 'ms' },
  { label: 'Filipino', code: 'tl' },
  { label: 'Thai', code: 'th' },
  { label: 'Vietnamese', code: 'vi' },
  { label: 'Burmese', code: 'my' },
  { label: 'Khmer', code: 'km' },
  { label: 'Lao', code: 'lo' },
  { label: 'Tetum', code: 'tet' },
  { label: 'Chinese', code: 'zh' },
  { label: 'Tamil', code: 'ta' },
  { label: 'English', code: 'en' },
];

/* ---------- i18n caches / state ---------- */
const originalsMap = new WeakMap<Text, string>();               // per Text node original
const translateCache: Record<string, Record<string, string>> = Object.create(null); // lang -> (norm -> trans)
let translateInFlight: Promise<void> | null = null;
let translateQueued = false;
let isApplying = false;
let lastAppliedLang: string | null = null;

/* observer control */
let observerStarted = false;
let observer: MutationObserver | null = null;
let observerPaused = false;

/* indicator events */
const EVT_START = 'i18n:translateStart';
const EVT_END = 'i18n:translateEnd';
function dispatchTranslateStart() { window.dispatchEvent(new CustomEvent(EVT_START)); }
function dispatchTranslateEnd() { window.dispatchEvent(new CustomEvent(EVT_END)); }

/* watchdog (prevents stuck indicator) */
let watchdogTimer: number | null = null;
function armWatchdog(ms = 30000) {
  if (watchdogTimer) window.clearTimeout(watchdogTimer);
  watchdogTimer = window.setTimeout(() => {
    console.warn('[i18n] watchdog: forcing end state');
    translateInFlight = null;
    translateQueued = false;
    observerPaused = false;
    isApplying = false;
    dispatchTranslateEnd();
  }, ms);
}
function disarmWatchdog() {
  if (watchdogTimer) {
    window.clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
}

/* current run abort controller to allow cancel on refresh */
let currentAbort: AbortController | null = null;

/* ---------- utils ---------- */
function collectTextNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node.textContent?.trim() ?? '';
      if (!t) return NodeFilter.FILTER_REJECT;
      const el = node.parentElement;
      if (!el) return NodeFilter.FILTER_REJECT;
      const tag = el.tagName.toLowerCase();
      if (['script','style','code','pre','noscript'].includes(tag)) return NodeFilter.FILTER_REJECT;
      const cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  } as any);
  const out: Text[] = [];
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) out.push(n);
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

async function translateStrings(items: string[], target: string, signal?: AbortSignal): Promise<string[]> {
  const system = {
    role: 'system',
    content:
`You translate short UI strings precisely.
- Translate to the target language.
- Keep numbers, punctuation, emojis, and brand names.
- Return ONLY a JSON array of strings, same order/length as input.`,
  };
  const user = { role: 'user', content: JSON.stringify({ target, items }) };
  const res = await fetch(SEA_LION_ENDPOINT, {
    method: 'POST',
    signal,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${SEA_LION_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'aisingapore/Llama-SEA-LION-v3-70B-IT',
      temperature: 0.1,
      max_completion_tokens: 400,
      messages: [system, user],
    }),
  });
  if (!res.ok) throw new Error(`SEA LION error ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '[]';
  try {
    const arr = JSON.parse(text);
    return Array.isArray(arr) && arr.length === items.length ? arr : items;
  } catch {
    return items;
  }
}

async function withTimeout<T>(fn: (signal?: AbortSignal) => Promise<T>, ms = 25000, externalSignal?: AbortSignal): Promise<T> {
  const ctl = new AbortController();
  const onExternalAbort = () => ctl.abort();
  if (externalSignal) {
    if (externalSignal.aborted) ctl.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }
  const timer = setTimeout(() => ctl.abort(), ms);
  try { return await fn(ctl.signal); }
  finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
  }
}

async function translateUniques(items: string[], target: string, batchSize = 150, concurrency = 4, abortSignal?: AbortSignal) {
  if (!items.length) return [];
  const batches = chunk(items, batchSize);
  const out: string[] = [];
  for (let i = 0; i < batches.length; i += concurrency) {
    const slice = batches.slice(i, i + concurrency);
    const results = await Promise.all(
      slice.map(b => withTimeout((signal) => translateStrings(b, target, signal), 25000, abortSignal))
    );
    for (const r of results) out.push(...r);
  }
  return out;
}

function normalize(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

/* ---------- cancel everything (used on refresh) ---------- */
function cancelAllTranslations() {
  try { currentAbort?.abort(); } catch {}
  translateQueued = false;
  translateInFlight = null;
  isApplying = false;
  observerPaused = false;
  disarmWatchdog();
  dispatchTranslateEnd();
}

/* ---------- core translate ---------- */
async function translatePage(target: string, abortSignal?: AbortSignal) {
  if (!target) return;
  if (lastAppliedLang === target) return; // skip redundant

  const roots: Element[] = [
    document.querySelector('nav')!,
    document.querySelector('header')!,
    document.querySelector('main')!,
    document.getElementById('root')!,
    document.body
  ].filter(Boolean) as Element[];

  const nodes = Array.from(new Set(roots.flatMap(r => collectTextNodes(r))));
  if (!nodes.length) { lastAppliedLang = target; return; }

  // Snapshot originals once per Text node
  for (const n of nodes) if (!originalsMap.has(n)) originalsMap.set(n, n.textContent || '');

  const originals = nodes.map(n => originalsMap.get(n) ?? (n.textContent || ''));
  const normalized = originals.map(normalize);

  const cacheForLang = (translateCache[target] ||= Object.create(null));
  const unique = Array.from(new Set(normalized));
  const toTranslate = unique.filter(u => !(u in cacheForLang));

  if (toTranslate.length) {
    const firstSeen: Record<string, string> = Object.create(null);
    for (const s of originals) {
      const k = normalize(s);
      if (!(k in firstSeen)) firstSeen[k] = s;
    }
    const sourceBatch = toTranslate.map(k => firstSeen[k] ?? k);
    const translated = await translateUniques(sourceBatch, target, 150, 4, abortSignal);
    translated.forEach((t, i) => { cacheForLang[toTranslate[i]] = t; });
  }

  // Pause observer while applying to avoid feedback loops
  observerPaused = true;
  isApplying = true;

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      for (let i = 0; i < nodes.length; i++) {
        if (abortSignal?.aborted) break;
        const n = nodes[i];
        const key = normalized[i];
        const t = cacheForLang[key];
        if (t) n.textContent = t;
      }
      resolve();
    });
  });

  isApplying = false;
  lastAppliedLang = target;

  // small cooldown before re-enabling observer
  setTimeout(() => { observerPaused = false; }, 120);
}

/* ---------- session helper: only translate after user chooses ---------- */
function isSessionActive() {
  return sessionStorage.getItem('i18nActive') === '1';
}
function setSessionActive(active: boolean) {
  if (active) sessionStorage.setItem('i18nActive', '1');
  else sessionStorage.removeItem('i18nActive');
}

/* ---------- scheduler + indicator + abortable ---------- */
function scheduleTranslate(code: string, delay = 40) {
  if (translateInFlight) {
    translateQueued = true;
    return;
  }

  dispatchTranslateStart();
  armWatchdog(); // ensure we don't get stuck visible

  // create/replace abort controller for this run
  currentAbort = new AbortController();

  let timer: number | undefined;
  const kick = async () => {
    window.clearTimeout(timer);
    translateInFlight = (async () => {
      try {
        // wait for stable paint (double RAF)
        await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
        if (currentAbort?.signal.aborted) return;
        await translatePage(code, currentAbort?.signal);
      } catch (err) {
        if ((err as any)?.name !== 'AbortError') {
          console.error('[i18n] translate run failed', err);
        }
      } finally {
        translateInFlight = null;
        if (translateQueued) {
          translateQueued = false;
          scheduleTranslate(code, delay); // keep indicator up for the next run
        } else {
          disarmWatchdog();
          dispatchTranslateEnd();
        }
      }
    })();
  };

  timer = window.setTimeout(kick, delay);
}

async function applyLanguage(code: string) {
  if (!code) return;
  localStorage.setItem('lang', code);
  document.documentElement.setAttribute('lang', code);
  scheduleTranslate(code);
}

/* ---------- mutation observer ---------- */
function startMutationObserver(currentLangRef: React.MutableRefObject<string>) {
  if (observerStarted) return;
  observerStarted = true;

  observer = new MutationObserver(() => {
    if (observerPaused || isApplying) return;
    // Only run auto-translation after user has chosen a language this session
    if (isSessionActive()) scheduleTranslate(currentLangRef.current);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: false
  });
}

/* ---------- tiny nav indicator (right corner) ---------- */
function I18NIndicator() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onStart = () => setActive(true);
    const onEnd = () => setActive(false);
    window.addEventListener(EVT_START, onStart);
    window.addEventListener(EVT_END, onEnd);
    return () => {
      window.removeEventListener(EVT_START, onStart);
      window.removeEventListener(EVT_END, onEnd);
    };
  }, []);

  return (
    <div className="relative flex items-center">
      <div className="w-5 h-5">
        {active ? (
          <span
            className="block w-5 h-5 rounded-full border-2 border-muted-foreground/40 border-t-primary"
            style={{ animation: 'i18n-spin 1s linear infinite' }}
            aria-label="Translating"
            role="status"
          />
        ) : null}
      </div>
      <style>{`
        @keyframes i18n-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          span[role="status"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ===== end translate helpers ===== */

const Navigation = () => {
  const location = useLocation();
  const currentLangRef = useRef<string>(localStorage.getItem('lang') || 'en');

  // Cancel any in-flight translation when the page is being refreshed/closed.
  useEffect(() => {
    const onBeforeUnload = () => cancelAllTranslations();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // Initial mount: set lang attribute and start observer — DO NOT auto-translate.
  useEffect(() => {
    document.documentElement.setAttribute('lang', currentLangRef.current);
    startMutationObserver(currentLangRef);
    // No scheduleTranslate here: we only translate after the user explicitly chooses a language
  }, []);

  // Route change: translate only if user chose a language this session.
  useEffect(() => {
    if (isSessionActive()) {
      const lang = currentLangRef.current;
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          scheduleTranslate(lang);
        });
      });
      return () => cancelAnimationFrame(raf1);
    }
  }, [location.pathname]);

  const handleLanguage = async (code: string) => {
    document.body.style.cursor = 'progress';
    try {
      if (!code) return;
      currentLangRef.current = code;
      lastAppliedLang = null;          // allow applying new language
      setSessionActive(true);          // user opted in for this session
      await applyLanguage(code);
    } catch (e) {
      console.error(e);
      alert('Translation failed. Please try again.');
    } finally {
      document.body.style.cursor = 'default';
    }
  };

  const healthMenuItems = [
    { title: 'Vitals', description: 'Track vital signs', to: '/vitals' },
    { title: 'Medication', description: 'Manage your medications', to: '/medication' },
    { title: 'Health Overview', description: 'Your complete health dashboard', to: '/HealthOverview' },
    { title: 'MedBot', description: 'AI-powered medical assistance', to: '/medbot' },
  ];
  const mentalHealthMenuItems = [
    { title: 'Mood Tracker', description: 'Track your mood daily', to: '/moodtracker' },
    { title: 'Reflection Journal', description: 'Daily reflection and journaling', to: '/journal' },
    { title: 'MindfulBot', description: 'AI mindfulness companion', to: '/mindfulbot' },
    { title: 'Mental Health Overview', description: 'Track your mental wellness', to: '/MentalHealthOverview' },
    { title: 'Resources', description: 'Mental health resources', to: '/resources' },
  ];

  const itemHover =
    "hover:bg-purple-100/70 hover:text-purple-900 " +
    "focus:bg-purple-100/70 focus:text-purple-900 " +
    "data-[highlighted]:bg-purple-100 data-[highlighted]:text-purple-900";

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo → landing */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden shadow-none ring-0 border-0 focus-visible:outline-none">
              <img src={logo} alt="MediPlus logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-primary">MediPlus</span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/home" className={({ isActive }) => [linkBase, isActive ? active : ""].join(" ")}>
              Home
            </NavLink>

            {/* Health Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors font-medium">
                  <span>Health</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="nav-dropdown w-70">
                {healthMenuItems.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <Link
                      to={item.to}
                      className={`p-3 rounded-md focus:outline-none flex flex-col text-left ${itemHover}`} 
                    >
                      <div className="font-semibold text-foreground text-base">{item.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 whitespace-normal leading-snug">
                        {item.description}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink to="/exercise" className={({ isActive }) => [linkBase, isActive ? active : ""].join(" ")}>
              Exercise & Wellness
            </NavLink>

            {/* Mental Health Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors font-medium">
                  <span>Mental Health</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="nav-dropdown w-50">
                {mentalHealthMenuItems.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <Link
                      to={item.to}
                      className={`p-3 rounded-md focus:outline-none flex flex-col text-left ${itemHover}`}
                    >
                      <div className="font-semibold text-foreground text-base">{item.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 whitespace-normal leading-snug">
                        {item.description}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink to="/questions" className={({ isActive }) => [linkBase, isActive ? active : ""].join(" ")}>
              Questions for Doctor
            </NavLink>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* tiny translating indicator */}
            <I18NIndicator />

            {/* Languages dropdown (labels only) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Globe className="w-4 h-4 mr-2" />
                  Languages
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="nav-dropdown w-35">
                {LANGS.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    className={`py-2 px-3 text-left whitespace-normal break-words leading-snug rounded-md ${itemHover}`}
                    onClick={() => handleLanguage(l.code)}
                  >
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block font-medium">Bella Swan</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="nav-dropdown w-38">
                <DropdownMenuItem className={`p-3 rounded-md ${itemHover}`}>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem className={`p-3 rounded-md ${itemHover}`} asChild>
                  <Link to="/home">Health Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className={`p-3 rounded-md ${itemHover}`}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
