import React from "react";
import { Button } from "@/components/ui/button";
import { Send, Plus, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  onInsert: (lines: string[]) => void; // add into current specialty list
  activeSpecialty: string;
  seaLionConfig: { SEA_LION_KEY: string; SEA_LION_MODEL: string; SEA_LION_URL: string };
};

const systemPrompt =
  "You are MedBot, a careful medical assistant. No diagnosis. " +
  "When the user asks for questions to ask a specialist, reply with short bullet points. " +
  "When they share symptoms or concerns, respond concisely and practically." +
  "Format the responses in a neat and readable way." ;

const MedBotSmallVer: React.FC<Props> = ({ onInsert, activeSpecialty, seaLionConfig }) => {
  const [msgs, setMsgs] = React.useState<Msg[]>([
    { role: "assistant", content: "Hi! I can suggest questions for your next appointment or help refine them." },
  ]);
  const [draft, setDraft] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const ask = async () => {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    setMsgs((m) => [...m, { role: "user", content }]);

    try {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setBusy(true);

      const r = await fetch(seaLionConfig.SEA_LION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${seaLionConfig.SEA_LION_KEY}`,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          model: seaLionConfig.SEA_LION_MODEL,
          max_completion_tokens: 400,
          temperature: 0.4,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                `Active specialty: ${activeSpecialty || "General Doctor"}.\n` +
                "If user requests new questions, provide 6–10 concise bullets in a neat and readable format (<= 18 words). " +
                "Otherwise, respond briefly.\n\n" +
                content,
            },
          ],
        }),
        signal: ctrl.signal,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || r.statusText);
      const text = (data?.choices?.[0]?.message?.content ?? "").trim();
      setMsgs((m) => [...m, { role: "assistant", content: text }]);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setMsgs((m) => [...m, { role: "assistant", content: `Sorry—AI error: ${e?.message || "failed"}` }]);
    } finally {
      setBusy(false);
    }
  };

  const extractBullets = (s: string): string[] => {
    return s
      .split(/\r?\n/)
      .map((x) => x.replace(/^\s*(?:[-*•]|\d+\.)\s*/, "").trim())
      .filter((x) => !!x && x.length <= 140);
  };

  const lastAssistant = [...msgs].reverse().find((m) => m.role === "assistant");

  return (
    <div className="flex flex-col h-[560px]">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold text-gray-900">MedBot (compact)</h3>
        <p className="text-xs text-gray-500">Ask for more questions or refine wording. One-click insert.</p>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-sm ${
              m.role === "assistant" ? "bg-indigo-50 text-indigo-900" : "bg-gray-100 text-gray-800"
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      <div className="px-3 pb-2">
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder={`Ask MedBot… (will tailor to ${activeSpecialty || "General Doctor"})`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
          />
          <Button onClick={ask} disabled={busy || !draft.trim()}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          disabled={!lastAssistant}
          onClick={() => {
            if (!lastAssistant) return;
            const bullets = extractBullets(lastAssistant.content);
            if (!bullets.length) {
              alert("No bullet-like suggestions found in the last reply.");
              return;
            }
            onInsert(bullets);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Insert suggestions into "{activeSpecialty || "General Doctor"}"
        </Button>
      </div>
    </div>
  );
};

export default MedBotSmallVer;
