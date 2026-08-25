/**
 * Helper to extract season numbers or season ranges from media titles.
 * e.g. "Daredevil (Season 1)" -> [1]
 * e.g. "Legion (Seasons 1–3)" -> [1, 2, 3]
 * e.g. "Iron Man" -> []
 */
export function extractSeasonRange(title?: string | null): number[] {
  if (!title) return [];
  
  const singleMatch = title.match(/Seasons*(d+)/i);
  if (singleMatch && singleMatch[1]) {
    return [parseInt(singleMatch[1], 10)];
  }

  const rangeMatch = title.match(/Seasons?s*(d+)[–-](d+)/i);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    const res: number[] = [];
    for (let i = start; i <= end; i++) {
      res.push(i);
    }
    return res;
  }

  return [];
}

export function extractSeasonNumber(title?: string | null): number | null {
  const range = extractSeasonRange(title);
  return range.length > 0 ? range[0] : null;
}
