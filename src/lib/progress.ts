import { useEffect, useState, useCallback } from "react";
import { worlds } from "@/data/questionsData";

export interface Progress {
  name: string;
  avatar: string;
  stars: number;
  unlocked: string[];
  completed: Record<string, number>; // world slug -> best correct count
  results: { mode: string; score: number; total: number; date: string }[];
  bestPrize: number;
}

const KEY = "rehlat-iman-progress";
const STORE = "rehlat-iman-students";
export interface Student extends Progress { id: string }
interface Store { students: Student[]; activeId: string }
export const defaultProgress: Progress = {
  name: "يونس", avatar: "🧒", stars: 0, unlocked: [worlds[0]!.slug], completed: {}, results: [], bestPrize: 0,
};
const newId = () => Math.random().toString(36).slice(2, 10);
export function newStudent(name: string, avatar = "🧒"): Student {
  return { ...defaultProgress, unlocked: [worlds[0]!.slug], name, avatar, id: newId() };
}

export function levelFor(stars: number) {
  const level = Math.floor(stars / 50) + 1;
  return { level, inLevel: stars % 50, need: 50 };
}

function readStore(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || "null") as Store | null;
    if (s && s.students?.length) return s;
  } catch { /* ignore */ }
  // migrate the old single-player progress if present
  let first = newStudent("يونس");
  try { const old = JSON.parse(localStorage.getItem(KEY) || "null"); if (old) first = { ...defaultProgress, ...old, id: first.id }; } catch { /* ignore */ }
  return { students: [first], activeId: first.id };
}
function writeStore(s: Store) {
  localStorage.setItem(STORE, JSON.stringify(s));
  window.dispatchEvent(new Event("progress-change"));
}
const activeOf = (s: Store) => s.students.find((x) => x.id === s.activeId) ?? s.students[0]!;

function useStore() {
  const [s, setS] = useState<Store | null>(null);
  useEffect(() => {
    setS(readStore());
    const h = () => setS(readStore());
    window.addEventListener("progress-change", h);
    return () => window.removeEventListener("progress-change", h);
  }, []);
  return s;
}

export function useProgress() {
  const s = useStore();
  const p: Progress = s ? activeOf(s) : defaultProgress;
  const update = useCallback((fn: (p: Progress) => Progress) => {
    const st = readStore(); const cur = activeOf(st);
    const next = { ...fn(cur), id: cur.id } as Student;
    writeStore({ ...st, students: st.students.map((x) => (x.id === cur.id ? next : x)) });
  }, []);
  return [p, update] as const;
}

export function useStudents() {
  const s = useStore();
  const students = s?.students ?? [];
  const activeId = s ? activeOf(s).id : "";
  const add = useCallback((name: string, avatar: string) => {
    const st = readStore(); const n = newStudent(name.trim() || "طالب جديد", avatar);
    writeStore({ students: [...st.students, n], activeId: n.id });
  }, []);
  const select = useCallback((id: string) => { writeStore({ ...readStore(), activeId: id }); }, []);
  const remove = useCallback((id: string) => {
    const st = readStore(); const rest = st.students.filter((x) => x.id !== id);
    if (!rest.length) return;
    writeStore({ students: rest, activeId: st.activeId === id ? rest[0]!.id : st.activeId });
  }, []);
  return { students, activeId, add, select, remove };
}

export function completeWorld(p: Progress, slug: string, correct: number, total: number): Progress {
  const idx = worlds.findIndex((w) => w.slug === slug);
  const unlocked = new Set(p.unlocked);
  if (correct / total >= 0.5 && worlds[idx + 1]) unlocked.add(worlds[idx + 1]!.slug);
  return {
    ...p,
    unlocked: [...unlocked],
    completed: { ...p.completed, [slug]: Math.max(p.completed[slug] || 0, correct) },
    results: [{ mode: worlds[idx]!.name, score: correct, total, date: new Date().toISOString() }, ...p.results].slice(0, 30),
  };
}

let ctx: AudioContext | null = null;
export function playSound(kind: "correct" | "wrong" | "win") {
  try {
    ctx ??= new AudioContext();
    const notes = kind === "correct" ? [523, 659, 784] : kind === "win" ? [523, 659, 784, 1046, 1318] : [330, 262];
    notes.forEach((f, i) => {
      const o = ctx!.createOscillator(); const g = ctx!.createGain();
      o.type = kind === "wrong" ? "sine" : "triangle"; o.frequency.value = f;
      const t = ctx!.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g).connect(ctx!.destination); o.start(t); o.stop(t + 0.32);
    });
  } catch { /* audio unavailable */ }
}
