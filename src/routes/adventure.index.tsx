import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { worlds, questionsForWorld } from "@/data/questionsData";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/adventure/")({
  head: () => ({
    meta: [
      { title: "خريطة المغامرات – رحلة الإيمان" },
      { name: "description", content: "خمسة عوالم تعليمية: قلعة العقيدة، حديقة الإيمان، بيت الأخلاق، مدينة الآداب، وتحدي الأبطال." },
      { property: "og:title", content: "خريطة المغامرات – رحلة الإيمان" },
      { property: "og:description", content: "اكتشف العوالم الخمسة وافتحها واحداً تلو الآخر." },
    ],
  }),
  component: Map,
});

function Map() {
  const [p] = useProgress();
  return (
    <div>
      <h1 className="text-4xl font-black text-center mb-2">🗺️ خريطة المغامرات</h1>
      <p className="text-center mb-8">أجب عن نصف أسئلة العالم على الأقل لتفتح العالم التالي!</p>
      <div className="relative flex flex-col gap-6 max-w-2xl mx-auto">
        {worlds.map((w, i) => {
          const open = p.unlocked.includes(w.slug);
          const total = questionsForWorld(w.slug).length;
          const best = p.completed[w.slug];
          const card = (
            <motion.div whileHover={open ? { scale: 1.03, rotate: i % 2 ? 1 : -1 } : {}}
              className={`${open ? w.tone : "bg-muted"} ${open ? "text-ink-on-color" : "text-muted-foreground"} rounded-3xl p-5 pop flex items-center gap-4 ${i % 2 ? "md:ms-24" : "md:me-24"}`}>
              <span className="text-6xl">{open ? w.emoji : "🔒"}</span>
              <div className="flex-1">
                <div className="text-sm font-bold opacity-80">العالم {i + 1}</div>
                <h2 className="text-2xl font-black">{w.name}</h2>
                <p>{w.desc}</p>
              </div>
              {best !== undefined && <span className="rounded-full bg-card text-foreground px-3 py-1 font-bold">⭐ {best}/{total}</span>}
            </motion.div>
          );
          return open ? <Link key={w.slug} to="/adventure/$slug" params={{ slug: w.slug }}>{card}</Link> : <div key={w.slug}>{card}</div>;
        })}
      </div>
    </div>
  );
}
