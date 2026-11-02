import { createFileRoute } from "@tanstack/react-router";
import { worlds, questionsForWorld } from "@/data/questionsData";
import { useProgress, defaultProgress, levelFor, useStudents } from "@/lib/progress";
import { StudentPicker } from "@/components/StudentPicker";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "لوحة ولي الأمر – رحلة الإيمان" },
      { name: "description", content: "تابع تقدم طفلك ونتائجه في العوالم ومسابقة المليون." },
      { property: "og:title", content: "لوحة ولي الأمر – رحلة الإيمان" },
      { property: "og:description", content: "متابعة النجوم والعوالم المفتوحة والنتائج." },
    ],
  }),
  component: Parent,
});

function Parent() {
  const [p, update] = useProgress();
  const { students } = useStudents();
  const stats = [
    { l: "النجوم", v: `⭐ ${p.stars}` },
    { l: "المستوى", v: levelFor(p.stars).level },
    { l: "العوالم المفتوحة", v: `${p.unlocked.length}/${worlds.length}` },
    { l: "أعلى جائزة", v: p.bestPrize.toLocaleString("ar-EG") },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black">👨‍👩‍👦 لوحة ولي الأمر</h1>
      <StudentPicker />
      <section className="bg-card rounded-3xl p-5 pop">
        <h2 className="text-2xl font-black mb-3">كل الطلاب</h2>
        <ul className="divide-y">{students.map((s) => (
          <li key={s.id} className="py-2 grid grid-cols-4 gap-2"><span className="font-bold">{s.avatar} {s.name}</span><span>⭐ {s.stars}</span><span>العوالم: {s.unlocked.length}/{worlds.length}</span><span>اختبارات: {s.results.length}</span></li>
        ))}</ul>
      </section>
      <h2 className="text-2xl font-black">تفاصيل: {p.avatar} {p.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => <div key={s.l} className="bg-card rounded-3xl p-5 pop text-center"><div className="text-muted-foreground">{s.l}</div><div className="text-3xl font-black">{s.v}</div></div>)}
      </div>
      <section className="bg-card rounded-3xl p-5 pop">
        <h2 className="text-2xl font-black mb-3">التقدم في العوالم</h2>
        {worlds.map((w) => {
          const total = questionsForWorld(w.slug).length;
          const best = p.completed[w.slug] ?? 0;
          return (
            <div key={w.slug} className="flex items-center gap-3 py-2">
              <span className="w-40 font-bold">{w.emoji} {w.name}</span>
              <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald" style={{ width: `${(best / total) * 100}%` }} /></div>
              <span className="w-14 text-sm">{best}/{total}</span>
            </div>
          );
        })}
      </section>
      <section className="bg-card rounded-3xl p-5 pop">
        <h2 className="text-2xl font-black mb-3">آخر النتائج</h2>
        {p.results.length === 0 ? <p className="text-muted-foreground">لا توجد نتائج بعد.</p> : (
          <ul className="divide-y">{p.results.map((r, k) => (
            <li key={k} className="py-2 flex justify-between"><span>{r.mode}</span><span>{r.score}/{r.total}</span><span className="text-muted-foreground text-sm">{new Date(r.date).toLocaleDateString("ar-EG")}</span></li>
          ))}</ul>
        )}
      </section>
      <div className="flex gap-3">
        <button onClick={() => update((x) => ({ ...x, unlocked: worlds.map((w) => w.slug) }))} className="btn-chunky bg-sky text-ink-on-color">فتح كل العوالم</button>
        <button onClick={() => confirm("هل تريد مسح كل التقدم؟") && update((x) => ({ ...defaultProgress, unlocked: [worlds[0]!.slug], name: x.name, avatar: x.avatar }))} className="btn-chunky bg-destructive text-destructive-foreground">إعادة ضبط التقدم</button>
      </div>
    </div>
  );
}
