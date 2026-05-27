'use client';

import { useState } from 'react';
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

export default function GuessSelector({ bibleStructure, mode, onSubmit, disabled }: Props) {
  const [selectedBook, setSelectedBook] = useState<BookStructure | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<Step>('book');

  const availableBooks = filterBooksByMode(mode, bibleStructure);
  const otBooks = availableBooks.filter(b => b.testament === 'OT');
  const ntBooks = availableBooks.filter(b => b.testament === 'NT');

  const maxChapters = selectedBook?.chapterVerseCounts.length ?? 0;
  const maxVerses = selectedBook && selectedChapter
    ? selectedBook.chapterVerseCounts[selectedChapter - 1]
    : 0;

  function handleBookSelect(book: BookStructure) {
    setSelectedBook(book);
    setSelectedChapter(null);
    setSelectedVerse(null);
    setActiveStep('chapter');
  }

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
    { id: 'book', label: 'Book', value: selectedBook?.name ?? null },
    { id: 'chapter', label: 'Chapter', value: selectedChapter ? String(selectedChapter) : null },
    { id: 'verse', label: 'Verse', value: selectedVerse ? String(selectedVerse) : null },
  ];

  const BookList = ({ compact }: { compact?: boolean }) => (
    <>
      {otBooks.length > 0 && (
        <>
          {(mode === 'full') && (
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-[#c9a644]/60 uppercase sticky top-0 bg-[#181411]/95 backdrop-blur-sm">
              Old Testament
            </div>
          )}
          {otBooks.map(book => (
            <button
              key={book.id}
              onClick={() => handleBookSelect(book)}
              className={`w-full text-left px-4 transition-colors ${compact ? 'py-1.5 text-sm' : 'py-3 text-base'} ${
                selectedBook?.id === book.id
                  ? 'bg-[#c9a644]/15 text-[#d4b860] font-semibold'
                  : 'text-white/65 hover:bg-white/8 hover:text-white/90'
              }`}
            >
              {book.name}
            </button>
          ))}
        </>
      )}
      {ntBooks.length > 0 && (
        <>
          {mode === 'full' && (
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-[#c9a644]/60 uppercase sticky top-0 bg-[#181411]/95 backdrop-blur-sm">
              New Testament
            </div>
          )}
          {ntBooks.map(book => (
            <button
              key={book.id}
              onClick={() => handleBookSelect(book)}
              className={`w-full text-left px-4 transition-colors ${compact ? 'py-1.5 text-sm' : 'py-3 text-base'} ${
                selectedBook?.id === book.id
                  ? 'bg-[#c9a644]/15 text-[#d4b860] font-semibold'
                  : 'text-white/65 hover:bg-white/8 hover:text-white/90'
              }`}
            >
              {book.name}
            </button>
          ))}
        </>
      )}
    </>
  );

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Reference preview + submit */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-white/50 truncate">
          {selectedBook
            ? `${selectedBook.name}${selectedChapter ? ` ${selectedChapter}` : ''}${selectedVerse ? `:${selectedVerse}` : ''}`
            : 'Select a verse'}
        </div>
        <motion.button
          onClick={handleSubmit}
          disabled={!canSubmit}
          whileTap={{ scale: 0.95 }}
          className={`shrink-0 px-5 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
            canSubmit
              ? 'bg-[#c9a644] text-[#0d0b09] hover:bg-[#d4b860] shadow-[0_0_20px_rgba(201,166,68,0.2)]'
              : 'bg-white/8 text-white/25 cursor-not-allowed'
          }`}
        >
          Submit Guess
        </motion.button>
      </div>

      {/* ── MOBILE: tabbed step-by-step ── */}
      <div className="md:hidden flex flex-col gap-2">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
          {steps.map(step => (
            <button
              key={step.id}
              onClick={() => {
                if (step.id === 'chapter' && !selectedBook) return;
                if (step.id === 'verse' && !selectedChapter) return;
                setActiveStep(step.id);
              }}
              className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150 flex flex-col items-center gap-0.5 ${
                activeStep === step.id
                  ? 'bg-white/12 text-white'
                  : step.value
                  ? 'text-[#c9a644]'
                  : 'text-white/25'
              }`}
            >
              <span>{step.label}</span>
              {step.value && (
                <span className="text-[10px] font-normal opacity-80 truncate w-full text-center px-1">
                  {step.value}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-y-auto" style={{ height: 240 }}>
          <AnimatePresence mode="wait">
            {activeStep === 'book' && (
              <motion.div key="book" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <BookList />
              </motion.div>
            )}
            {activeStep === 'chapter' && selectedBook && (
              <motion.div
                key="chapter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3 grid grid-cols-5 gap-2"
              >
                {Array.from({ length: maxChapters }, (_, i) => i + 1).map(ch => (
                  <button
                    key={ch}
                    onClick={() => handleChapterSelect(ch)}
                    className={`aspect-square rounded-xl text-sm font-semibold transition-all ${
                      selectedChapter === ch ? 'bg-[#c9a644] text-[#0d0b09]' : 'bg-white/[0.04] text-white/55 hover:bg-white/10'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </motion.div>
            )}
            {activeStep === 'verse' && selectedChapter && (
              <motion.div
                key="verse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3 grid grid-cols-5 gap-2"
              >
                {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => (
                  <button
                    key={v}
                    onClick={() => setSelectedVerse(v)}
                    className={`aspect-square rounded-xl text-sm font-semibold transition-all ${
                      selectedVerse === v ? 'bg-[#c9a644] text-[#0d0b09]' : 'bg-white/[0.04] text-white/55 hover:bg-white/10'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── DESKTOP: 3-panel side by side ── */}
      <div className="hidden md:grid grid-cols-[200px_1fr_1fr] gap-3 h-64">
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-y-auto">
          <BookList compact />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-y-auto p-2">
          <AnimatePresence mode="wait">
            {selectedBook ? (
              <motion.div key={selectedBook.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-4 gap-1">
                {Array.from({ length: maxChapters }, (_, i) => i + 1).map(ch => (
                  <button
                    key={ch}
                    onClick={() => handleChapterSelect(ch)}
                    className={`aspect-square rounded-lg text-xs font-semibold transition-all duration-100 ${
                      selectedChapter === ch ? 'bg-[#c9a644] text-[#0d0b09]' : 'bg-white/[0.04] text-white/50 hover:bg-white/10 hover:text-white/90'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 text-sm">Select a book</div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl overflow-y-auto p-2">
          <AnimatePresence mode="wait">
            {selectedChapter && selectedBook ? (
              <motion.div key={`${selectedBook.id}-${selectedChapter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-4 gap-1">
                {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => (
                  <button
                    key={v}
                    onClick={() => setSelectedVerse(v)}
                    className={`aspect-square rounded-lg text-xs font-semibold transition-all duration-100 ${
                      selectedVerse === v ? 'bg-[#c9a644] text-[#0d0b09]' : 'bg-white/[0.04] text-white/50 hover:bg-white/10 hover:text-white/90'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 text-sm">
                {selectedBook ? 'Select a chapter' : 'Select a book first'}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
