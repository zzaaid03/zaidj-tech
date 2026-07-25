import { useId, useMemo, useRef, useState } from 'react';
import { calculateGPA, detectConflicts, type Course, type Day } from './logic';

type DemoCourse = Course & { enabled: boolean };

const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const GRADE_OPTIONS = [
  { value: '', label: 'In progress (no grade yet)' },
  { value: '4.0', label: '4.0: A' },
  { value: '3.7', label: '3.7: A-' },
  { value: '3.3', label: '3.3: B+' },
  { value: '3.0', label: '3.0: B' },
  { value: '2.7', label: '2.7: B-' },
  { value: '2.3', label: '2.3: C+' },
  { value: '2.0', label: '2.0: C' },
  { value: '1.7', label: '1.7: C-' },
  { value: '1.0', label: '1.0: D' },
  { value: '0.0', label: '0.0: F' },
];

const SAMPLE_COURSES: DemoCourse[] = [
  { id: 'c1', name: 'Data Structures', credits: 4, day: 'Mon', start: 9, end: 10.5, grade: 3.7, enabled: true },
  { id: 'c2', name: 'Calculus II', credits: 3, day: 'Mon', start: 10, end: 11.5, grade: 3.3, enabled: true },
  { id: 'c3', name: 'Technical Writing', credits: 2, day: 'Fri', start: 9, end: 10, grade: 4.0, enabled: true },
  { id: 'c4', name: 'Physics I', credits: 4, day: 'Wed', start: 13, end: 14.5, grade: 3.0, enabled: true },
  { id: 'c5', name: 'Intro to AI', credits: 3, day: 'Wed', start: 14, end: 15.5, grade: undefined, enabled: true },
];

