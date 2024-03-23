export type Keyword = {
  name: string;
  description: string;
};

export const KEYWORDS = {
  EXHAUSTED: {
    name: 'Exhausted',
    description: 'This unit has already acted this turn.'
  },
  RUSH: {
    name: 'Rush',
    description: 'Can move and attack immediately.'
  },
  OPENING_GAMBIT: {
    name: 'Opening Gambit',
    description: 'Triggers an effect when summoned from your action bar.'
  }
} satisfies Record<string, Keyword>;
