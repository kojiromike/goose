/**
 * Each launch of the app tints its backgrounds a pale color derived from the
 * launch time, so two instances running side by side can be told apart at a
 * glance. Every window of one launch shares the tint.
 */

const TINTED_TOKENS = [
  '--color-background-primary',
  '--color-background-secondary',
  '--color-background-tertiary',
] as const;

// Enough of a fully saturated hue to tell launches apart while white still
// reads as white.
const TINT_WEIGHT = 0.08;

export function launchedAt(): number | null {
  const value = window.appConfig?.get('GOOSE_LAUNCHED_AT');
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** FNV-1a over the timestamp's digits, so close launch times land on unrelated hues. */
export function launchHue(timestamp: number): number {
  let hash = 0x811c9dc5;
  for (const char of String(timestamp)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash % 360;
}

function hueToRgb(hue: number): [number, number, number] {
  const sector = hue / 60;
  const x = 1 - Math.abs((sector % 2) - 1);
  const [r, g, b] =
    sector < 1
      ? [1, x, 0]
      : sector < 2
        ? [x, 1, 0]
        : sector < 3
          ? [0, 1, x]
          : sector < 4
            ? [0, x, 1]
            : sector < 5
              ? [x, 0, 1]
              : [1, 0, x];
  return [r * 255, g * 255, b * 255];
}

/** Mix `weight` of the hue into a `#rrggbb` color; anything else is returned unchanged. */
export function tintColor(color: string, hue: number, weight = TINT_WEIGHT): string {
  const match = /^#([0-9a-f]{6})$/i.exec(color);
  if (!match) return color;
  const base = [0, 2, 4].map((offset) => parseInt(match[1].slice(offset, offset + 2), 16));
  const tint = hueToRgb(hue);
  return `#${base
    .map((channel, index) =>
      Math.round(channel * (1 - weight) + tint[index] * weight)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

/** The background tokens to override for this launch, or none outside the app. */
export function instanceTintOverrides(
  tokens: Readonly<Record<string, string>>,
  timestamp: number | null
): Record<string, string> {
  if (timestamp === null) return {};
  const hue = launchHue(timestamp);
  return Object.fromEntries(
    TINTED_TOKENS.filter((key) => key in tokens).map((key) => [key, tintColor(tokens[key], hue)])
  );
}
