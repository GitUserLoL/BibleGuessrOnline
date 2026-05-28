'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BookStructure, GameMode } from '@/types';
import { filterBooksByMode } from '@/lib/gameModes';

type Step = 'book' | 'chapter' | 'verse';

interface Props {
  bibleStructure: BookStructure[];
  mode: GameMode;
  onSubmit: (bookId: number, chapter: number, verse: number) => void;
  disabled: boolean;
}

interface BookListProps {
  otBooks: BookStructure[];
  ntBooks: BookStructure[];
  mode: GameMode;
  selectedBook: BookStructure | null;
  onSelect: (book: BookStructure) => void;
  compact?: boolean;
}

const BookList = memo(function BookList({ otBooks, ntBooks, mode, selectedBook, onSelect, compact }: BookListProps) {
  return (
    <>
      {otBooks.length > 0 && (
        <>
          {mode === 'full' && (
            <div className="px-3 py-2 label-caps sticky top-0 bg-[var(--bg-card)]/95 backdrop-blur-sm border-b border-[var(--bl)]">
              Old Testament
            </div>
          )}
          {otBooks.map(book => (
            <button
              key={book.id}
              onClick={() => onSelect(book)}
              className={`w-full text-left flex items-center gap-2 transition-colors ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'} ${
                selectedBook?.id === book.id
                  ? 'bg-[var(--gold-muted)] text-[var(--gold)] font-semibold border-l-2 border-[var(--gold)]'
                  : 'text-[rgba(237,232,220,0.6)] hover:bg-[var(--bg-surface)] hover:text-[rgba(237,232,220,0.9)] border-l-2 border-transparent'
              }`}
            >
              {selectedBook?.id === book.id && (
                <span className="text-[var(--gold)] text-xs leading-none">▶</span>
              )}
              {book.name}
            </button>
          ))}
        </>
      )}
      {ntBooks.length > 0 && (
        <>
          {mode === 'full' && (
            <div className="px-3 py-2 label-caps sticky top-0 bg-[var(--bg-card)]/95 backdrop-blur-sm border-b border-[var(--bl)] border-t border-t-[var(--bl)]">
              New Testament
            </div>
          )}
          {ntBooks.map(book => (
            <button
              key={book.id}
              onClick={() => onSelect(book)}
              className={`w-full text-left flex items-center gap-2 transition-colors ${compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'} ${
                selectedBook?.id === book.id
                  ? 'bg-[var(--gold-muted)] text-[var(--gold)] font-semibold border-l-2 border-[var(--gold)]'
                  : 'text-[rgba(237,232,220,0.6)] hover:bg-[var(--bg-surface)] hover:text-[rgba(237,232,220,0.9)] border-l-2 border-transparent'
              }`}
            >
              {selectedBook?.id === book.id && (
                <span className="text-[var(--gold)] text-xs leading-none">▶</span>
              )}
              {book.name}
            </button>
          ))}
        </>
      )}
    </>
  );
});

