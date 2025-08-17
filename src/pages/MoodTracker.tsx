import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  TrendingUp,
  Brain,
  Heart,
  BarChart3,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Target,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,          
  ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

import moodHeroImage from "@/assets/moodtracking.svg";

const PURPLE = "#717EF3";

// ---------- SEA-LION (optional for AI suggest mood) ----------
const AI_ENDPOINT = "https://api.sea-lion.ai/v1/chat/completions";
const AI_MODEL = "aisingapore/Llama-SEA-LION-v3-70B-IT";
// Put your dev key here if you insist on client-side during local dev.
// In production, proxy this on your server!
const AI_KEY = "sk-Y8L5mwaeYGh4PSl2xXDbAA";

// ---------- Emotion Types ----------
type EmotionType =
  | "ecstatic" | "joyful" | "content" | "peaceful" | "optimistic" | "grateful"
  | "neutral" | "bored" | "tired"
  | "stressed" | "anxious" | "worried" | "frustrated" | "angry" | "sad" | "lonely" | "overwhelmed" | "hopeless";

interface Emotion {
  id: EmotionType;
  name: string;
  emoji: string;
  color: string;
  intensity: number; // 1-10 scale
  category: "positive" | "neutral" | "negative";
}

const emotions: Emotion[] = [
  { id: "ecstatic", name: "Ecstatic", emoji: "🤩", color: "hsl(var(--mood-ecstatic))", intensity: 10, category: "positive" },
  { id: "joyful", name: "Joyful", emoji: "😄", color: "hsl(var(--mood-joyful))", intensity: 9, category: "positive" },
  { id: "content", name: "Content", emoji: "😊", color: "hsl(var(--mood-content))", intensity: 8, category: "positive" },
  { id: "peaceful", name: "Peaceful", emoji: "😌", color: "hsl(var(--mood-peaceful))", intensity: 7, category: "positive" },
  { id: "optimistic", name: "Optimistic", emoji: "🙂", color: "hsl(var(--mood-optimistic))", intensity: 7, category: "positive" },
  { id: "grateful", name: "Grateful", emoji: "🙏", color: "hsl(var(--mood-grateful))", intensity: 8, category: "positive" },

  { id: "neutral", name: "Neutral", emoji: "😐", color: "hsl(var(--mood-neutral))", intensity: 5, category: "neutral" },
  { id: "bored", name: "Bored", emoji: "😑", color: "hsl(var(--mood-bored))", intensity: 4, category: "neutral" },
  { id: "tired", name: "Tired", emoji: "😴", color: "hsl(var(--mood-tired))", intensity: 4, category: "neutral" },

  { id: "stressed", name: "Stressed", emoji: "😰", color: "hsl(var(--mood-stressed))", intensity: 3, category: "negative" },
  { id: "anxious", name: "Anxious", emoji: "😟", color: "hsl(var(--mood-anxious))", intensity: 2, category: "negative" },
  { id: "worried", name: "Worried", emoji: "😕", color: "hsl(var(--mood-worried))", intensity: 3, category: "negative" },
  { id: "frustrated", name: "Frustrated", emoji: "😤", color: "hsl(var(--mood-frustrated))", intensity: 2, category: "negative" },
  { id: "angry", name: "Angry", emoji: "😡", color: "hsl(var(--mood-angry))", intensity: 1, category: "negative" },
  { id: "sad", name: "Sad", emoji: "😢", color: "hsl(var(--mood-sad))", intensity: 2, category: "negative" },
  { id: "lonely", name: "Lonely", emoji: "😔", color: "hsl(var(--mood-lonely))", intensity: 2, category: "negative" },
  { id: "overwhelmed", name: "Overwhelmed", emoji: "😵", color: "hsl(var(--mood-overwhelmed))", intensity: 1, category: "negative" },
  { id: "hopeless", name: "Hopeless", emoji: "😞", color: "hsl(var(--mood-hopeless))", intensity: 1, category: "negative" },
];

interface MoodEntry {
  id: string;
  emotion: EmotionType;
  date: string;
  time: string;
  notes?: string;
  triggers?: string[];
}

// ---------- Sample notes to replace the old placeholder ----------
const SAMPLE_NOTES = [
  "Felt calm after a short walk",
  "Energy dipped post-lunch",
  "Better after talking to a friend",
  "Slept late, a bit groggy",
  "Work felt intense today",
  "Did a 5-min breathing session",
  "Morning coffee helped",
  "Had a great conversation",
  "Workout made me feel better",
  "Music lifted my spirits",
  "Feeling grateful today",
  "Challenging day at work",
];

