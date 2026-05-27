'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BookStructure, GameMode } from '@/types';

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

  const availableBooks = bibleStructure.filter(b =>
    mode === 'full' ? true : mode === 'ot' ? b.testament === 'OT' : b.testament === 'NT'
  );

  const otBooks = availableBooks.filter(b => b.testament === 'OT');
  const ntBooks = availableBooks.filter(b => b.testament === 'NT');

  const maxChapters = selectedBook?.chapterVerseCounts.length ?? 0;
  const maxVerses = selectedBook && selectedChapter
    ? selectedBook.chapterVerseCounts[selectedChapter - 1]
    : 0;

  function handleBookSelect(book: BookStructure) {
    if (book.id === selectedBook?.id) return;
    setSelectedBook(book);
    setSelectedChapter(null);
    setSelectedVerse(null);
  }

  function handleChapterSelect(ch: number) {
    setSelectedChapter(ch);
    setSelectedVerse(null);
  }

  function handleSubmit() {
    if (!selectedBook || !selectedChapter || !selectedVerse) return;
    onSubmit(selectedBook.id, selectedChapter, selectedVerse);
    setSelectedBook(null);
    setSelectedChapter(null);
    setSelectedVerse(null);
  }

  const canSubmit = !!selectedBook && !!selectedChapter && !!selectedVerse && !disabled;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Selected reference preview */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/50">
          {selectedBook
            ? `${selectedBook.name}${selectedChapter ? ` ${selectedChapter}` : ''}${selectedVerse ? `:${selectedVerse}` : ''}`
            : 'Select a verse'}
        </div>
        <motion.button
          onClick={handleSubmit}
          disabled={!canSubmit}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
            canSubmit
              ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          Submit Guess
        </motion.button>
      </div>

      {/* 3-panel selector */}
      <div className="grid grid-cols-[200px_1fr_1fr] gap-3 h-64">
        {/* Books panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
          {otBooks.length > 0 && (
            <>
              {mode === 'full' && (
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-amber-500/70 uppercase sticky top-0 bg-[#0f1628]/90 backdrop-blur-sm">
                  Old Testament
                </div>
              )}
              {otBooks.map(book => (
                <button
                  key={book.id}
                  onClick={() => handleBookSelect(book)}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-100 ${
                    selectedBook?.id === book.id
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
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
                <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest text-amber-500/70 uppercase sticky top-0 bg-[#0f1628]/90 backdrop-blur-sm mt-1">
                  New Testament
                </div>
              )}
              {ntBooks.map(book => (
                <button
                  key={book.id}
                  onClick={() => handleBookSelect(book)}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors duration-100 ${
                    selectedBook?.id === book.id
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {book.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Chapters panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-y-auto p-2">
          <AnimatePresence mode="wait">
            {selectedBook ? (
              <motion.div
                key={selectedBook.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-4 gap-1"
              >
                {Array.from({ length: maxChapters }, (_, i) => i + 1).map(ch => (
                  <button
                    key={ch}
                    onClick={() => handleChapterSelect(ch)}
                    className={`aspect-square rounded-lg text-xs font-semibold transition-all duration-100 ${
                      selectedChapter === ch
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-white/60 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/20 text-sm">
                Select a book
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Verses panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-y-auto p-2">
          <AnimatePresence mode="wait">
            {selectedChapter && selectedBook ? (
              <motion.div
                key={`${selectedBook.id}-${selectedChapter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-4 gap-1"
              >
                {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => (
                  <button
                    key={v}
                    onClick={() => setSelectedVerse(v)}
                    className={`aspect-square rounded-lg text-xs font-semibold transition-all duration-100 ${
                      selectedVerse === v
                        ? 'bg-amber-500 text-black'
                        : 'bg-white/5 text-white/60 hover:bg-white/15 hover:text-white'
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
