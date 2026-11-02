import { useState } from "react";
import { useStudents } from "@/lib/progress";

const AVATARS = ["🧒", "👧", "🧕", "👦", "🦁", "🐱"];

export function StudentPicker() {
  const { students, activeId, add, select, remove } = useStudents();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]!);
  return (
    <div className="bg-card rounded-3xl p-4 pop space-y-3">
      <h2 className="text-xl font-black">👥 مين هيلعب دلوقتي؟</h2>
      <div className="flex flex-wrap gap-2">
        {students.map((s) => (
          <div key={s.id} className={`flex items-center gap-1 rounded-full ps-3 pe-1 py-1 font-bold ${s.id === activeId ? "bg-emerald text-ink-on-color" : "bg-muted"}`}>
            <button onClick={() => select(s.id)} className="flex items-center gap-1">
              <span className="text-xl">{s.avatar}</span>{s.name}<span className="text-xs opacity-80">⭐{s.stars}</span>
            </button>
            {students.length > 1 && (
              <button aria-label={`حذف ${s.name}`} onClick={() => confirm(`حذف الطالب ${s.name} وكل نتائجه؟`) && remove(s.id)}
                className="w-6 h-6 rounded-full hover:bg-card/30 text-sm">✕</button>
            )}
          </div>
        ))}
      </div>
      <form className="flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; add(name, avatar); setName(""); }}>
        <select aria-label="الصورة" value={avatar} onChange={(e) => setAvatar(e.target.value)} className="rounded-full bg-muted px-2 py-2">
          {AVATARS.map((a) => <option key={a}>{a}</option>)}
        </select>
        <input aria-label="اسم الطالب الجديد" placeholder="اسم الطالب الجديد" value={name} onChange={(e) => setName(e.target.value)}
          className="rounded-full bg-muted px-4 py-2 font-bold outline-none flex-1 min-w-36" />
        <button type="submit" className="btn-chunky bg-gold">+ إضافة طالب</button>
      </form>
    </div>
  );
}
