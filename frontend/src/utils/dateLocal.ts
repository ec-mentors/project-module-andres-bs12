/**
 * Local-calendar date helpers.
 * Avoid Date#toISOString().split('T')[0] — it shifts the day in timezones ahead of UTC.
 */

/** Format a Date as YYYY-MM-DD in the local timezone. */
export function toLocalYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Normalize a meal entry's createdOn (ISO string, date-only, or Jackson array)
 * to a local YYYY-MM-DD calendar day.
 */
export function entryCreatedOnToLocalYmd(createdOn: unknown): string | null {
  if (createdOn == null || createdOn === '') return null;

  if (Array.isArray(createdOn) && createdOn.length >= 3) {
    const [y, m, d] = createdOn;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  if (typeof createdOn === 'string') {
    // LocalDateTime / date-only from the API: trust the calendar prefix.
    // Do NOT parse via Date() — that shifts the day for UTC/"Z" strings.
    const prefix = createdOn.match(/^(\d{4}-\d{2}-\d{2})/);
    if (prefix) return prefix[1];
    const parsed = new Date(createdOn);
    if (!Number.isNaN(parsed.getTime())) {
      return toLocalYmd(parsed);
    }
    return null;
  }

  if (createdOn instanceof Date && !Number.isNaN(createdOn.getTime())) {
    return toLocalYmd(createdOn);
  }

  return null;
}

export function isSameLocalDay(createdOn: unknown, selectedDate: Date): boolean {
  const entryYmd = entryCreatedOnToLocalYmd(createdOn);
  if (!entryYmd) return true; // keep undated entries visible
  return entryYmd === toLocalYmd(selectedDate);
}
