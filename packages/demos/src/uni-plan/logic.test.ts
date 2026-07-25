import { describe, expect, it } from 'vitest';
import { calculateGPA, detectConflicts, type Course } from './logic';

function course(overrides: Partial<Course> & Pick<Course, 'id' | 'name'>): Course {
  return {
    credits: 3,
    day: 'Mon',
    start: 9,
    end: 10,
    ...overrides,
  };
}

describe('detectConflicts', () => {
  it('flags two courses with overlapping times on the same day', () => {
    const a = course({ id: 'a', name: 'Data Structures', start: 9, end: 10.5 });
    const b = course({ id: 'b', name: 'Calculus II', start: 10, end: 11.5 });

    const conflicts = detectConflicts([a, b]);

    expect(conflicts).toEqual([
      { aId: 'a', bId: 'b', message: 'Data Structures conflicts with Calculus II' },
    ]);
  });

  it('does not flag back-to-back slots that touch but do not overlap', () => {
    const a = course({ id: 'a', name: 'Data Structures', start: 9, end: 10 });
    const b = course({ id: 'b', name: 'Calculus II', start: 10, end: 11 });

    expect(detectConflicts([a, b])).toEqual([]);
  });

  it('does not flag overlapping times on different days', () => {
    const a = course({ id: 'a', name: 'Data Structures', day: 'Mon', start: 9, end: 10 });
    const b = course({ id: 'b', name: 'Calculus II', day: 'Tue', start: 9, end: 10 });

    expect(detectConflicts([a, b])).toEqual([]);
  });

  it('flags the same course entered twice as a conflict with itself', () => {
    const a = course({ id: 'a', name: 'Data Structures', start: 9, end: 10 });
    const b = course({ id: 'b', name: 'Data Structures', start: 9, end: 10 });

    expect(detectConflicts([a, b])).toEqual([
      { aId: 'a', bId: 'b', message: 'Data Structures conflicts with Data Structures' },
    ]);
  });

  it('returns no conflicts for an empty schedule', () => {
    expect(detectConflicts([])).toEqual([]);
  });

  it('returns no conflicts for a single course', () => {
    const a = course({ id: 'a', name: 'Data Structures' });
    expect(detectConflicts([a])).toEqual([]);
  });

  it('finds every pairwise conflict across more than two courses', () => {
    const a = course({ id: 'a', name: 'A', day: 'Wed', start: 13, end: 14.5 });
    const b = course({ id: 'b', name: 'B', day: 'Wed', start: 14, end: 15.5 });
    const c = course({ id: 'c', name: 'C', day: 'Wed', start: 14.25, end: 14.75 });

    const conflicts = detectConflicts([a, b, c]);

    expect(conflicts).toHaveLength(3);
    expect(conflicts.map((c) => `${c.aId}-${c.bId}`).sort()).toEqual(['a-b', 'a-c', 'b-c']);
  });
});

describe('calculateGPA', () => {
  it('returns 0 for an empty schedule', () => {
    expect(calculateGPA([])).toBe(0);
  });

  it('returns 0 when no course has a grade yet', () => {
    const a = course({ id: 'a', name: 'A', credits: 4, grade: undefined });
    expect(calculateGPA([a])).toBe(0);
  });

  it('ignores in-progress courses (no grade) but includes graded ones', () => {
    const graded = course({ id: 'a', name: 'A', credits: 4, grade: 4.0 });
    const inProgress = course({ id: 'b', name: 'B', credits: 3, grade: undefined });

    expect(calculateGPA([graded, inProgress])).toBe(4.0);
  });

  it('computes a credit-weighted average across multiple graded courses', () => {
    const a = course({ id: 'a', name: 'A', credits: 4, grade: 4.0 });
    const b = course({ id: 'b', name: 'B', credits: 3, grade: 3.0 });
    // (4*4 + 3*3) / 7 = 25/7 = 3.5714... -> rounds to 3.57
    expect(calculateGPA([a, b])).toBe(3.57);
  });

  it('handles a grade of 0 as a real boundary value, not "ungraded"', () => {
    const a = course({ id: 'a', name: 'A', credits: 3, grade: 0 });
    expect(calculateGPA([a])).toBe(0);

    const b = course({ id: 'b', name: 'B', credits: 3, grade: 4.0 });
    expect(calculateGPA([a, b])).toBe(2.0);
  });

  it('handles a perfect 4.0 across every graded course', () => {
    const a = course({ id: 'a', name: 'A', credits: 3, grade: 4.0 });
    const b = course({ id: 'b', name: 'B', credits: 4, grade: 4.0 });
    expect(calculateGPA([a, b])).toBe(4.0);
  });
});
