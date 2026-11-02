import { motion } from "framer-motion";

const bits = ["⭐", "✨", "🌟", "🎉", "💛"];
export function Confetti({ count = 24 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span key={i} className="absolute text-2xl"
          style={{ left: `${(i * 37) % 100}%`, top: "-5%" }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: 360, opacity: 0.6 }}
          transition={{ duration: 1.6 + (i % 5) * 0.3, delay: (i % 8) * 0.06, ease: "easeIn" }}>
          {bits[i % bits.length]}
        </motion.span>
      ))}
    </div>
  );
}
