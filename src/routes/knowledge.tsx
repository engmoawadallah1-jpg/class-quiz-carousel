import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { questionsData, worlds } from "@/data/questionsData";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "بنك المعرفة – رحلة الإيمان" },
      { name: "description", content: "مكتبة بطاقات لمراجعة مسائل العقيدة والآداب الشرعية اليومية مع البحث والتصفية." },
      { property: "og:title", content: "بنك المعرفة – رحلة الإيمان" },
      { property: "og:description", content: "راجع كل مسائل العقيدة والآداب في مكان واحد." },
    ],
  }),
  component: Knowledge,
});

function Knowledge() {
  const [s, setS] = useState("");
  const [cat, setCat] = useState("الكل");
  const [world, setWorld] = useState("الكل");
  const [open, setOpen] = useState<number | null>(null);
  const list = useMemo(() => questionsData.filter((q) =>
    (cat === "الكل" || q.category === cat) && (world === "الكل" || q.world === world) &&
    (q.question + q.correctAnswer + q.explanation).includes(s.trim())), [s, cat, world]);

  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-black text-center">📚 بنك المعرفة</h1>
      <div className="bg-card rounded-3xl p-4 pop flex flex-wrap gap-3">
        <input value={s} onChange={(e) => setS(e.target.value)} placeholder="🔍 ابحث عن سؤال أو أدب..." className="flex-1 min-w-48 rounded-full bg-muted px-4 py-2 outline-none" />
        {["الكل", "عقيدة", "آداب"].map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-2 font-bold ${cat === c ? "bg-emerald text-ink-on-color" : "bg-muted"}`}>{c}</button>
        ))}
        <select value={world} onChange={(e) => setWorld(e.target.value)} className="rounded-full bg-muted px-4 py-2 font-bold">
          <option>الكل</option>
          {worlds.map((w) => <option key={w.slug}>{w.name}</option>)}
        </select>
      </div>
      <p className="text-muted-foreground">{list.length} بطاقة</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((q) => (
          <motion.button layout key={q.id} onClick={() => setOpen(open === q.id ? null : q.id)} className="text-start bg-card rounded-3xl p-5 pop space-y-2">
            <div className="flex gap-2 text-xs font-bold">
              <span className={`rounded-full px-2 py-0.5 ${q.category === "عقيدة" ? "bg-sky" : "bg-gold"} ${q.category === "عقيدة" ? "text-ink-on-color" : ""}`}>{q.category}</span>
              <span className="rounded-full px-2 py-0.5 bg-muted">{q.world}</span>
              <span className="ms-auto text-muted-foreground">ص {q.sourcePage}</span>
            </div>
            <h2 className="text-lg font-black">{q.question}</h2>
            {open === q.id ? (
              <div className="space-y-2">
                <p className="rounded-2xl bg-secondary text-secondary-foreground p-3 font-bold">✅ {q.correctAnswer}</p>
                <p className="text-sm">{q.explanation}</p>
              </div>
            ) : <p className="text-sm text-primary font-bold">اضغط لرؤية الإجابة 👆</p>}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
