import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Feature flag client (features.ts)', () => {
  beforeEach(() => {
    vi.stubEnv('DEV', false);
  });
  it('exports getStringValue function', async () => {
    const { getStringValue } = await import('../../src/lib/features');
    expect(typeof getStringValue).toBe('function');
  });

  it('exports getBooleanValue function', async () => {
    const { getBooleanValue } = await import('../../src/lib/features');
    expect(typeof getBooleanValue).toBe('function');
  });

  it('exports getNumberValue function', async () => {
    const { getNumberValue } = await import('../../src/lib/features');
    expect(typeof getNumberValue).toBe('function');
  });

  it('exports getObjectValue function', async () => {
    const { getObjectValue } = await import('../../src/lib/features');
    expect(typeof getObjectValue).toBe('function');
  });

  it('exports getFlag shorthand', async () => {
    const { getFlag } = await import('../../src/lib/features');
    expect(typeof getFlag).toBe('function');
  });

  it('exports isOn shorthand', async () => {
    const { isOn } = await import('../../src/lib/features');
    expect(typeof isOn).toBe('function');
  });

  it('exports isOff shorthand', async () => {
    const { isOff } = await import('../../src/lib/features');
    expect(typeof isOff).toBe('function');
  });

  it('getStringValue returns default for unknown flag', async () => {
    const { getStringValue } = await import('../../src/lib/features');
    const result = getStringValue('nonexistent-flag', 'default-value');
    expect(result).toBe('default-value');
  });

  it('getFlag is an alias for getStringValue', async () => {
    const { getFlag } = await import('../../src/lib/features');
    const result = getFlag('nonexistent-flag', 'fallback');
    expect(result).toBe('fallback');
  });

  it('getBooleanValue returns false for unknown flag', async () => {
    const { getBooleanValue } = await import('../../src/lib/features');
    const result = getBooleanValue('nonexistent-feature');
    expect(result).toBe(false);
  });

  it('isOn returns false for unknown flag', async () => {
    const { isOn } = await import('../../src/lib/features');
    const result = isOn('nonexistent-feature');
    expect(result).toBe(false);
  });

  it('isOff returns true for unknown flag', async () => {
    const { isOff } = await import('../../src/lib/features');
    const result = isOff('nonexistent-feature');
    expect(result).toBe(true);
  });

  it('getNumberValue returns default for unknown flag', async () => {
    const { getNumberValue } = await import('../../src/lib/features');
    const result = getNumberValue('nonexistent-number', 42);
    expect(result).toBe(42);
  });

  it('getObjectValue returns default for unknown flag', async () => {
    const { getObjectValue } = await import('../../src/lib/features');
    const result = getObjectValue('nonexistent-object', { key: 'val' });
    expect(result).toEqual({ key: 'val' });
  });
});
