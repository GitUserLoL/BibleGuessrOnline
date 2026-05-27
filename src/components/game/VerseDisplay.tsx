'use client';

import { motion } from 'framer-motion';

interface Props {
  text: string;
  roundNumber: number;
}

export default function VerseDisplay({ text, roundNumber }: Props) {
  return (
    <motion.div
      key={roundNumber}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full"
    >
      <div className="absolute -top-3 -left-3 text-6xl text-amber-500/20 font-serif leading-none select-none">
        &ldquo;
      </div>
      <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-2xl">
        <p
          className="text-xl md:text-2xl lg:text-3xl text-white/90 font-serif leading-relaxed tracking-wide select-none"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {text}
        </p>
        <div className="absolute -bottom-2 -right-3 text-6xl text-amber-500/20 font-serif leading-none select-none rotate-180">
          &ldquo;
        </div>
      </div>
    </motion.div>
  );
}
