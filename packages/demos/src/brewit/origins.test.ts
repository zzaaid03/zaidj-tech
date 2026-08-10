import { describe, expect, it } from 'vitest';
import origins from './origins.json';

describe('origins snapshot', () => {
  it('has 40 entries', () => {
    expect(origins).toHaveLength(40);
  });

  it('every entry has a non-empty name and description', () => {
    for (const origin of origins) {
      expect(typeof origin.name).toBe('string');
      expect(origin.name.length).toBeGreaterThan(0);
      expect(typeof origin.description).toBe('string');
      expect(origin.description.length).toBeGreaterThan(0);
    }
  });
});
