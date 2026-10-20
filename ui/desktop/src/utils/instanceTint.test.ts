import { describe, expect, it } from 'vitest';
import { instanceTintOverrides, launchHue, tintColor } from './instanceTint';

describe('launchHue', () => {
  it('is stable for one launch time', () => {
    expect(launchHue(1_760_968_000_000)).toBe(launchHue(1_760_968_000_000));
  });

  it('spreads launches a second apart across the color wheel', () => {
    const hues = Array.from({ length: 12 }, (_, i) => launchHue(1_760_968_000_000 + i * 1000));
    expect(new Set(hues).size).toBeGreaterThan(8);
    hues.forEach((hue) => {
      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
    });
  });
});

describe('tintColor', () => {
  it('keeps white pale', () => {
    expect(tintColor('#ffffff', 0)).toBe('#ffebeb');
    expect(tintColor('#ffffff', 240)).toBe('#ebebff');
  });

  it('tints dark backgrounds too', () => {
    expect(tintColor('#22252a', 120)).not.toBe('#22252a');
  });

  it('leaves non-hex values alone', () => {
    expect(tintColor('transparent', 0)).toBe('transparent');
  });
});

describe('instanceTintOverrides', () => {
  const tokens = {
    '--color-background-primary': '#ffffff',
    '--color-background-secondary': '#f4f6f7',
    '--color-background-tertiary': '#e3e6ea',
    '--color-background-inverse': '#000000',
    '--color-text-primary': '#3f434b',
  };

  it('tints only the surface backgrounds', () => {
    const overrides = instanceTintOverrides(tokens, 1_760_968_000_000);
    expect(Object.keys(overrides).sort()).toEqual([
      '--color-background-primary',
      '--color-background-secondary',
      '--color-background-tertiary',
    ]);
    expect(overrides['--color-background-primary']).not.toBe('#ffffff');
  });

  it('changes nothing without a launch time', () => {
    expect(instanceTintOverrides(tokens, null)).toEqual({});
  });
});
