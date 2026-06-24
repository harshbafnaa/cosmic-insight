// ============================================================================
// Numerology — deterministic Pythagorean calculations.
// These are pure math (no AI). The Claude service only adds narrative meaning.
// ============================================================================

const PYTHAGOREAN: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const MASTER = new Set([11, 22, 33]);

/** Reduce a number to a single digit, preserving master numbers 11/22/33. */
export function reduce(n: number): number {
  while (n > 9 && !MASTER.has(n)) {
    n = String(n)
      .split('')
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

export function isMaster(n: number): boolean {
  return MASTER.has(n);
}

function lettersOnly(name: string): string[] {
  return name
    .toLowerCase()
    .split('')
    .filter((c) => c >= 'a' && c <= 'z');
}

/** Life Path: sum of every digit in the date of birth (YYYY-MM-DD), reduced. */
export function lifePathNumber(dob: string): number {
  const digits = dob.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const sum = digits.split('').reduce((s, d) => s + Number(d), 0);
  return reduce(sum);
}

/** Birthday number: the day of the month, reduced. */
export function birthdayNumber(dob: string): number {
  // expects ISO-ish yyyy-mm-dd
  const parts = dob.split(/[-/]/);
  const day = Number(parts[2] ?? parts[0]);
  if (!day || Number.isNaN(day)) return 0;
  return reduce(day);
}

/** Destiny / Expression: sum of all letters of the full name. */
export function destinyNumber(name: string): number {
  const sum = lettersOnly(name).reduce((s, c) => s + (PYTHAGOREAN[c] || 0), 0);
  return reduce(sum);
}

/** Soul Urge / Heart's Desire: sum of vowels. */
export function soulUrgeNumber(name: string): number {
  const sum = lettersOnly(name)
    .filter((c) => VOWELS.has(c))
    .reduce((s, c) => s + (PYTHAGOREAN[c] || 0), 0);
  return reduce(sum);
}

/** Personality: sum of consonants. */
export function personalityNumber(name: string): number {
  const sum = lettersOnly(name)
    .filter((c) => !VOWELS.has(c))
    .reduce((s, c) => s + (PYTHAGOREAN[c] || 0), 0);
  return reduce(sum);
}

export interface CoreNumbers {
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthday: number;
}

export function computeCoreNumbers(name: string, dob: string): CoreNumbers {
  return {
    lifePath: lifePathNumber(dob),
    destiny: destinyNumber(name),
    soulUrge: soulUrgeNumber(name),
    personality: personalityNumber(name),
    birthday: birthdayNumber(dob),
  };
}

/** Built-in fallback meanings (used when the AI is unavailable). */
export const NUMBER_MEANINGS: Record<number, string> = {
  1: 'The Leader — independent, pioneering, driven by ambition and originality.',
  2: 'The Diplomat — sensitive, cooperative, a natural peacemaker and partner.',
  3: 'The Communicator — creative, expressive, joyful and socially magnetic.',
  4: 'The Builder — disciplined, practical, grounded and dependable.',
  5: 'The Free Spirit — adventurous, adaptable, hungry for change and freedom.',
  6: 'The Nurturer — responsible, caring, devoted to family and harmony.',
  7: 'The Seeker — analytical, introspective, drawn to wisdom and the unseen.',
  8: 'The Powerhouse — ambitious, authoritative, oriented toward success and abundance.',
  9: 'The Humanitarian — compassionate, idealistic, here to serve a larger purpose.',
  11: 'Master 11 — the Intuitive: heightened insight, inspiration and spiritual sensitivity.',
  22: 'Master 22 — the Master Builder: turns grand visions into lasting reality.',
  33: 'Master 33 — the Master Teacher: selfless service guided by compassion.',
};

export const NUMBER_COLORS: Record<number, string[]> = {
  1: ['Red', 'Gold'], 2: ['Silver', 'Cream'], 3: ['Yellow', 'Lilac'],
  4: ['Green', 'Grey'], 5: ['Turquoise', 'White'], 6: ['Blue', 'Pink'],
  7: ['Purple', 'Sea Green'], 8: ['Black', 'Deep Blue'], 9: ['Crimson', 'Coral'],
  11: ['Silver', 'Pale Yellow'], 22: ['Coral', 'Russet'], 33: ['Gold', 'Rose'],
};
