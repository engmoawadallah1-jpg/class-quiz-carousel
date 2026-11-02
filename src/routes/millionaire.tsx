import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { questionsData, shuffle, type QuestionItem } from "@/data/questionsData";
import { useProgress, playSound } from "@/lib/progress";
import { Confetti } from "@/components/Confetti";
import hakeem from "@/assets/hakeem.png";

export const Route = createFileRoute("/millionaire")({
  head: () => ({
    meta: [
      { title: "من سيربح المليون؟ – رحلة الإيمان" },
      { name: "description", content: "مسابقة من ١٠ أسئلة في العقيدة والآداب مع وسائل مساعدة ومراحل أمان." },
      { property: "og:title", content: "من سيربح المليون؟ – رحلة الإيمان" },
      { property: "og:description", content: "هل تستطيع الوصول إلى المليون نجمة؟" },
    ],
  }),
  component: MillionairePage,
});

export const PRIZES = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 1000000];
const SAFE = [4, 9]; // indexes of questions 5 and 10
type Q = QuestionItem & { opts: string[] };
const newGame = (): Q[] => shuffle(questionsData).slice(0, 11).map((q) => ({ ...q, opts: shuffle(q.options) }));

function Millionaire() {
  const [, update] = useProgress();
  const [qs, setQs] = useState<Q[]>(newGame);
  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState<string[]>([]);
  const [hint, setHint] = useState(false);
  const [second, setSecond] = useState(false);
  const [used, setUsed] = useState({ fifty: false, hint: false, second: false, skip: false });
  const [picked, setPicked] = useState<string | null>(null);
  const [state, setState] = useState<"play" | "lost" | "won">("play");
  const [skipOffset, setSkipOffset] = useState(0);
  const q = qs[i + skipOffset]!;

  const safePrize = () => { const s = SAFE.filter((x) => x < i); return s.length ? PRIZES[s[s.length - 1]!]! : 0; };
  function finish(prize: number, won: boolean) {
    setState(won ? "won" : "lost");
    update((p) => ({ ...p, stars: p.stars + Math.round(prize / 100), bestPrize: Math.max(p.bestPrize, prize),
      results: [{ mode: "من سيربح المليون", score: won ? 10 : i, total: 10, date: new Date().toISOString() }, ...p.results].slice(0, 30) }));
  }
  function answer(o: string) {
    if (picked) return;
    setPicked(o);
    if (o === q.correctAnswer) {
      playSound("correct");
      setTimeout(() => {
        if (i === 9) { playSound("win"); finish(PRIZES[9]!, true); return; }
        setI(i + 1); setPicked(null); setHidden([]); setHint(false); setSecond(false);
      }, 1200);
    } else if (second) {
      playSound("wrong");
      setTimeout(() => { setHidden((h) => [...h, o]); setPicked(null); setSecond(false); }, 900);
    } else { playSound("wrong"); setTimeout(() => finish(safePrize(), false), 1400); }
  }
  function reset() { setQs(newGame()); setI(0); setHidden([]); setHint(false); setSecond(false); setPicked(null); setSkipOffset(0); setUsed({ fifty: false, hint: false, second: false, skip: false }); setState("play"); }

  if (state !== "play") {
    const prize = state === "won" ? PRIZES[9]! : safePrize();
    return (
      <div className="bg-quiz text-ink-on-color rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto pop">
        {state === "won" && <Confetti count={40} />}
        <div className="text-7xl">{state === "won" ? "👑" : "💪"}</div>
        <h1 className="text-3xl font-black">{state === "won" ? "مبروك! ربحت المليون نجمة!" : "لا بأس، حاول ثانية!"}</h1>
        {state === "lost" && <p>الإجابة الصحيحة: <b>{q.correctAnswer}</b><br /><span className="opacity-80">{q.explanation}</span></p>}
        <p className="text-2xl text-gold font-black">جائزتك: {prize.toLocaleString("ar-EG")} 🪙</p>
        <button onClick={reset} className="btn-chunky bg-gold text-foreground">جولة جديدة</button>
      </div>
    );
  }

  const lifelines = [
    { k: "fifty", label: "حذف إجابتين", icon: "✂️", run: () => setHidden(shuffle(q.opts.filter((o) => o !== q.correctAnswer)).slice(0, 2)) },
    { k: "hint", label: "المعلم حكيم", icon: "🦉", run: () => setHint(true) },
    { k: "second", label: "فرصة ثانية", icon: "🔁", run: () => setSecond(true) },
    { k: "skip", label: "تخطي السؤال", icon: "⏭️", run: () => { setSkipOffset((s) => s + 1); setHidden([]); setHint(false); } },
  ] as const;

  return (
    <div className="grid lg:grid-cols-[1fr_220px] gap-4">
      <div className="bg-quiz text-ink-on-color rounded-3xl p-6 space-y-5 pop">
        <div className="flex flex-wrap gap-2 justify-center">
          {lifelines.map((l) => (
            <button key={l.k} disabled={used[l.k] || !!picked} onClick={() => { setUsed((u) => ({ ...u, [l.k]: true })); l.run(); }}
              className="rounded-full bg-card/15 px-4 py-2 font-bold disabled:opacity-30 hover:bg-card/25">{l.icon} {l.label}</button>
          ))}
        </div>
        {second && <p className="text-center text-gold font-bold">🔁 الفرصة الثانية مفعّلة</p>}
        <motion.div key={q.id} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl border-2 border-gold p-6 text-center">
          <div className="text-sm opacity-80 mb-2">السؤال {i + 1} على {PRIZES[i]!.toLocaleString("ar-EG")} 🪙</div>
          <h1 className="text-2xl md:text-3xl font-black">{q.question}</h1>
        </motion.div>
        {hint && (
          <div className="flex gap-3 items-center bg-card text-foreground rounded-2xl p-3">
            <img src={hakeem} alt="المعلم حكيم" width={1024} height={1024} className="w-14 h-14 object-contain" />
            <p><b>تلميح حكيم:</b> {q.explanation}</p>
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-3">
          {q.opts.map((o, k) => {
            const off = hidden.includes(o);
            const cls = picked === o ? (o === q.correctAnswer ? "bg-success" : "bg-destructive") : picked && o === q.correctAnswer && !second ? "bg-success" : "bg-card/10 hover:bg-card/20";
            return (
              <button key={o} disabled={off || !!picked} onClick={() => answer(o)}
                className={`rounded-full border-2 border-gold/60 px-5 py-3 text-start font-bold transition-colors ${cls} ${off ? "invisible" : ""}`}>
                <span className="text-gold me-2">{"أبجد"[k]}:</span>{o}
              </button>
            );
          })}
        </div>
      </div>
      <ol className="bg-card rounded-3xl p-3 pop flex flex-col-reverse gap-1">
        {PRIZES.map((p, k) => (
          <li key={p} className={`rounded-full px-3 py-1 flex justify-between font-bold text-sm ${k === i ? "bg-gold" : SAFE.includes(k) ? "text-primary" : ""}`}>
            <span>{k + 1}{SAFE.includes(k) ? " 🛡️" : ""}</span><span>{p.toLocaleString("ar-EG")}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MillionairePage() {
  return <ClientOnly fallback={<p className="text-center">...</p>}><Millionaire /></ClientOnly>;
}
