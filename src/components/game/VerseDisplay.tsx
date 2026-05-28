'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Verse } from '@/types';

interface Props {
  text: string;
  roundNumber: number;
  contextVerses?: Verse[];
  currentVerseGlobalIndex?: number;
}

export default function VerseDisplay({ text, roundNumber, contextVerses, currentVerseGlobalIndex }: Props) {
  const targetRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll the highlighted verse into the centre of the context panel on each new round
  useEffect(() => {
    if (!targetRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const target = targetRef.current;
    const offset = target.offsetTop - container.offsetTop - container.clientHeight / 2 + target.clientHeight / 2;
    container.scrollTop = offset;
  }, [roundNumber]);

  // Hard mode — original single-verse display
  if (!contextVerses || contextVerses.length === 0) {
    return (
      <motion.div
        key={roundNumber}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full"
      >
        <div className="absolute -top-3 -left-3 text-6xl text-[#c9a644]/15 font-serif leading-none select-none">&ldquo;</div>
        <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 backdrop-blur-sm shadow-2xl">
          <p
            className="text-xl md:text-2xl lg:text-3xl text-white/90 font-serif leading-relaxed tracking-wide select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            {text}
          </p>
        </div>
        <div className="absolute -bottom-2 -right-3 text-6xl text-[#c9a644]/15 font-serif leading-none select-none rotate-180">&ldquo;</div>
      </motion.div>
    );
  }

  // Easy mode — scrollable context list, target verse highlighted
  return (
    <motion.div
      key={roundNumber}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold tracking-[0.15em] text-[#c9a644]/50 uppercase border border-[#c9a644]/20 rounded px-1.5 py-0.5">
          Easy
        </span>
        <span className="text-[11px] text-white/25">Scroll to read context — guess the highlighted verse</span>
      </div>

      <div
        ref={containerRef}
        className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-y-auto"
        style={{ height: 320 }}
      >
        {contextVerses.map((v) => {
          const isCurrent = v.index === currentVerseGlobalIndex;
          return (
            <div
              key={v.index}
              ref={isCurrent ? targetRef : null}
              className={`px-5 py-3 border-b border-white/[0.04] last:border-0 transition-colors ${
                isCurrent
                  ? 'bg-[#c9a644]/8 border-l-2 border-l-[#c9a644]'
                  : ''
              }`}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
            >
              <p className={`font-serif leading-relaxed tracking-wide text-sm md:text-base select-none ${
                isCurrent ? 'text-white/95 font-medium' : 'text-white/30'
              }`}>
                {v.text}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
