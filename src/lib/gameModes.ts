import type { GameMode, BookStructure, BibleMeta } from '@/types';

// Reference verse count — full KJV Bible. Decay rate is calibrated against this.
export const FULL_BIBLE_VERSE_COUNT = 31102;

// Book ID ranges (inclusive) for each category mode
export const CATEGORY_BOOK_RANGES: Partial<Record<GameMode, [number, number]>> = {
  law:              [1,  5],
  history:          [6,  17],
  'major-prophets': [23, 27],
  'minor-prophets': [28, 39],
  gospels:          [40, 43],
  acts:             [44, 44],
  letters:          [45, 65],
  revelation:       [66, 66],
};

export function getModeBookRange(mode: GameMode): [number, number] {
  if (mode === 'full') return [1, 66];
  if (mode === 'ot')   return [1, 39];
  if (mode === 'nt')   return [40, 66];
  return CATEGORY_BOOK_RANGES[mode] ?? [1, 66];
}

export function filterBooksByMode(mode: GameMode, books: BookStructure[]): BookStructure[] {
  const [min, max] = getModeBookRange(mode);
  return books.filter(b => b.id >= min && b.id <= max);
}

export function getModeVerseCountFromMeta(mode: GameMode, meta: BibleMeta): number {
  return filterBooksByMode(mode, meta.books)
    .reduce((sum, b) => sum + b.chapterVerseCounts.reduce((s, c) => s + c, 0), 0);
}

export function getModeStartIndexFromMeta(mode: GameMode, meta: BibleMeta): number {
  const [minBook] = getModeBookRange(mode);
  return meta.books.find(b => b.id === minBook)?.startIndex ?? 0;
}
