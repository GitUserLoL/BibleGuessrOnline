// SVG avatar icon library — replaces emoji avatars throughout the app.
// Every icon is designed for viewBox="0 0 24 24" with stroke="currentColor".

import type { ReactNode } from 'react';

interface IconDef {
  label: string;
  node: ReactNode;
}

export const AVATAR_ICONS: Record<string, IconDef> = {
  cross: {
    label: 'Cross',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M5 9h14" />,
  },
  fish: {
    label: 'Fish',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12Q10 5 18 12Q10 19 3 12Z" />
        <path strokeLinecap="round" d="M18 8l3.5-3.5M18 16l3.5 3.5" />
      </>
    ),
  },
  flame: {
    label: 'Flame',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />,
  },
  crown: {
    label: 'Crown',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18h18M3 18l3-9 4.5 5L12 6l1.5 8L18 9l3 9" />
      </>
    ),
  },
  shield: {
    label: 'Shield',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
  },
  star: {
    label: 'Star',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />,
  },
  anchor: {
    label: 'Anchor',
    node: (
      <>
        <circle cx="12" cy="6" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v12M7 13h10M7 21q5-5 10 0" />
      </>
    ),
  },
  dove: {
    label: 'Dove',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9C10 6 6 5 4 7c-2 2-1 5 1 7l7 5 7-5c2-2 3-5 1-7-2-2-6-1-8 2z" />
        <path strokeLinecap="round" d="M12 21v-5" />
      </>
    ),
  },
  book: {
    label: 'Book',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  },
  scroll: {
    label: 'Scroll',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        <path strokeLinecap="round" d="M8 9h8M8 12h8M8 15h5" />
        <path d="M5 4C5 4 3 4 3 6S5 8 5 8M19 4C19 4 21 4 21 6S19 8 19 8" strokeLinecap="round" />
      </>
    ),
  },
  key: {
    label: 'Key',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />,
  },
  bell: {
    label: 'Bell',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />,
  },
  harp: {
    label: 'Harp',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 21C5 10 8 4 12 4C16 4 19 10 19 21" />
        <path strokeLinecap="round" d="M5 21h14" />
        <path strokeLinecap="round" d="M7 21V15M9.5 21V11M12 21V10M14.5 21V11M17 21V15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 14C5 14 5 9 12 7" />
      </>
    ),
  },
  sword: {
    label: 'Sword',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 19L19 5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l-4 4M9 16l1 2-4 2M15 8l-2-1 2-4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7l-3-3 7-1-1 7z" />
      </>
    ),
  },
  sun: {
    label: 'Sun',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />,
  },
  moon: {
    label: 'Moon',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />,
  },
  mountain: {
    label: 'Mountain',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M3 20l6.5-12 4 6 3-4.5L21 20H3z" />,
  },
  wave: {
    label: 'Wave',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 17c2-5 4-5 6 0s4 5 6 0 4-5 6 0" />
      </>
    ),
  },
  leaf: {
    label: 'Leaf',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 8C6 4 12 3 18 4C17 9 15 14 12 16 9 14 7 9 6 8z" />
      </>
    ),
  },
  feather: {
    label: 'Feather',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 4C14 4 4 8 3 18c4-1 8-5 9-8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 4L8 16" />
        <path strokeLinecap="round" d="M8 16L5 19" />
      </>
    ),
  },
  heart: {
    label: 'Heart',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />,
  },
  eye: {
    label: 'Eye',
    node: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
  },
  sparkles: {
    label: 'Sparkles',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />,
  },
  bolt: {
    label: 'Bolt',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />,
  },
  home: {
    label: 'Temple',
    node: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
  },
};

export const AVATAR_ICON_KEYS = Object.keys(AVATAR_ICONS);

// Returns true if the value is a known icon key (not a legacy emoji)
export function isIconKey(value: string | null): boolean {
  return value !== null && value in AVATAR_ICONS;
}
