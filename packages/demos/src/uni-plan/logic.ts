/**
 * Ported from zzaaid03/Uni-Plan (github.com/zzaaid03/Uni-Plan):
 *   - backend/src/types.ts    -> Course
 *   - backend/src/gpa.ts      -> calculateGPA
 *   - backend/src/schedule.ts -> detectConflicts
 *
 * Both functions are pure and backend-free in the source repo (no database, no
 * Express-specific state). This is a straight copy of the algorithms. The one
 * change: detectConflicts returns structured Conflict objects (course ids +
 * message) instead of plain strings, so the UI can highlight which two courses
 * clash. The comparison itself (same-day, half-open interval overlap via
 * `Math.max(a.start, b.start) < Math.min(a.end, b.end)`) is unchanged.
 * Course also gains an `id` field, needed for React list keys/highlighting;
 * the original type had no id since it was never rendered as a list.
 */

export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type Course = {
  id: string;
  name: string;
  credits: number;
  grade?: number;
  day: Day;
  start: number;
  end: number;
};

export type Conflict = {
  aId: string;
  bId: string;
  message: string;
};

export function calculateGPA(courses: Course[]): number {
  let totalPoints = 0;
  let totalCredits = 0;

  courses.forEach((course) => {
    if (course.grade !== undefined) {
      totalPoints += course.grade * course.credits;
      totalCredits += course.credits;
    }
  });

  return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
}

export function detectConflicts(courses: Course[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const a = courses[i];
      const b = courses[j];

      if (a.day === b.day && Math.max(a.start, b.start) < Math.min(a.end, b.end)) {
        conflicts.push({
          aId: a.id,
          bId: b.id,
          message: `${a.name} conflicts with ${b.name}`,
        });
      }
    }
  }

  return conflicts;
}
