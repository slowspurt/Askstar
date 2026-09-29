import type { ZodiacSign } from '../components/ZodiacIcon';

export interface SharedProfile {
  name: string;
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign;
}

const SIGNS: ZodiacSign[] = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// URL fragments stay in the browser. Never serialize the original birth form:
// it also contains birth date, time, location and gender.
export function createShareUrl(profile: SharedProfile, origin = window.location.origin, now = Date.now()): string {
  const payload = {
    v: 1,
    n: profile.name.trim().slice(0, 100),
    s: [profile.sunSign, profile.moonSign, profile.risingSign].map(sign => SIGNS.indexOf(sign)),
    t: now
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const token = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${origin}/share#${token}`;
}

export function readShareUrl(hash: string, now = Date.now()): { userData: SharedProfile } | null {
  const token = hash.replace(/^#/, '');
  if (!token || token.length > 1024 || !/^[\w-]+$/.test(token)) return null;
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), char => char.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!payload || payload.v !== 1
      || typeof payload.n !== 'string' || !payload.n.trim() || payload.n.length > 100
      || !Array.isArray(payload.s) || payload.s.length !== 3
      || !payload.s.every((sign: unknown) => typeof sign === 'number' && Number.isInteger(sign) && sign >= 0 && sign < SIGNS.length)
      || !Number.isSafeInteger(payload.t) || payload.t < 0
      || payload.t > now + 5 * 60 * 1000 || now >= payload.t + EXPIRATION_TIME) {
      return null;
    }
    return {
      userData: {
        name: payload.n,
        sunSign: SIGNS[payload.s[0]],
        moonSign: SIGNS[payload.s[1]],
        risingSign: SIGNS[payload.s[2]]
      }
    };
  } catch {
    return null;
  }
}