// ---------- Mock data generator (60 days, more entries) ----------
const generateMockData = (): MoodEntry[] => {
  const entries: MoodEntry[] = [];
  const ids = emotions.map(e => e.id);
  for (let i = 0; i < 60; i++) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const count = Math.floor(Math.random() * 6) + 2; // 2-7 entries per day
    for (let j = 0; j < count; j++) {
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      entries.push({
        id: `${date}-${time}-${j}`,
        emotion: ids[Math.floor(Math.random() * ids.length)] as EmotionType,
        date,
        time,
        notes: Math.random() > 0.6 ? SAMPLE_NOTES[Math.floor(Math.random() * SAMPLE_NOTES.length)] : undefined,
        triggers: Math.random() > 0.7 ? ["work", "sleep", "exercise"] : undefined,
      });
    }
  }
  return entries.sort(
    (a, b) =>
      new Date(`${b.date} ${b.time}`).getTime() -
      new Date(`${a.date} ${a.time}`).getTime()
  );
};

const MoodTrackingPage: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>(generateMockData());

  // Hero: log mood dialog
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [logNotes, setLogNotes] = useState("");

  // Charts
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("weekly");

  // AI summary (local demo)
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Assessment
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);

  // NEW: result modal
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<EmotionType | null>(null);

  const assessmentQuestions = [
    {
      question: "How has your energy level been lately?",
      options: [
        { text: "Very high, I feel energetic", emotions: ["ecstatic", "joyful"] },
        { text: "Good, I have steady energy", emotions: ["content", "optimistic"] },
        { text: "Average, some ups and downs", emotions: ["neutral", "bored"] },
        { text: "Low, I feel drained", emotions: ["tired", "sad"] },
        { text: "Very low, exhausted", emotions: ["overwhelmed", "hopeless"] },
      ],
    },
    {
      question: "How would you describe your stress levels?",
      options: [
        { text: "Very relaxed and calm", emotions: ["peaceful", "content"] },
        { text: "Manageable stress", emotions: ["neutral", "optimistic"] },
        { text: "Moderate stress", emotions: ["worried", "tired"] },
        { text: "High stress", emotions: ["stressed", "anxious"] },
        { text: "Overwhelming stress", emotions: ["overwhelmed", "frustrated"] },
      ],
    },
    {
      question: "How satisfied do you feel with your life right now?",
      options: [
        { text: "Extremely satisfied", emotions: ["ecstatic", "grateful"] },
        { text: "Very satisfied", emotions: ["joyful", "content"] },
        { text: "Somewhat satisfied", emotions: ["neutral", "optimistic"] },
        { text: "Not very satisfied", emotions: ["bored", "worried"] },
        { text: "Very dissatisfied", emotions: ["sad", "hopeless"] },
      ],
    },
  ];

  // Single "AI-Generate Mood" handler
  const handleGenerateMoodFromAssessment = () => {
    // Collect suggested emotions from chosen answers
    const suggested: EmotionType[] = [];
    assessmentAnswers.forEach((ansIdx, qIdx) => {
      const opt = assessmentQuestions[qIdx].options[ansIdx];
      if (opt) suggested.push(...(opt.emotions as EmotionType[]));
    });

    if (!suggested.length) {
      // No answers selected
      setAssessmentResult(null);
      setShowAssessmentResult(false);
      return;
    }

    // Find most frequent suggested emotion
    const score = suggested.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<EmotionType, number>);
    const top = Object.entries(score).sort(([, a], [, b]) => b - a)[0]?.[0] as EmotionType;

    setAssessmentResult(top || null);
    setShowAssessment(false);         // close the form dialog
    setShowAssessmentResult(true);    // open the popup
  };

  // --- Entries filter (Day / Month / All) ---
  const [entriesFilterType, setEntriesFilterType] = useState<"all" | "day" | "month">("all");
  const [entriesFilterDay, setEntriesFilterDay] = useState<string>("");     // yyyy-MM-dd
  const [entriesFilterMonth, setEntriesFilterMonth] = useState<string>(""); // yyyy-MM

  const filteredEntries = useMemo(() => {
    if (entriesFilterType === "all") return entries;

    if (entriesFilterType === "day" && entriesFilterDay) {
      return entries.filter(e => e.date === entriesFilterDay);
    }
    if (entriesFilterType === "month" && entriesFilterMonth) {
      return entries.filter(e => e.date.startsWith(entriesFilterMonth));
    }
    return entries;
  }, [entries, entriesFilterType, entriesFilterDay, entriesFilterMonth]);

  // Chart data (based on all entries)
  const chartData = useMemo(() => {
    const grouped = entries.reduce((acc, entry) => {
      const key =
        viewMode === "daily"
          ? `${entry.date} ${entry.time}`
          : viewMode === "weekly"
          ? format(new Date(entry.date), "MMM dd")
          : format(new Date(entry.date), "MMM yyyy");

      if (!acc[key]) acc[key] = { date: key, total: 0, count: 0 };
      const emotion = emotions.find(e => e.id === entry.emotion);
      if (emotion) {
        acc[key].total += emotion.intensity;
        acc[key].count += 1;
      }
      return acc;
    }, {} as Record<string, { date: string; total: number; count: number }>);

    return Object.values(grouped)
      .map(g => ({
        date: g.date,
        average: Math.round((g.total / g.count) * 10) / 10,
      }))
      .slice(0, 14)
      .reverse();
  }, [entries, viewMode]);

  // Updated emotion distribution for past 7 days
  const emotionDistribution = useMemo(() => {
    const sevenDaysAgo = format(subDays(new Date(), 7), "yyyy-MM-dd");
    const recentEntries = entries.filter(entry => entry.date >= sevenDaysAgo);
    
    const counts = recentEntries.reduce((acc, entry) => {
      acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return emotions
      .map(e => ({ name: e.name, value: counts[e.id] || 0, color: e.color, emoji: e.emoji }))
      .filter(x => x.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  // Get dominant emotion for chart description
  const getDominantEmotionText = useMemo(() => {
    if (emotionDistribution.length === 0) return "tracking your emotions";
    
    const topEmotion = emotionDistribution[0];
    if (topEmotion.value === 1) {
      return `feeling ${topEmotion.name.toLowerCase()} occasionally`;
    }
    return `feeling mostly ${topEmotion.name.toLowerCase()} this week`;
  }, [emotionDistribution]);

  const logMood = () => {
    if (!selectedEmotion) return;
    const now = new Date();
    const newEntry: MoodEntry = {
      id: `${Date.now()}`,
      emotion: selectedEmotion,
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
      notes: logNotes || undefined,
    };
    setEntries(prev => [newEntry, ...prev]);
    setSelectedEmotion(null);
    setLogNotes("");
  };

  // Heuristic suggestion (existing behavior)
  const completeAssessment = () => {
    const suggested: EmotionType[] = [];
    assessmentAnswers.forEach((ansIdx, qIdx) => {
      const opt = assessmentQuestions[qIdx].options[ansIdx];
      if (opt) suggested.push(...(opt.emotions as EmotionType[]));
    });
    const score = suggested.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<EmotionType, number>);
    const top = Object.entries(score).sort(([, a], [, b]) => b - a)[0]?.[0] as EmotionType;
    setSelectedEmotion(top);
    setShowAssessment(false);
    setAssessmentAnswers([]);
  };

  // AI suggestion (Sea-Lion)
  const aiSuggestMoodFromAssessment = async () => {
    try {
      const answers = assessmentAnswers
        .map((idx, i) => {
          const q = assessmentQuestions[i];
          const a = typeof idx === "number" ? q.options[idx]?.text : "";
          return `Q${i + 1}: ${q.question}\nA: ${a}`;
        })
        .join("\n\n");

      const system = {
        role: "system",
        content:
          "You classify mood into one of: ecstatic, joyful, content, peaceful, optimistic, grateful, neutral, bored, tired, stressed, anxious, worried, frustrated, angry, sad, lonely, overwhelmed, hopeless. Return only the single label (lowercase), no extra text.",
      };
      const user = {
        role: "user",
        content: `Based on this short mood self-assessment, suggest the closest single mood label:\n\n${answers}`,
      };

      const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${AI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          temperature: 0.2,
          max_completion_tokens: 10,
          messages: [system, user],
        }),
      });

      if (!res.ok) throw new Error(`AI error ${res.status}`);
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "";
      const found = emotions.find(e => e.id === raw)?.id as EmotionType | undefined;
      if (found) {
        setSelectedEmotion(found);
      } else {
        completeAssessment(); // fallback to heuristic
      }
      setShowAssessment(false);
      setAssessmentAnswers([]);
    } catch {
      completeAssessment();
    }
  };

  const generateAISummary = async () => {
    setIsGeneratingAI(true);
    // demo: local summary (plain text — no markdown)
    setTimeout(() => {
      const recent = entries.slice(0, 20);
      const positive = recent.filter(e => emotions.find(x => x.id === e.emotion)?.category === "positive").length;
      const txt =
        `Mood Analysis Summary

Recent logs: ${recent.length}
Positive ratio: ${Math.round((positive / Math.max(1, recent.length)) * 100)}%
Top emotion: ${emotionDistribution[0]?.name || "Neutral"}
Trend: ${positive > recent.length / 2 ? "Generally positive outlook" : "Mixed / focus on self-care"}

Suggestions:
1) Keep logging daily for clearer trends
2) Note triggers when emotions feel strong
3) Pair with journaling for deeper insight
4) Use breathing or grounding when stressed`;
      setAiSummary(txt);
      setIsGeneratingAI(false);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#FFF5EC]">
      {/* Hero Section */}
      <section className="relative pt-2 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-black mb-4">
                Mood
                <span className="block bg-gradient-to-r from-primary via-wellness to-secondary bg-clip-text text-transparent pb-1">
                  Tracking
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-2xl mb-8">
                Track 18 emotions with precision. Understand patterns, celebrate progress, and nurture your emotional wellbeing.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Log Mood */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="text-lg px-8 py-4 shadow transition"
                      style={{ backgroundColor: PURPLE, color: "#fff" }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Log Mood Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>How are you feeling right now?</DialogTitle>
                      <DialogDescription>Select the emotion that best describes your current state</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {(["positive", "neutral", "negative"] as const).map(cat => (
                        <div key={cat}>
                          <h3 className="text-lg font-semibold mb-3 capitalize" style={{ color: PURPLE }}>
                            {cat === "positive" ? "Uplifting" : cat === "neutral" ? "Steady" : "Challenging"} Emotions
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {emotions.filter(e => e.category === cat).map(emotion => (
                              <Button
                                key={emotion.id}
                                variant={selectedEmotion === emotion.id ? "default" : "outline"}
                                className="p-4 h-auto flex flex-col gap-2 transition-all"
                                style={{
                                  backgroundColor: selectedEmotion === emotion.id ? emotion.color : "white",
                                  borderColor: emotion.color,
                                  color: selectedEmotion === emotion.id ? "white" : emotion.color,
                                }}
                                onClick={() => setSelectedEmotion(emotion.id)}
                              >
                                <span className="text-2xl">{emotion.emoji}</span>
                                <span className="text-sm font-medium">{emotion.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}

                      <div>
                        <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="What triggered this emotion? Any additional context..."
                          value={logNotes}
                          onChange={(e) => setLogNotes(e.target.value)}
                          rows={3}
                          className="mt-2"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={logMood}
                          disabled={!selectedEmotion}
                          className="flex-1"
                          style={{ backgroundColor: PURPLE, color: "#fff" }}
                        >
                          Log Mood
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAssessment(true)}
                          style={{ borderColor: PURPLE, color: PURPLE }}
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Need Help?
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 bg-white"
                  style={{ borderColor: PURPLE, color: PURPLE, borderWidth: 2 }}
                  onClick={() => document.getElementById("analytics")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>

            {/* Right image — no container styling */}
            <div className="flex-1">
              <img
                src={moodHeroImage}
                alt="Mood tracking illustration"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Moods (with Day/Month/All filter) */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card
            className="bg-white border-2 transition hover:border-[#717EF3]"
            style={{ borderColor: `${PURPLE}33` }}
          >
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" style={{ color: PURPLE }} />
                    Recent Mood Logs
                  </CardTitle>
                  <CardDescription>Your latest emotional check-ins</CardDescription>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <Select value={entriesFilterType} onValueChange={(v: any) => setEntriesFilterType(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>

                  {entriesFilterType === "day" && (
                    <input
                      type="date"
                      value={entriesFilterDay}
                      onChange={(e) => setEntriesFilterDay(e.target.value)}
                      className="h-10 px-3 rounded-md border"
                      style={{ borderColor: `${PURPLE}33` }}
                    />
                  )}

                  {entriesFilterType === "month" && (
                    <input
                      type="month"
                      value={entriesFilterMonth}
                      onChange={(e) => setEntriesFilterMonth(e.target.value)}
                      className="h-10 px-3 rounded-md border"
                      style={{ borderColor: `${PURPLE}33` }}
                    />
                  )}

                  <Badge variant="outline" style={{ borderColor: PURPLE, color: PURPLE }}>
                    {filteredEntries.length} entries
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {filteredEntries.slice(0, 12).map((entry) => {
                  const emotion = emotions.find((e) => e.id === entry.emotion);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg border transition hover:border-[#717EF3]"
                      style={{
                        borderColor: `${emotion?.color || "#ddd"}33`,
                        backgroundColor: `${emotion?.color || "#ddd"}08`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{emotion?.emoji}</span>
                        <div>
                          <p className="font-medium" style={{ color: emotion?.color }}>
                            {emotion?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {entry.date} at {entry.time}
                          </p>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 max-w-xs truncate">{entry.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Analytics */}
      <section id="analytics" className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card
              className="lg:col-span-2 bg-white border-2 transition hover:border-[#717EF3]"
              style={{ borderColor: `${PURPLE}33` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: PURPLE }} />
                    Mood Trends
                  </CardTitle>
                  <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>Average mood intensity over time (1–10)</CardDescription>
              </CardHeader>

              {/* Enhanced chart with better visuals */}
              <CardContent>
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border">
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                      <span className="font-medium">You have been {getDominantEmotionText}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#3B82F6" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={PURPLE} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={PURPLE} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                      <XAxis 
                        dataKey="date" 
                        fontSize={11} 
                        tick={{ fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        domain={[1, 10]} 
                        fontSize={11} 
                        tick={{ fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      {/* Enhanced tooltip */}
                      {/* @ts-ignore */}
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const v = payload[0].value as number;
                          const emoji = v >= 8 ? "😊" : v >= 6 ? "🙂" : v >= 4 ? "😐" : "😔";
                          return (
                            <div className="rounded-xl bg-white p-4 shadow-lg border border-purple-100 animate-scale-in">
                              <div className="text-sm font-semibold text-purple-700 mb-1">
                                {label}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{emoji}</span>
                                <div>
                                  <div className="text-sm font-medium text-gray-700">
                                    Mood Score: <span className="text-purple-600 font-bold">{v}/10</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {v >= 8 ? "Feeling great!" : v >= 6 ? "Pretty good" : v >= 4 ? "Neutral mood" : "Needs attention"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="url(#moodGradient)"
                        strokeWidth={4}
                        dot={{ 
                          fill: "white", 
                          stroke: PURPLE, 
                          strokeWidth: 3, 
                          r: 5,
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        }}
                        activeDot={{
                          r: 7,
                          fill: PURPLE,
                          stroke: "white",
                          strokeWidth: 3,
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Emotion Breakdown – Updated for past 7 days with clearer messaging */}
            <Card
              className="bg-white border-2 transition hover:border-[#717EF3]"
              style={{ borderColor: `${PURPLE}33` }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" style={{ color: PURPLE }} />
                  Past 7 Days
                </CardTitle>
                <CardDescription>How often you felt each emotion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emotionDistribution.slice(0, 6).map((item, index) => {
                    const total = emotionDistribution.reduce((sum, emotion) => sum + emotion.value, 0) || 1;
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <div 
                        key={item.name} 
                        className="group hover:bg-gray-50 hover:shadow-md hover:border hover:border-gray-200 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full shadow-sm transition-transform group-hover:scale-110" 
                              style={{ backgroundColor: item.color }} 
                            />
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{item.emoji}</span>
                              <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{item.value} {item.value === 1 ? 'time' : 'times'}</span>
                            <Badge 
                              variant="outline" 
                              className="font-bold"
                              style={{ borderColor: item.color, color: item.color, backgroundColor: `${item.color}15` }}
                            >
                              {pct}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {emotionDistribution.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-sm text-gray-500">No emotions logged in the past 7 days. Start tracking to see your patterns!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Summary */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="bg-white border-2" style={{ borderColor: `${PURPLE}33` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: PURPLE }} />
                AI Mood Insights
              </CardTitle>
              <CardDescription>
                Personalized analysis of your emotional patterns and recommendations
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                onClick={generateAISummary}
                disabled={isGeneratingAI}
                style={{ backgroundColor: PURPLE, color: "#fff" }}
              >
                {isGeneratingAI ? "Analyzing..." : "Generate AI Summary"}
              </Button>

              {aiSummary && (
                <div
                  className="p-6 rounded-xl shadow-md border-2 space-y-4 bg-white"
                  style={{ borderColor: PURPLE }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: PURPLE }} />
                    <h3 className="text-lg font-bold" style={{ color: PURPLE }}>
                      Your Personalized Mood Insights
                    </h3>
                  </div>
                  {/* Plain text, no markdown — no asterisks */}
                  <pre className="whitespace-pre-wrap text-gray-700 leading-7">{aiSummary}</pre>
                  <p className="text-sm text-gray-500">
                    Quick takeaways above are based on your latest logs.
                  </p>
                </div>
              )}
            </CardContent>

            {aiSummary && (
              <div className="px-6 pb-6">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    style={{ borderColor: PURPLE, color: PURPLE }}
                    onClick={() => { /* TODO: persist summary */ }}
                  >
                    Save Summary
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Enhanced Program Cards - Updated mental health overview to purple theme */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mental Health Overview - Now purple themed */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600 p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-violet-500/20 to-indigo-600/20 animate-pulse"></div>
            
            <div className="relative h-full rounded-3xl bg-white/95 backdrop-blur-sm p-8">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    Mental Health Overview
                  </h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  Comprehensive wellness dashboard with exercises, resources, and personalized insights to support your mental health journey.
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Exercises</span>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">Resources</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Insights</span>
                </div>
                
                <Button
                  className="w-full mt-6 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => (window.location.href = "/MentalHealthOverview")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explore Wellness Hub
                </Button>
              </div>
            </div>
          </div>

          {/* Mood Assessment Tool */}
          <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600 p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-violet-500/20 to-indigo-600/20 animate-pulse"></div>
            
            <div className="relative h-full rounded-3xl bg-white/95 backdrop-blur-sm p-8">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-400 to-violet-500 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                    Mood Assessment
                  </h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed">
                  AI-powered mood analysis and personalized emotional support. Get guidance when you need it most.
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">AI Analysis</span>
                  <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">Support</span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">Guidance</span>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 transition-all duration-200"
                    onClick={() => setShowAssessment(true)}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Quick Assessment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mood Assessment Dialog */}
      <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mood Assessment</DialogTitle>
            <DialogDescription>Answer these quick questions and let AI estimate your current mood.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {assessmentQuestions.map((q, qIndex) => (
              <div key={qIndex}>
                <h3 className="font-medium mb-3">{q.question}</h3>
                <RadioGroup
                  value={assessmentAnswers[qIndex]?.toString()}
                  onValueChange={(v) => {
                    const next = [...assessmentAnswers];
                    next[qIndex] = parseInt(v);
                    setAssessmentAnswers(next);
                  }}
                >
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}o${oIndex}`} />
                      <Label htmlFor={`q${qIndex}o${oIndex}`} className="text-sm">
                        {opt.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <div className="flex gap-3">
              <Button
                className="flex-1"
                style={{ backgroundColor: PURPLE, color: "#fff" }}
                disabled={assessmentAnswers.length !== assessmentQuestions.length}
                onClick={handleGenerateMoodFromAssessment}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Mood
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                style={{ borderColor: PURPLE, color: PURPLE }}
                onClick={() => window.location.href = "/mindfulbot"}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Chat with Mindful Bot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assessment Result Dialog */}
      <Dialog open={showAssessmentResult} onOpenChange={setShowAssessmentResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assessment Result</DialogTitle>
            <DialogDescription>Based on your answers, here's your suggested mood</DialogDescription>
          </DialogHeader>

          {assessmentResult && (
            <div className="text-center space-y-4">
              {(() => {
                const emotion = emotions.find(e => e.id === assessmentResult);
                return emotion ? (
                  <div className="space-y-4">
                    <div className="text-6xl">{emotion.emoji}</div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: emotion.color }}>
                        {emotion.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        This reflects your current emotional state based on the assessment
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          setSelectedEmotion(assessmentResult);
                          setShowAssessmentResult(false);
                        }}
                        className="flex-1"
                        style={{ backgroundColor: emotion.color, color: "#fff" }}
                      >
                        Log This Mood
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAssessmentResult(false)}
                        className="flex-1"
                      >
                        Maybe Later
                      </Button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default MoodTrackingPage;