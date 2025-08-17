import React, { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Edit3,
  PlusCircle,
  Sparkles,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

import journalingImage from "@/assets/journaling-girl.svg";

type Mood = "great" | "good" | "okay" | "low" | "difficult";

interface JournalEntry {
  id: string;
  date: string; // ISO yyyy-MM-dd
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
}

const moodColors: Record<Mood, string> = {
  great: "bg-emerald-100 text-emerald-800 border-emerald-200",
  good: "bg-blue-100 text-blue-800 border-blue-200",
  okay: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-orange-100 text-orange-800 border-orange-200",
  difficult: "bg-red-100 text-red-800 border-red-200",
};

const moodEmojis: Record<Mood, string> = {
  great: "😊",
  good: "🙂",
  okay: "😐",
  low: "😕",
  difficult: "😔",
};

// --- THEME: match Mental Health page ---
const PURPLE = "#717EF3";

// ---- SEA LION config (inline on this page) ----
const AI_ENDPOINT = "https://api.sea-lion.ai/v1/chat/completions";
const AI_MODEL = "aisingapore/Llama-SEA-LION-v3-70B-IT";
const AI_API_KEY = "sk-Y8L5mwaeYGh4PSl2xXDbAA";

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: "2025-08-15",
      title: "Morning Reflections",
      content:
        "Started the day with meditation. Feeling grateful for the small moments of peace. The sunrise reminded me that each day is a new beginning. Wrote down three things I’m thankful for and stretched for 10 minutes. I also made myself a healthy breakfast and drank plenty of water, which made me feel more energized. I noticed my mind was calmer than usual, and I’d like to carry this sense of grounding into my workday.",
      mood: "good",
      tags: ["gratitude", "meditation", "peace"],
    },
    {
      id: "2",
      date: "2025-08-14",
      title: "Challenging Day",
      content:
        "Work was overwhelming today. Had a difficult conversation with a colleague. Practiced breathing exercises which helped me stay centered. I paused for a tea break and that helped reset my mood. Still, I carried some tension in my body and found it hard to relax fully in the evening. I realize I need to set clearer boundaries and maybe take short walks during breaks to ease the stress. Ending the night with some light reading helped me wind down.",
      mood: "low",
      tags: ["stress", "work", "breathing", "mindfulness"],
    },
    {
      id: "3",
      date: "2025-08-13",
      title: "Connection and Joy",
      content:
        "Spent quality time with friends. Laughed until my stomach hurt. These moments of connection remind me of what truly matters in life. I want to plan more regular meetups. We shared stories, cooked a simple meal together, and played some games late into the night. I felt fully present and happy, without worrying about work or responsibilities. This made me realize how important social connection is for my overall wellbeing.",
      mood: "great",
      tags: ["friendship", "joy", "connection", "laughter"],
    },
  ]);

  const [filterType, setFilterType] = useState<"all" | "day" | "week" | "month" | "year">("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>("");

  // new entry dialog
  const [newEntry, setNewEntry] = useState<{ title: string; content: string; mood: Mood; tags: string }>({
    title: "",
    content: "",
    mood: "okay",
    tags: "",
  });

  // edit entry dialog
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // AI
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiTimeframe, setAiTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [aiApiKey, setAiApiKey] = useState<string>("sk-Y8L5mwaeYGh4PSl2xXDbAA"); // paste here for dev; move to server in prod

  const filteredEntries = useMemo(() => {
    let base = entries;
    if (filterType !== "all") {
      base = entries.filter((entry) => {
        const d = parseISO(entry.date);
        switch (filterType) {
          case "day":
            return format(d, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
          case "week":
            return isWithinInterval(d, { start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) });
          case "month":
            return isWithinInterval(d, { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) });
          case "year":
            return isWithinInterval(d, { start: startOfYear(selectedDate), end: endOfYear(selectedDate) });
          default:
            return true;
        }
      });
    }
    const q = searchTerm.trim().toLowerCase();
    if (!q) return base;
    return base.filter((e) => {
      const hay = [e.title, e.content, e.tags.join(","), e.mood].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [entries, filterType, selectedDate, searchTerm]);

  const handleSaveEntry = () => {
    if (!newEntry.title || !newEntry.content) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd"),
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      tags: newEntry.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    setEntries((prev) => [entry, ...prev]);
    setNewEntry({ title: "", content: "", mood: "okay", tags: "" });
  };

  const handleUpdateEntry = () => {
    if (!editingEntry) return;
    setEntries((prev) => prev.map((e) => (e.id === editingEntry.id ? editingEntry : e)));
    setEditingEntry(null);
  };

  const timeframeLabel = (tf: typeof aiTimeframe) => {
    switch (tf) {
      case "daily":
        return "today";
      case "weekly":
        return "this week";
      case "monthly":
        return "this month";
      case "yearly":
        return "this year";
    }
  };

  // ---- SEA LION call (kept here, per your request) ----
  const generateAISummary = async () => {

    setIsGenerating(true);
    try {
      const entriesText = filteredEntries
        .map(
          (e) =>
            `Date: ${e.date}\nMood: ${e.mood}\nTitle: ${e.title}\nContent: ${e.content}\nTags: ${e.tags.join(", ")}\n`
        )
        .join("\n");

      const systemMessage = {
        role: "system",
        content: `You are a compassionate mental health assistant. Summarize patterns, themes, and suggest next steps for ${timeframeLabel(
          aiTimeframe
        )}. Keep it supportive and actionable in 6–10 short bullet points.`,
      };
      const userMessage = {
        role: "user",
        content: `Analyze these journal entries (${aiTimeframe}) and provide insights + gentle suggestions:\n\n${entriesText}`,
      };

      const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          temperature: 0.6,
          max_completion_tokens: 400,
          messages: [systemMessage, userMessage],
        }),
      });

      if (!res.ok) throw new Error(`AI error ${res.status}`);
      const data = await res.json();
      const txt = data?.choices?.[0]?.message?.content || "";
      setAiSummary(txt.trim());
    } catch (err) {
      console.error(err);
      setAiSummary("Sorry, I couldn’t generate the summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5EC]">
      {/* HERO — match Resources (no Card) */}
      <section className="relative pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: headline + CTAs + Add Entry dialog */}
            <div className="flex-1">
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-black mb-4">
                Reflection
                <span className="block bg-gradient-to-r from-primary via-wellness to-secondary bg-clip-text text-transparent">Journal</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-2xl">
                Capture your thoughts. Notice patterns. Grow gently at your own pace.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {/* Solid purple like Resources */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="text-lg px-8 py-4 shadow transition"
                      style={{ backgroundColor: PURPLE, color: "#fff" }}
                    >
                      <PlusCircle className="w-5 h-5 mr-2" />
                      Add New Entry
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Journal Entry</DialogTitle>
                      <DialogDescription>Your words are safe here.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Entry title…"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry((p) => ({ ...p, title: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Write your thoughts here…"
                        rows={8}
                        className="min-h-[180px]"
                        value={newEntry.content}
                        onChange={(e) => setNewEntry((p) => ({ ...p, content: e.target.value }))}
                      />
                      <div className="flex flex-wrap gap-3">
                        <Select value={newEntry.mood} onValueChange={(v: Mood) => setNewEntry((p) => ({ ...p, mood: v }))}>
                          <SelectTrigger className="w-44">
                            <SelectValue placeholder="Mood" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="great">😊 Great</SelectItem>
                            <SelectItem value="good">🙂 Good</SelectItem>
                            <SelectItem value="okay">😐 Okay</SelectItem>
                            <SelectItem value="low">😕 Low</SelectItem>
                            <SelectItem value="difficult">😔 Difficult</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Tags (comma separated)"
                          value={newEntry.tags}
                          onChange={(e) => setNewEntry((p) => ({ ...p, tags: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                      <Button onClick={handleSaveEntry} className="w-full" style={{ backgroundColor: PURPLE, color: "#fff" }}>
                        Save Entry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Outline purple like Resources */}
                <a href="#entries" className="inline-block">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 bg-white"
                    style={{ borderColor: PURPLE, color: PURPLE, borderWidth: 2 }}
                  >
                    Browse Entries
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: hero illustration */}
            <div className="flex-1">
              <img
                src={journalingImage}
                alt="Person journaling"
                className="w-full h-auto rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS + ENTRIES */}
      <section id="entries" className="py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls (left) */}
          <Card
            className="bg-white"
            style={{ borderColor: `${PURPLE}33`, borderWidth: 2 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = PURPLE)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `${PURPLE}33`)}
          >
            <CardHeader>
              <CardTitle>Browse Entries</CardTitle>
              <CardDescription>Filter by timeframe and search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              {filterType !== "all" && (
                <Input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              )}

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search by word/tag…"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Badge variant="outline" className="w-fit bg-white" style={{ borderColor: `${PURPLE}66`, color: PURPLE }}>
                {filteredEntries.length} result{filteredEntries.length !== 1 ? "s" : ""}
              </Badge>
            </CardContent>
          </Card>

          {/* Entries (right, 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {filteredEntries.length === 0 ? (
              <Card
                className="bg-white text-center py-16"
                style={{ borderColor: `${PURPLE}33`, borderWidth: 2 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = PURPLE)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `${PURPLE}33`)}
              >
                <CardContent>
                  <CalendarIcon className="w-10 h-10 mx-auto mb-3" style={{ color: PURPLE }} />
                  <p className="text-gray-600">No entries found</p>
                </CardContent>
              </Card>
            ) : (
              filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="bg-white transition"
                  style={{ borderColor: `${PURPLE}33`, borderWidth: 2 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = PURPLE)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `${PURPLE}33`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-2">
                          <CalendarIcon className="w-4 h-4" style={{ color: PURPLE }} />
                          <span className="text-sm text-gray-600">
                            {format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}
                          </span>
                          <Badge className={`text-xs ${moodColors[entry.mood]}`}>
                            {moodEmojis[entry.mood]} {entry.mood}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl">{entry.title}</CardTitle>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setEditingEntry(entry)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[15px] leading-8 text-slate-800 mb-4">{entry.content}</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-white" style={{ borderColor: `${PURPLE}66`, color: PURPLE }}>
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* AI SUMMARY (purple outline, not yellow) */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <Card
            className="bg-white"
            style={{ borderColor: `${PURPLE}33`, borderWidth: 2 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = PURPLE)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `${PURPLE}33`)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" style={{ color: PURPLE }} />
                <div>
                  <CardTitle>AI Summary</CardTitle>
                  <CardDescription>Daily, weekly, monthly, or yearly insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <Select value={aiTimeframe} onValueChange={(v: any) => setAiTimeframe(v)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Choose timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={generateAISummary}
                  disabled={isGenerating || !filteredEntries.length}
                  style={{ backgroundColor: PURPLE, color: "#fff" }}
                >
                  {isGenerating ? "Analyzing…" : "Generate Summary"}
                </Button>
              </div>

              {aiSummary && (
                <div
                  className="rounded-lg bg-white p-4 whitespace-pre-wrap text-slate-800"
                  style={{ border: `2px solid ${PURPLE}33` }}
                >
                  {aiSummary}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final link */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <Card
            className="bg-white"
            style={{ borderColor: `${PURPLE}33`, borderWidth: 2 }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = PURPLE)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `${PURPLE}33`)}
          >
            <CardHeader>
              <CardTitle>Want more insights & suggestions?</CardTitle>
              <CardDescription>Visit the Mental Health Overview for exercises, resources, and trends.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="gap-2 bg-white"
                style={{ borderColor: PURPLE, color: PURPLE, borderWidth: 2 }}
                onClick={() => (window.location.href = "/MentalHealthOverview")}
              >
                Go to Mental Health Overview
                <ExternalLink className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Edit Entry Dialog */}
      {editingEntry && (
        <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Journal Entry</DialogTitle>
              <DialogDescription>Update your thoughts and reflections</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={editingEntry.title}
                onChange={(e) =>
                  setEditingEntry((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                }
              />
              <Textarea
                rows={8}
                value={editingEntry.content}
                onChange={(e) =>
                  setEditingEntry((prev) => (prev ? { ...prev, content: e.target.value } : prev))
                }
              />
              <div className="flex flex-wrap gap-3">
                <Select
                  value={editingEntry.mood}
                  onValueChange={(v: Mood) =>
                    setEditingEntry((prev) => (prev ? { ...prev, mood: v } : prev))
                  }
                >
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="great">😊 Great</SelectItem>
                    <SelectItem value="good">🙂 Good</SelectItem>
                    <SelectItem value="okay">😐 Okay</SelectItem>
                    <SelectItem value="low">😕 Low</SelectItem>
                    <SelectItem value="difficult">😔 Difficult</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={editingEntry.tags.join(", ")}
                  onChange={(e) =>
                    setEditingEntry((prev) =>
                      prev
                        ? {
                            ...prev,
                            tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                          }
                        : prev
                    )
                  }
                  placeholder="Tags (comma separated)"
                  className="flex-1"
                />
              </div>
              <Button onClick={handleUpdateEntry} className="w-full" style={{ backgroundColor: PURPLE, color: "#fff" }}>
                Update Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default JournalPage;