function NumberGrid({
  count,
  selected,
  onSelect,
}: {
  count: number;
  selected: number | null;
  onSelect: (n: number) => void;
}) {
  return (
    <div className="p-2 grid grid-cols-5 gap-1.5">
      {Array.from({ length: count }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onSelect(n)}
          className={`aspect-square text-xs font-bold transition-all duration-100 ${
            selected === n
              ? 'bg-[var(--gold)] text-[#0d0b09] border-t-2 border-l-2 border-[var(--gold-light)] border-b-2 border-r-2 border-b-[var(--gold-dim)] border-r-[var(--gold-dim)]'
              : 'r-btn text-[rgba(237,232,220,0.5)] hover:text-[rgba(237,232,220,0.9)]'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function LockedPanel({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-[rgba(237,232,220,0.2)]">
      <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-center px-4">{message}</span>
    </div>
  );
}

export default function GuessSelector({ bibleStructure, mode, onSubmit, disabled }: Props) {
  const [selectedBook, setSelectedBook] = useState<BookStructure | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<Step>('book');

  const availableBooks = useMemo(() => filterBooksByMode(mode, bibleStructure), [mode, bibleStructure]);
  const otBooks = useMemo(() => availableBooks.filter(b => b.testament === 'OT'), [availableBooks]);
  const ntBooks = useMemo(() => availableBooks.filter(b => b.testament === 'NT'), [availableBooks]);

  const maxChapters = selectedBook?.chapterVerseCounts.length ?? 0;
  const maxVerses = selectedBook && selectedChapter
    ? selectedBook.chapterVerseCounts[selectedChapter - 1]
    : 0;

  const handleBookSelect = useCallback((book: BookStructure) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setActiveStep('chapter');
  }, []);

  function handleChapterSelect(ch: number) {
    setSelectedChapter(ch);
    setSelectedVerse(null);
    setActiveStep('verse');
  }

  function handleSubmit() {
    if (!selectedBook || !selectedChapter || !selectedVerse) return;
    onSubmit(selectedBook.id, selectedChapter, selectedVerse);
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setActiveStep('book');
  }

  const canSubmit = !!selectedBook && !!selectedChapter && !!selectedVerse && !disabled;

  const steps: { id: Step; label: string; value: string | null }[] = [
    { id: 'book',    label: 'Book',    value: selectedBook?.name ?? null },
    { id: 'chapter', label: 'Chapter', value: selectedChapter ? String(selectedChapter) : null },
    { id: 'verse',   label: 'Verse',   value: selectedVerse ? String(selectedVerse) : null },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Reference preview + submit */}
      <div className="flex items-center justify-between gap-3">
        <div className="r-panel-inset px-3 py-2 flex-1 min-w-0">
          <span className={`text-sm font-mono tabular-nums ${selectedBook ? 'text-[var(--gold)]' : 'text-[rgba(237,232,220,0.25)]'}`}>
            {selectedBook
              ? `${selectedBook.name}${selectedChapter ? ` ${selectedChapter}` : ''}${selectedVerse ? `:${selectedVerse}` : ''}`
              : 'Select a verse…'}
          </span>
        </div>
        <motion.button
          onClick={handleSubmit}
          disabled={!canSubmit}
          whileTap={canSubmit ? { scale: 0.97 } : {}}
          className={`shrink-0 px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all ${
            canSubmit ? 'r-btn-gold' : 'r-btn text-[rgba(237,232,220,0.25)] cursor-not-allowed opacity-40'
          }`}
        >
          Submit
        </motion.button>
      </div>

      {/* ── MOBILE: tabbed step-by-step ── */}
      <div className="md:hidden flex flex-col gap-2">
        {/* Step tabs */}
        <div className="r-panel flex">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => {
                if (step.id === 'chapter' && !selectedBook) return;
                if (step.id === 'verse' && !selectedChapter) return;
                setActiveStep(step.id);
              }}
              className={`flex-1 py-2.5 px-1 text-xs font-semibold uppercase tracking-widest transition-all flex flex-col items-center gap-0.5 ${
                activeStep === step.id
                  ? 'bg-[var(--bg-raised)] text-[#ede8dc]'
                  : step.value
                  ? 'text-[var(--gold)]'
                  : 'text-[rgba(237,232,220,0.25)]'
              }`}
            >
              <span>{step.label}</span>
              {step.value && (
                <span className="text-[9px] font-mono opacity-80 truncate w-full text-center">
                  {step.value}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="r-panel overflow-y-auto" style={{ height: 240 }}>
          <AnimatePresence mode="wait">
            {activeStep === 'book' && (
              <motion.div key="book" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BookList
                  otBooks={otBooks}
                  ntBooks={ntBooks}
                  mode={mode}
                  selectedBook={selectedBook}
                  onSelect={handleBookSelect}
                />
              </motion.div>
            )}
            {activeStep === 'chapter' && selectedBook && (
              <motion.div key="chapter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NumberGrid count={maxChapters} selected={selectedChapter} onSelect={handleChapterSelect} />
              </motion.div>
            )}
            {activeStep === 'verse' && selectedChapter && (
              <motion.div key="verse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NumberGrid count={maxVerses} selected={selectedVerse} onSelect={(v) => setSelectedVerse(v)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── DESKTOP: 3-panel side by side ── */}
      <div className="hidden md:grid grid-cols-[200px_1fr_1fr] gap-2 h-64">
        {/* Book panel */}
        <div className="r-panel overflow-y-auto">
          <div className="px-3 py-2 label-caps border-b border-[var(--bl)]">Book</div>
          <BookList
            otBooks={otBooks}
            ntBooks={ntBooks}
            mode={mode}
            selectedBook={selectedBook}
            onSelect={handleBookSelect}
            compact
          />
        </div>

        {/* Chapter panel */}
        <div className="r-panel overflow-y-auto flex flex-col">
          <div className="px-3 py-2 label-caps border-b border-[var(--bl)]">Chapter</div>
          <AnimatePresence mode="wait">
            {selectedBook ? (
              <motion.div
                key={selectedBook.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <NumberGrid count={maxChapters} selected={selectedChapter} onSelect={handleChapterSelect} />
              </motion.div>
            ) : (
              <div className="flex-1">
                <LockedPanel message="Select a book first" />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Verse panel */}
        <div className="r-panel overflow-y-auto flex flex-col">
          <div className="px-3 py-2 label-caps border-b border-[var(--bl)]">Verse</div>
          <AnimatePresence mode="wait">
            {selectedChapter && selectedBook ? (
              <motion.div
                key={`${selectedBook.id}-${selectedChapter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <NumberGrid count={maxVerses} selected={selectedVerse} onSelect={(v) => setSelectedVerse(v)} />
              </motion.div>
            ) : (
              <div className="flex-1">
                <LockedPanel message={selectedBook ? 'Select a chapter' : 'Select a book first'} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
