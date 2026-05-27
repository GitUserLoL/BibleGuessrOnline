import 'server-only';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Verse, BookStructure, BibleMeta, GameMode } from '@/types';

interface RawVerse {
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleData {
  verses: Verse[];
  books: BookStructure[];
  meta: BibleMeta;
}

let cache: BibleData | null = null;

function build(): BibleData {
  const raw = JSON.parse(readFileSync(join(process.cwd(), 'kjv.json'), 'utf-8'));
  const rawVerses: RawVerse[] = raw.verses;

  const verses: Verse[] = rawVerses.map((v, index) => ({
    ...v,
    text: v.text.replace(/^¶\s*/, '').replace(/\[([^\]]*)\]/g, '$1'),
    index,
  }));

  // Build per-book structure
  const bookMap = new Map<number, { name: string; startIndex: number; chapters: Map<number, number> }>();
  for (const v of verses) {
    if (!bookMap.has(v.book)) {
      bookMap.set(v.book, { name: v.book_name, startIndex: v.index, chapters: new Map() });
    }
    const b = bookMap.get(v.book)!;
    b.chapters.set(v.chapter, (b.chapters.get(v.chapter) ?? 0) + 1);
  }

  const books: BookStructure[] = Array.from(bookMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([id, data]) => {
      const maxChapter = Math.max(...data.chapters.keys());
      const chapterVerseCounts = Array.from({ length: maxChapter }, (_, i) => data.chapters.get(i + 1) ?? 0);
      return {
        id,
        name: data.name,
        testament: id <= 39 ? ('OT' as const) : ('NT' as const),
        startIndex: data.startIndex,
        chapterVerseCounts,
      };
    });

  const otVerseCount = verses.filter(v => v.book <= 39).length;
  const ntBook = books.find(b => b.testament === 'NT')!;

  const meta: BibleMeta = {
    books,
    otVerseCount,
    ntVerseCount: verses.length - otVerseCount,
    ntStartIndex: ntBook.startIndex,
  };

  return { verses, books, meta };
}

function getData(): BibleData {
  if (!cache) cache = build();
  return cache;
}

export function getVersesByMode(mode: GameMode): Verse[] {
  const { verses } = getData();
  if (mode === 'full') return verses;
  if (mode === 'ot') return verses.filter(v => v.book <= 39);
  return verses.filter(v => v.book >= 40);
}

export function getBibleMeta(): BibleMeta {
  return getData().meta;
}

export function getModeVerseCount(mode: GameMode): number {
  const { meta } = getData();
  if (mode === 'full') return meta.otVerseCount + meta.ntVerseCount;
  if (mode === 'ot') return meta.otVerseCount;
  return meta.ntVerseCount;
}
