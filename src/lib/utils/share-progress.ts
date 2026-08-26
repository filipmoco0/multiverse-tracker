import { FranchiseMedia, Universe } from '../types';

export interface SharedProgressData {
  userName: string;
  sharedWatchedIds: Record<string, boolean>;
  watchedCount: number;
  totalCount: number;
  percentage: number;
}

/**
 * Compresses watched IDs and username into a URL-safe compact string.
 * 0 database changes required!
 */
export function encodeSharedProgress(
  mediaList: FranchiseMedia[],
  watchedIds: Record<string, boolean>,
  userName: string = 'Agent'
): string {
  const watchedIndices = mediaList
    .map((item, idx) => (watchedIds[item.id] ? idx : -1))
    .filter((idx) => idx !== -1);

  const payload = {
    u: userName,
    w: watchedIndices,
  };

  try {
    const json = JSON.stringify(payload);
    if (typeof window !== 'undefined') {
      return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
    return Buffer.from(json).toString('base64url');
  } catch {
    return '';
  }
}

/**
 * Decodes shared progress string from URL parameter.
 */
export function decodeSharedProgress(
  encoded: string,
  mediaList: FranchiseMedia[]
): SharedProgressData | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';

    const json =
      typeof window !== 'undefined'
        ? decodeURIComponent(escape(atob(base64)))
        : Buffer.from(base64, 'base64').toString('utf8');

    const payload = JSON.parse(json);
    if (!payload || !Array.isArray(payload.w)) return null;

    const sharedWatchedIds: Record<string, boolean> = {};
    payload.w.forEach((idx: number) => {
      const item = mediaList[idx];
      if (item) {
        sharedWatchedIds[item.id] = true;
      }
    });

    const watchedCount = Object.keys(sharedWatchedIds).length;
    const totalCount = mediaList.length;
    const percentage = totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

    return {
      userName: payload.u || 'Multiverse Agent',
      sharedWatchedIds,
      watchedCount,
      totalCount,
      percentage,
    };
  } catch (err) {
    console.error('Failed to decode shared progress:', err);
    return null;
  }
}
