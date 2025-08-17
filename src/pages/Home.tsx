// src/pages/Home.tsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  ChevronRightCircle,
  Calendar as CalendarIcon,
  CircleAlert,
  MessageCircle,
  MessageCircleQuestion,
  SmilePlus,
  Plus,
} from "lucide-react";


type Task = { id: string; label: string; done: boolean };

const WelcomePanel: React.FC<{
  tasks: Task[];
  onToggle: (id: string) => void;
}> = ({ tasks, onToggle }) => {
  const completed = tasks.filter(t => t.done).length;
  const pct = Math.round((completed / tasks.length) * 100) || 0;

  return (
    // move green bg to Card so we can control inner padding precisely
    <Card className="h-full shadow-sm border-0 bg-[linear-gradient(270deg,_#bdd3d1ff_0%,_#CEE2E0_30%)]">
      {/* trim bottom padding to remove green gap under the white panel */}
      <CardContent className="px-6 pt-6 pb-2 md:pb-1 flex flex-col md:flex-row gap-6 bg-transparent">
        {/* Left: greeting + progress */}
        <div className="flex-1 rounded-xl p-6 bg-transparent">
          <div className="text-2xl md:text-3xl font-semibold text-foreground">Good Morning, Bella</div>
          <p className="text-sm text-muted-foreground mt-2">
            You have <span className="font-semibold">{tasks.length - completed}</span> Health Tasks remaining for today
          </p>
          <div className="mt-6 h-2 w-full rounded-full" style={{ backgroundColor: '#F2F5FA' }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: '#304E4D' }}
            />
          </div>
        </div>

        {/* Right: Today checklist (no extra margin at bottom) */}
        <div className="flex-1 border rounded-xl p-6 bg-card md:self-stretch mb-0">
          <div className="font-medium text-foreground mb-4">Today</div>
          <div className="space-y-3">
            {tasks.slice(0, 3).map(t => (
              <label key={t.id} className="flex items-center gap-3 cursor-pointer">
                <Checkbox checked={t.done} onCheckedChange={() => onToggle(t.id)} />
                <span className="text-sm">{t.label}</span>
              </label>
            ))}
            {tasks.length > 3 && (
              <div className="text-sm text-muted-foreground italic">and {tasks.length - 3} others</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const VitalsCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="h-full shadow-sm" style={{ background: 'linear-gradient(0deg, #fcd4d2ff 0%, #ffdad8ff 30%, #fff2f1ff 60%)' }}>
      <CardHeader>
        <CardTitle className="text-lg font-bold">Check-In Your Vitals</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Blood Pressure</div>
            <div className="text-2xl font-semibold">110/78</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Heart Rate</div>
            <div className="text-2xl font-semibold">90</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">SpO2</div>
            <div className="text-2xl font-semibold">90</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Temperature</div>
            <div className="text-2xl font-semibold">36</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t" style={{ borderTop: '2px solid rgba(255, 255, 255, 1)', borderColor: '#efc4c1ff' }}>
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm">
              <div className="text-sm text-muted-foreground">Blood Sugar</div>
              <div className="flex items-center gap-2">
                <CircleAlert className="w-4 h-4" style={{ color: 'rgba(169, 24, 24, 1)' }} />
                <span className="font-bold" style={{ color: 'rgba(169, 24, 24, 1)' }}>Needs update</span>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90"
              onClick={() => navigate("/vitals")}
            >
              Check-In Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MedBotCard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card
      className="h-full shadow-sm cursor-pointer"
      style={{ background: "linear-gradient(0deg, #e8eaff 0%, #f2f8ffff 50%)" }}
      onClick={() => navigate("/medbot")}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-bold">
          <MessageCircle className="w-5 h-5" />
          MedBot
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="rounded-xl border p-4" style={{ backgroundColor: "#ffffffff" }}>
          <div className="text-xs text-muted-foreground mb-3 flex items-center justify-between">
            <span>512 CONVERSATIONS</span>
            <span className="underline">SEE ALL</span>
          </div>

          <div className="rounded-lg bg-card p-4 shadow-sm border mb-3" style={{ backgroundColor: "#F2F5FA" }}>
            <div className="flex items-start gap-3">
              <Plus className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm">
                <strong>Absolutely!</strong> Let's make it easier for you to monitor your nutrition.
              </p>
            </div>
            <p className="text-sm mt-2">I'll set up a food diary for you to record your meals and snacks! 💪</p>
          </div>

          {/* Keeps the look; clicking/focusing will navigate */}
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border bg-card px-3 py-2 text-sm outline-none"
              placeholder="Reply to AI chatbot…"
              readOnly
            />
            <Button size="icon" className="rounded-full bg-foreground text-background hover:bg-foreground/90">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const MiniCalendar: React.FC = () => {
  const navigate = useNavigate();

  // Use today's date
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1)); // first day of current month
  const month = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    const days: (Date | null)[] = [];
    const pad = (start.getDay() + 6) % 7; // Monday-first grid
    for (let i = 0; i < pad; i++) days.push(null);
    for (let d = 1; d <= end.getDate(); d++) days.push(new Date(y, m, d));
    return { y, m, days };
  }, [cursor]);

  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(cursor);

  // Build a reasonable year range (currentYear-5 ... currentYear+5)
  const currentYear = today.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Daily Medicine Schedule</CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate("/medication")}>
            + Add Meds
          </Button>
        </div>

        {/* Year picker (replaces Monthly/Daily buttons) */}
        <div className="flex items-center gap-3 mt-2">
          <label className="text-sm text-muted-foreground">Year</label>
          <select
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={month.y}
            onChange={(e) => setCursor(new Date(Number(e.target.value), month.m, 1))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium text-lg">{monthLabel}</div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCursor(new Date(month.y, month.m - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCursor(new Date(month.y, month.m + 1, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground mb-2">
          {["M","T","W","T","F","S","S"].map((d) => (
            <div key={d} className="text-center font-medium">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {month.days.map((d, i) => {
            if (!d) return <div key={i} />;
            const isToday =
              d.getDate() === today.getDate() &&
              d.getMonth() === today.getMonth() &&
              d.getFullYear() === today.getFullYear();

            return (
              <div
                key={i}
                className={[
                  "aspect-square rounded-full flex items-center justify-center text-sm cursor-pointer transition-colors",
                  isToday ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted",
                ].join(" ")}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>

        {/* Schedule preview */}
        <div className="mt-6 space-y-3">
          {/* Green pill */}
          <button
            onClick={() => navigate("/medication")}
            className="w-full flex items-center justify-between rounded-xl p-3 border text-left transition hover:shadow-sm"
            style={{ background: "linear-gradient(270deg, #bde4d2ff 0%, #E8F7F0 30%)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E8F7F0" }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#70b188ff" }} />
              </div>
              <div>
                <div className="text-sm font-medium">Take Insulin</div>
                <div className="text-xs text-muted-foreground">10:00pm – 12:00pm</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Orange pill */}
          <button
            onClick={() => navigate("/medication")}
            className="w-full flex items-center justify-between rounded-xl p-3 border text-left transition hover:shadow-sm"
            style={{ background: "linear-gradient(270deg, #ffd396ff 0%, #ffe6c9ff 30%)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#ffe6c9ff" }}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#F59E0B" }} />
              </div>
              <div>
                <div className="text-sm font-medium">Take BP meds</div>
                <div className="text-xs text-muted-foreground">09:00am – 10:00am</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Link to medication page */}
          <div
            className="flex items-center gap-2 mt-4 text-sm font-medium text-foreground cursor-pointer select-none"
            onClick={() => navigate("/medication")}
          >
            <span>See More Schedule</span>
            <ChevronRight className="w-4 h-4" />
          </div>

          <div className="mt-4 flex justify-end">
            <img
              src="/src/assets/medicine-cuate.png"
              alt="Medicine illustration"
              className="w-35 md:w-48 lg:w-56 h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


import type { LucideIcon } from 'lucide-react';

const QuickTiles: React.FC = () => {
  const navigate = useNavigate();
  const tiles: { title: string; subtitle: string; Icon: LucideIcon; path: string }[] = [
    { title: 'Questions for Doctor', subtitle: 'Check out', Icon: MessageCircleQuestion, path: '/questions' },
    { title: "Mental Health", subtitle: "Write today's reflection in", Icon: SmilePlus, path: '/mental-health' },
    { title: 'Exercise & Wellness', subtitle: 'Tips on', Icon: Dumbbell, path: '/exercise' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {tiles.map(({ title, subtitle, Icon, path }, index) => (
        <Card
          key={index}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-card border"
        >
          <div className="text-sm text-muted-foreground mb-2">{subtitle}</div>
          <div className="text-lg font-medium mb-4">{title}</div>
          <div
            className="h-16 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: '#ede2f4ff' }}
          >
            <Icon className="w-7 h-7 text-foreground/70" aria-hidden="true" />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={() => navigate(path)}
          >
            Try it Now
          </Button>
        </Card>
      ))}
    </div>
  );
};

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', label: "Update today's Blood Sugar", done: false },
    { id: 't2', label: 'Mental Health Reflection', done: false },
    { id: 't3', label: 'Take Medications', done: false },
    { id: 't4', label: 'Log Weight', done: false },
    { id: 't5', label: 'Record Temperature', done: false },
    { id: 't6', label: 'Check Heart Rate', done: false },
  ]);

  const navigate = useNavigate();
  const toggle = (id: string) => setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-grey-50 to-orange-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Home
        </h1>
        <p className="text-gray-600">
          Stay organized with daily tasks, vital check-ins, medication reminders, and others all at a glance
        </p>
      </div>

      {/* remove top padding on main so header and first card connect seamlessly */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Row 1: Welcome (2 cols) + Calendar (1 col spanning 3 rows) */}
          <div className="lg:col-span-2">
            <WelcomePanel tasks={tasks} onToggle={toggle} />
          </div>
          <div className="lg:row-span-3">
            <MiniCalendar />
          </div>

          {/* Row 2: Vitals + MedBot */}
          <VitalsCard />
          <MedBotCard />

          {/* Row 3: QuickTiles spanning BOTH left columns */}
          <div className="lg:col-span-2">
            <QuickTiles />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
