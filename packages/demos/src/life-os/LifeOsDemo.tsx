import { useCallback, useEffect, useState, type KeyboardEvent } from 'react';
import styles from './life-os.module.css';
import ConnectGmailModal from './screens/ConnectGmailModal';
import ScanScreen from './screens/ScanScreen';
import ResultsScreen from './screens/ResultsScreen';

export interface SuggestedTask {
  id: string;
  title: string;
  due: string;
  priority: 'high' | 'medium';
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: 'interview' | 'rejected';
  summary: string;
}

const INITIAL_TASKS: SuggestedTask[] = [
  {
    id: 't1',
    title: 'Reply to Beacon Software to confirm your interview time',
    due: 'Tomorrow',
    priority: 'high',
  },
  {
    id: 't2',
    title: 'Send the signed rental contract back to the landlord',
    due: 'In 3 days',
    priority: 'medium',
  },
];

const INITIAL_JOBS: JobApplication[] = [
  {
    id: 'j1',
    company: 'Beacon Software',
    role: 'Product Manager',
    status: 'interview',
    summary: 'Beacon Software invited you to a first-round interview for the Product Manager role.',
  },
  {
    id: 'j2',
    company: 'Cascade Robotics',
    role: 'Associate Product Manager',
    status: 'rejected',
    summary:
      'Cascade Robotics is not moving forward with your application for the Associate Product Manager role.',
  },
];

const SCREENS = [
  { label: 'Connect Gmail' },
  { label: 'Scan Inbox' },
  { label: 'Scanning' },
  { label: 'Results' },
  { label: 'Task added' },
] as const;

export default function LifeOsDemo() {
  const [screen, setScreen] = useState(0);
  const [tasks, setTasks] = useState<SuggestedTask[]>(INITIAL_TASKS);
  const [jobs, setJobs] = useState<JobApplication[]>(INITIAL_JOBS);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const goTo = useCallback((next: number) => {
    setScreen(Math.max(0, Math.min(SCREENS.length - 1, next)));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(screen - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(screen + 1);
      }
    },
    [screen, goTo],
  );

  useEffect(() => {
    if (screen !== 2) return;
    const timer = setTimeout(() => goTo(3), 1600);
    return () => clearTimeout(timer);
  }, [screen, goTo]);

  const handleAddTask = useCallback(
    (id: string, title: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (id === 't1') {
        setSnackbarMessage(`Added "${title}"`);
        goTo(4);
      }
    },
    [goTo],
  );

  const handleDismissTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleAddJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  const handleDismissJob = useCallback((id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, []);

  return (
    <div className="life-os-root" onKeyDown={handleKeyDown}>
      <div className="flex flex-col items-center gap-4">
        {/* prev / next + direct-select chrome: must stay in @zaidj/ui styling, never Life OS colors */}
        <div className="flex w-full max-w-[412px] items-center justify-between font-mono text-xs text-muted">
          <button
            type="button"
            onClick={() => goTo(screen - 1)}
            disabled={screen === 0}
            aria-label="Previous screen"
            className="rounded-sm border border-border-paper px-3 py-1.5 uppercase tracking-wide text-paper outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border-paper disabled:hover:text-paper"
          >
            &larr; Prev
          </button>
          <span aria-hidden="true">
            {screen + 1} of {SCREENS.length} - {SCREENS[screen].label}
          </span>
          <button
            type="button"
            onClick={() => goTo(screen + 1)}
            disabled={screen === SCREENS.length - 1}
            aria-label="Next screen"
            className="rounded-sm border border-border-paper px-3 py-1.5 uppercase tracking-wide text-paper outline-none transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border-paper disabled:hover:text-paper"
          >
            Next &rarr;
          </button>
        </div>

        <div
          role="group"
          aria-label="Jump to screen"
          className="flex w-full max-w-[412px] flex-wrap justify-center gap-2"
        >
          {SCREENS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-pressed={i === screen}
              onClick={() => goTo(i)}
              className={[
                'rounded-sm border px-2.5 py-1 font-mono text-xs outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                i === screen
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border-paper text-muted hover:border-accent hover:text-accent',
              ].join(' ')}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="sr-only">
          Screen {screen + 1} of {SCREENS.length}: {SCREENS[screen].label}
        </div>

        <div className={styles.phoneScaleOuter}>
          <div className={styles.phone}>
            {screen === 0 && (
              <ConnectGmailModal onNotNow={() => undefined} onConnect={() => goTo(1)} />
            )}
            {screen === 1 && <ScanScreen scanning={false} onScan={() => goTo(2)} />}
            {screen === 2 && <ScanScreen scanning onScan={() => undefined} />}
            {(screen === 3 || screen === 4) && (
              <ResultsScreen
                tasks={tasks}
                jobs={jobs}
                onAddTask={handleAddTask}
                onDismissTask={handleDismissTask}
                onAddJob={handleAddJob}
                onDismissJob={handleDismissJob}
                snackbarMessage={screen === 4 ? snackbarMessage : null}
              />
            )}
          </div>
        </div>

        <p className="max-w-[412px] text-center font-mono text-xs text-muted">
          Interactive recreation of the Life OS inbox scan, rebuilt for the web from the Flutter app. The
          suggestions shown are the app&apos;s own demo-mode fixtures. In the real app the scan runs
          server-side: email bodies never reach the client and are never stored, and only the derived
          tasks and job updates come back.
        </p>
      </div>
    </div>
  );
}
