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

  useEffect(() => {
    if (!targetRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const target = targetRef.current;
    const offset = target.offsetTop - container.offsetTop - container.clientHeight / 2 + target.clientHeight / 2;
    container.scrollTop = offset;
  }, [roundNumber]);

  // Hard mode — single verse panel
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
        <div className="absolute -top-4 -left-2 text-5xl text-[var(--gold)] opacity-15 font-serif leading-none select-none">&ldquo;</div>
        <div className="r-panel p-8 md:p-10 shadow-2xl">
          <p
            className="text-xl md:text-2xl lg:text-3xl text-[rgba(237,232,220,0.92)] font-serif leading-relaxed tracking-wide select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            {text}
          </p>
        </div>
        <div className="absolute -bottom-3 -right-2 text-5xl text-[var(--gold)] opacity-15 font-serif leading-none select-none rotate-180">&ldquo;</div>
      </motion.div>
    );
  }

  // Easy mode — scrollable context list
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
        <span className="label-caps border border-[var(--gold-dim)] px-2 py-0.5 text-[var(--gold)]">Easy</span>
        <span className="text-[10px] text-[rgba(237,232,220,0.25)] uppercase tracking-wider font-semibold">
          Scroll to read context — guess the highlighted verse
        </span>
      </div>

      <div
        ref={containerRef}
        className="r-panel overflow-y-auto"
        style={{ height: 320 }}
      >
        {contextVerses.map((v) => {
          const isCurrent = v.index === currentVerseGlobalIndex;
          return (
            <div
              key={v.index}
              ref={isCurrent ? targetRef : null}
              className={`px-5 py-3 border-b border-[var(--bl)] last:border-0 transition-colors ${
                isCurrent
                  ? 'bg-[var(--gold-muted)] border-l-2 border-l-[var(--gold)]'
                  : ''
              }`}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
            >
              <p className={`font-serif leading-relaxed text-sm md:text-base select-none ${
                isCurrent ? 'text-[rgba(237,232,220,0.95)] font-medium' : 'text-[rgba(237,232,220,0.28)]'
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
