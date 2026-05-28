'use client';

import { motion } from 'framer-motion';

interface Props {
  total: number;
  current: number;
  scores: number[];
}

export default function RoundProgress({ total, current, scores }: Props) {
  return (
    <div className="flex items-center gap-3">
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
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                isDone
                  ? 'bg-[#c9a644] border-[#c9a644] text-[#0d0b09]'
                  : isActive
                  ? 'border-[#c9a644] text-[#c9a644] shadow-[0_0_12px_rgba(201,166,68,0.4)]'
                  : 'border-white/20 text-white/30'
              }`}
            >
              {i + 1}
            </div>
            {isDone && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-[#c9a644] font-semibold"
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