function formatTime(hour: number): string {
  const h24 = Math.floor(hour);
  const minutes = Math.round((hour - h24) * 60);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default function UniPlanDemo() {
  const [courses, setCourses] = useState<DemoCourse[]>(SAMPLE_COURSES);
  const nextId = useRef(SAMPLE_COURSES.length + 1);

  const [name, setName] = useState('');
  const [credits, setCredits] = useState('3');
  const [day, setDay] = useState<Day>('Mon');
  const [start, setStart] = useState('9');
  const [end, setEnd] = useState('10');
  const [grade, setGrade] = useState('');

  const formId = useId();

  const activeCourses = useMemo(() => courses.filter((c) => c.enabled), [courses]);

  const conflicts = useMemo(() => detectConflicts(activeCourses), [activeCourses]);
  const gpa = useMemo(() => calculateGPA(activeCourses), [activeCourses]);

  const conflictedIds = useMemo(() => {
    const ids = new Set<string>();
    conflicts.forEach((c) => {
      ids.add(c.aId);
      ids.add(c.bId);
    });
    return ids;
  }, [conflicts]);

  function addCourse(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const startNum = Number(start);
    const endNum = Number(end);
    if (Number.isNaN(startNum) || Number.isNaN(endNum) || endNum <= startNum) return;

    const id = `custom-${nextId.current++}`;
    setCourses((prev) => [
      ...prev,
      {
        id,
        name: trimmedName,
        credits: Number(credits) || 1,
        day,
        start: startNum,
        end: endNum,
        grade: grade === '' ? undefined : Number(grade),
        enabled: true,
      },
    ]);

    setName('');
    setCredits('3');
    setDay('Mon');
    setStart('9');
    setEnd('10');
    setGrade('');
  }

  function removeCourse(id: string) {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }

  function toggleCourse(id: string) {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  }

  function reset() {
    setCourses(SAMPLE_COURSES);
    nextId.current = SAMPLE_COURSES.length + 1;
  }

  return (
    <div className="grid grid-cols-1 gap-gutter rounded-lg border border-border-paper bg-paper p-card text-ink md:grid-cols-[3fr_2fr]">
      <div className="flex flex-col gap-gutter">
        <section aria-labelledby={`${formId}-schedule-heading`}>
          <h2 id={`${formId}-schedule-heading`} className="font-sans text-xl font-semibold">
            Schedule
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {courses.map((course) => {
              const isConflicted = course.enabled && conflictedIds.has(course.id);
              return (
                <li
                  key={course.id}
                  className={[
                    'flex flex-wrap items-center gap-3 rounded-md border p-4 transition-colors',
                    isConflicted
                      ? 'border-accent bg-accent/10'
                      : 'border-border-paper bg-ink/[0.03]',
                    course.enabled ? '' : 'opacity-50',
                  ].join(' ')}
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={course.enabled}
                      onChange={() => toggleCourse(course.id)}
                      className="h-4 w-4 rounded-sm border-border-paper accent-[--color-accent] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    />
                    <span className="sr-only">Include {course.name} in schedule</span>
                  </label>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans font-medium">{course.name}</p>
                    <p className="font-mono text-xs text-ink/70">
                      {course.day} · {formatTime(course.start)}-{formatTime(course.end)} ·{' '}
                      {course.credits} cr ·{' '}
                      {course.grade !== undefined ? course.grade.toFixed(1) : 'in progress'}
                    </p>
                    {isConflicted && (
                      <p className="mt-1 font-mono text-xs font-semibold text-accent">
                        Conflicts with another course
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCourse(course.id)}
                    aria-label={`Remove ${course.name}`}
                    className="rounded-sm border border-border-paper px-2 py-1 font-mono text-xs uppercase tracking-wide text-ink/70 outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
            {courses.length === 0 && (
              <li className="rounded-md border border-dashed border-border-paper p-4 text-center font-mono text-xs uppercase tracking-widest text-ink/40">
                No courses. Add one below.
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby={`${formId}-add-heading`}>
          <h2 id={`${formId}-add-heading`} className="font-sans text-xl font-semibold">
            Add a course
          </h2>
          <form onSubmit={addCourse} className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor={`${formId}-name`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                  Course name
                </label>
                <input
                  id={`${formId}-name`}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  placeholder="e.g. Organic Chemistry"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`${formId}-credits`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                  Credits
                </label>
                <input
                  id={`${formId}-credits`}
                  type="number"
                  min={1}
                  max={6}
                  step={1}
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`${formId}-day`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                  Day
                </label>
                <select
                  id={`${formId}-day`}
                  value={day}
                  onChange={(e) => setDay(e.target.value as Day)}
                  className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`${formId}-grade`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                  Grade
                </label>
                <select
                  id={`${formId}-grade`}
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`${formId}-start`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                  Start time (24h)
                </label>
                <input
                  id={`${formId}-start`}
                  type="number"
                  min={7}
                  max={21}
                  step={0.5}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`${formId}-end`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                  End time (24h)
                </label>
                <input
                  id={`${formId}-end`}
                  type="number"
                  min={7.5}
                  max={22}
                  step={0.5}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-ink outline-none transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Add course
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-border-paper px-4 py-2 font-sans text-sm font-medium text-ink outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Reset to sample schedule
              </button>
            </div>
          </form>
        </section>
      </div>

      <div className="flex flex-col gap-gutter">
        <section
          aria-labelledby={`${formId}-conflicts-heading`}
          aria-live="polite"
          className="rounded-md border border-border-paper bg-ink/[0.03] p-4"
        >
          <h2 id={`${formId}-conflicts-heading`} className="font-sans text-lg font-semibold">
            Conflicts
          </h2>
          {conflicts.length === 0 ? (
            <p className="mt-2 font-mono text-sm text-ink/70">No conflicts in the active schedule.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {conflicts.map((c, i) => (
                <li
                  key={`${c.aId}-${c.bId}-${i}`}
                  className="rounded-sm border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-sm text-ink"
                >
                  {c.message}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-border-paper bg-ink/[0.03] p-4">
          <h2 className="font-sans text-lg font-semibold">Predicted GPA</h2>
          <p className="mt-2 font-mono text-4xl font-semibold text-accent" aria-live="polite">
            {gpa.toFixed(2)}
          </p>
          <p className="mt-1 font-mono text-xs text-ink/70">
            Weighted across graded, active courses only.
          </p>
        </section>
      </div>
    </div>
  );
}
