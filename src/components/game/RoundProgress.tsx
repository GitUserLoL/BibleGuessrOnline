'use client';

import { motion } from 'framer-motion';

interface Props {
  total: number;
  current: number;
  scores: number[];
}

export default function RoundProgress({ total, current, scores }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                isDone
                  ? 'bg-[var(--gold)] border-[var(--gold-dim)] text-[#0d0b09]'
                  : isActive
                  ? 'bg-[var(--bg-raised)] border-[var(--gold)] text-[var(--gold)]'
                  : 'bg-[var(--bg-card)] border-[var(--bl)] text-[rgba(237,232,220,0.25)]'
              }`}
            >
              {i + 1}
            </div>
            {isDone && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] text-[var(--gold)] font-bold tabular-nums"
              >
                {scores[i].toLocaleString()}
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
