import { Link } from "@tanstack/react-router";
import { useProgress, levelFor } from "@/lib/progress";

const nav = [
  { to: "/", label: "الرئيسية", icon: "🏠" },
  { to: "/adventure", label: "المغامرات", icon: "🗺️" },
  { to: "/millionaire", label: "المليون", icon: "💰" },
  { to: "/knowledge", label: "بنك المعرفة", icon: "📚" },
  { to: "/parent", label: "ولي الأمر", icon: "👨‍👩‍👦" },
] as const;

export function Header() {
  const [p] = useProgress();
  const lv = levelFor(p.stars);
  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b-4 border-gold">
      <div className="mx-auto max-w-6xl flex flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl rounded-full bg-accent w-12 h-12 grid place-items-center">{p.avatar}</span>
          <div>
            <div className="font-extrabold font-display">{p.name}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-primary text-primary-foreground px-2">المستوى {lv.level}</span>
              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald" style={{ width: `${(lv.inLevel / lv.need) * 100}%` }} /></div>
            </div>
          </div>
          <span className="ms-2 rounded-full bg-gold px-3 py-1 font-extrabold">⭐ {p.stars}</span>
        </div>
        <nav className="flex flex-wrap gap-1 ms-auto">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-bold hover:bg-muted"
              activeProps={{ className: "bg-sky text-ink-on-color" }}>
              <span className="me-1">{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
