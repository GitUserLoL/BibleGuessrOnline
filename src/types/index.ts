export type GameMode = 'full' | 'ot' | 'nt';

export interface Verse {
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  index: number;
}

export interface BookStructure {
  id: number;
  name: string;
  testament: 'OT' | 'NT';
  startIndex: number;
  chapterVerseCounts: number[];
}

export interface BibleMeta {
  books: BookStructure[];
  otVerseCount: number;
  ntVerseCount: number;
  ntStartIndex: number;
}

export interface RoundResult {
  verse: Verse;
  guessBookId: number;
  guessBookName: string;
  guessChapter: number;
  guessVerse: number;
  guessIndex: number;
  score: number;
}

export interface AsyncMatch {
  id: string;
  seed: number;
  game_mode: GameMode;
  created_by: string | null;
  expires_at: string;
}

export interface AsyncScore {
  id: string;
  match_id: string;
  profile_id: string;
  total_score: number;
  played_at: string;
  profiles?: { username: string };
}
