'use client';

import { motion } from 'framer-motion';
import { getScoreColor } from '@/lib/scoring';

interface Score {
  id: string;
  total_score: number;
  played_at: string;
  profiles?: { username: string } | null;
}

interface Props {
  scores: Score[];
}

export default function ChallengeScoreboard({ scores }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-4"
    >
      <div className="text-xs text-white/40 uppercase tracking-widest mb-4 font-semibold">
        Scores
      </div>
      <div className="flex flex-col gap-2">
        {scores.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3"
          >
            <div className="w-5 text-xs text-white/30 text-right">{i + 1}</div>
            <div className="flex-1 text-sm text-white/70 truncate">
              {s.profiles?.username ?? 'Anonymous'}
            </div>
            <div className="font-bold text-sm" style={{ color: getScoreColor(s.total_score) }}>
              {s.total_score.toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
