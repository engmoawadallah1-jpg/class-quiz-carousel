import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import younes from "@/assets/younes.png";
import hakeem from "@/assets/hakeem.png";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "رحلة الإيمان – رحلة المعرفة والمغامرة" },
      { name: "description", content: "انطلق مع يونس وفلفل والمعلم حكيم في رحلة ممتعة لتعلم العقيدة والآداب الإسلامية." },
      { property: "og:title", content: "رحلة الإيمان – رحلة المعرفة والمغامرة" },
      { property: "og:description", content: "مغامرات وأسئلة ومسابقة المليون للأطفال المسلمين." },
    ],
  }),
  component: Index,
});

const modes = [
  { to: "/adventure", title: "رحلة المغامرات", desc: "خمسة عوالم تنتظرك!", icon: "🗺️", tone: "bg-emerald" },
  { to: "/millionaire", title: "من سيربح المليون؟", desc: "١٠ أسئلة ووسائل مساعدة", icon: "💰", tone: "bg-gold" },
  { to: "/knowledge", title: "بنك المعرفة", desc: "راجع كل الأسئلة والآداب", icon: "📚", tone: "bg-sky" },
] as const;

function Index() {
  const [p, update] = useProgress();
  return (
    <div className="space-y-10">
      <section className="grid md:grid-cols-2 items-center gap-6">
        <div className="space-y-5">
          <h1 className="text-4xl md:text-6xl font-black leading-tight">رحلة الإيمان <span className="block text-primary text-3xl md:text-4xl mt-2">رحلة المعرفة والمغامرة</span></h1>
          <p className="text-lg">مرحباً يا بطل! أنا <b>يونس</b> وهذا صديقي القط <b>فلفل</b>. هيا نتعلم معاً العقيدة الصحيحة والآداب الجميلة!</p>
          <label className="flex items-center gap-2 bg-card rounded-full p-2 pe-4 pop w-fit">
            <span className="text-2xl">{p.avatar}</span>
            <input aria-label="اسمك" className="bg-transparent outline-none font-bold w-36" value={p.name}
              onChange={(e) => update((x) => ({ ...x, name: e.target.value }))} />
            <select aria-label="الصورة" className="bg-transparent" value={p.avatar} onChange={(e) => update((x) => ({ ...x, avatar: e.target.value }))}>
              {["🧒", "👧", "🧕", "👦", "🦁", "🐱"].map((a) => <option key={a}>{a}</option>)}
            </select>
          </label>
          <Link to="/adventure" className="btn-chunky bg-emerald text-ink-on-color text-xl inline-block">ابدأ المغامرة 🚀</Link>
        </div>
        <motion.img src={younes} alt="يونس وفلفل" width={1024} height={1024} className="w-full max-w-md mx-auto drop-shadow-xl"
          animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity }} />
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {modes.map((m, i) => (
          <motion.div key={m.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.04 }}>
            <Link to={m.to} className={`block ${m.tone} text-ink-on-color rounded-3xl p-6 pop`}>
              <div className="text-5xl">{m.icon}</div>
              <h2 className="text-2xl font-black mt-2">{m.title}</h2>
              <p className="opacity-90">{m.desc}</p>
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="flex items-center gap-4 bg-card rounded-3xl p-5 pop">
        <img src={hakeem} alt="المعلم حكيم" width={1024} height={1024} loading="lazy" className="w-24 h-24 object-contain" />
        <p className="text-lg"><b>المعلم حكيم يقول:</b> "من قال بسم الله قبل كل عمل، بارك الله له فيه. تعلّم كل يوم أدباً جديداً!"</p>
      </section>
    </div>
  );
}
