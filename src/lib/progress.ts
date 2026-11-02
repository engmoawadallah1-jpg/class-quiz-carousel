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
export const defaultProgress: Progress = {
  name: "يونس", avatar: "🧒", stars: 0, unlocked: [worlds[0]!.slug], completed: {}, results: [], bestPrize: 0,
};

export function levelFor(stars: number) {
  const level = Math.floor(stars / 50) + 1;
  return { level, inLevel: stars % 50, need: 50 };
}

function read(): Progress {
  try { return { ...defaultProgress, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return defaultProgress; }
}

export function useProgress() {
  const [p, setP] = useState<Progress>(defaultProgress);
  useEffect(() => {
    setP(read());
    const h = () => setP(read());
    window.addEventListener("progress-change", h);
    return () => window.removeEventListener("progress-change", h);
  }, []);
  const update = useCallback((fn: (p: Progress) => Progress) => {
    const next = fn(read());
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("progress-change"));
  }, []);
  return [p, update] as const;
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
