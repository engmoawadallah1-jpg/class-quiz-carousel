import { createFileRoute, Link, notFound, ClientOnly } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { worlds, questionsForWorld, shuffle } from "@/data/questionsData";
import { useProgress, completeWorld, playSound } from "@/lib/progress";
import { Confetti } from "@/components/Confetti";
import hakeem from "@/assets/hakeem.png";

export const Route = createFileRoute("/adventure/$slug")({
  loader: ({ params }) => {
    const w = worlds.find((x) => x.slug === params.slug);
    if (!w) throw notFound();
    return { world: w };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.world.name ?? "عالم"} – رحلة الإيمان` },
      { name: "description", content: loaderData?.world.desc ?? "" },
      { property: "og:title", content: `${loaderData?.world.name ?? "عالم"} – رحلة الإيمان` },
      { property: "og:description", content: loaderData?.world.desc ?? "" },
    ],
  }),
  component: WorldQuizPage,
});

function WorldQuiz() {
  const { world } = Route.useLoaderData();
  const [, update] = useProgress();
  const qs = useMemo(() => questionsForWorld(world.slug).map((q) => ({ ...q, options: shuffle(q.options) })), [world.slug]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [done, setDone] = useState(false);
  const q = qs[i]!;
  const isRight = picked === q?.correctAnswer;

  function pick(o: string) {
    if (picked === q.correctAnswer) return;
    setPicked(o);
    if (o === q.correctAnswer) {
      playSound("correct");
      if (firstTry) { setCorrect((c) => c + 1); update((p) => ({ ...p, stars: p.stars + 5 })); }
    } else { playSound("wrong"); setFirstTry(false); }
  }
  function next() {
    if (i + 1 >= qs.length) {
      update((p) => completeWorld(p, world.slug, correct, qs.length));
      playSound("win"); setDone(true); return;
    }
    setI(i + 1); setPicked(null); setFirstTry(true);
  }

  if (done) {
    const passed = correct / qs.length >= 0.5;
    return (
      <div className="text-center bg-card rounded-3xl p-8 pop max-w-xl mx-auto space-y-4">
        {passed && <Confetti />}
        <div className="text-7xl">{passed ? "🏆" : "💪"}</div>
        <h1 className="text-3xl font-black">{passed ? "أحسنت يا بطل!" : "لا بأس، حاول ثانية!"}</h1>
        <p className="text-xl">أجبت عن {correct} من {qs.length} من المحاولة الأولى</p>
        {passed && <p>🔓 انفتح العالم التالي!</p>}
        <div className="flex justify-center gap-3">
          <Link to="/adventure" className="btn-chunky bg-emerald text-ink-on-color">إلى الخريطة</Link>
          <button onClick={() => { setI(0); setPicked(null); setCorrect(0); setFirstTry(true); setDone(false); }} className="btn-chunky bg-gold">العب مجدداً</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {isRight && <Confetti count={14} key={i} />}
      <div className="flex items-center justify-between">
        <Link to="/adventure" className="font-bold">→ الخريطة</Link>
        <h1 className="text-2xl font-black">{world.emoji} {world.name}</h1>
        <span className="font-bold">{i + 1}/{qs.length}</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald transition-all" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
          className="bg-card rounded-3xl p-6 pop space-y-4">
          <span className="text-xs rounded-full bg-secondary text-secondary-foreground px-3 py-1 font-bold">{q.category}</span>
          <h2 className="text-2xl font-black">{q.question}</h2>
          <div className="grid gap-3">
            {q.options.map((o) => {
              const state = picked === o ? (o === q.correctAnswer ? "bg-success text-ink-on-color" : "bg-destructive text-destructive-foreground") : "bg-muted hover:bg-accent";
              return (
                <motion.button key={o} whileTap={{ scale: 0.97 }} animate={picked === o && o !== q.correctAnswer ? { x: [0, -8, 8, 0] } : {}}
                  onClick={() => pick(o)} className={`text-start rounded-2xl p-4 font-bold text-lg transition-colors ${state}`}>{o}</motion.button>
              );
            })}
          </div>
          {picked && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 items-start rounded-2xl p-4 ${isRight ? "bg-secondary" : "bg-accent"}`}>
              <img src={hakeem} alt="المعلم حكيم" width={1024} height={1024} className="w-16 h-16 object-contain" />
              <div>
                <div className="text-xl font-black">{isRight ? "أحسنت يا بطل! 🌟" : "لا بأس، حاول ثانية! 💛"}</div>
                <p>{isRight ? q.explanation : "فكّر جيداً يا بطل، تذكّر ما تعلمته واختر إجابة أخرى."}</p>
                {isRight && <p className="text-xs text-muted-foreground mt-1">المصدر: الكتاب ص {q.sourcePage}</p>}
              </div>
            </motion.div>
          )}
          {isRight && <button onClick={next} className="btn-chunky bg-primary text-primary-foreground w-full">{i + 1 >= qs.length ? "إنهاء العالم 🏁" : "السؤال التالي ←"}</button>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function WorldQuizPage() {
  return <ClientOnly fallback={<p className="text-center">...</p>}><WorldQuiz /></ClientOnly>;
}
