// Date utilities – all pure functions, no side-effects.

/** Returns today's ISO date (YYYY-MM-DD) in the given IANA timezone. */
export function localDate(tz: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: tz });
}

/** Returns the ISO day-of-week (1=Mon … 7=Sun) for a YYYY-MM-DD string. */
export function isoDow(date: string): number {
  const d = new Date(`${date}T00:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}

/** Returns the Monday-to-Sunday week that contains `date`. */
export function weekOf(date: string): string[] {
  const dow = isoDow(date); // 1–7
  const base = new Date(`${date}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() - (dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

/** Adds `days` (may be negative) to a YYYY-MM-DD string. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** e.g. "Sunday, 4 October 2026" */
export function longDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

