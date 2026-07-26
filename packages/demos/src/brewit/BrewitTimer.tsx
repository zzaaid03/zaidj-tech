import { useEffect, useRef, useState } from 'react';
import type { GeneratedRecipe } from './logic';

interface BrewitTimerProps {
  recipe: GeneratedRecipe;
  onHide: () => void;
}

interface StepInfo {
  label: string;
  detail: string;
  startSeconds: number;
  cumulativeGrams: number;
}

function parseTimeToSeconds(time: string): number {
  const [minutes, seconds] = time.split(':').map((part) => Number(part));
  return minutes * 60 + seconds;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const DRAWDOWN_GRACE_SECONDS = 30;

export default function BrewitTimer({ recipe, onHide }: BrewitTimerProps) {
  const steps: StepInfo[] = recipe.pours.reduce<StepInfo[]>((acc, step) => {
    const previousTotal = acc.length > 0 ? acc[acc.length - 1].cumulativeGrams : 0;
    acc.push({
      label: step.label,
      detail: step.detail,
      startSeconds: parseTimeToSeconds(step.time),
      cumulativeGrams: previousTotal + step.waterGrams,
    });
    return acc;
  }, []);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const startTimestampRef = useRef<number | null>(null);
  const pausedOffsetRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastBeepedStepRef = useRef(-1);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const ensureAudioContext = (): AudioContext | null => {
    if (isMuted) return null;
    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return null;
        audioContextRef.current = new AudioContextClass();
      }
      return audioContextRef.current;
    } catch {
      return null;
    }
  };

  const playBeep = () => {
    if (isMuted) return;
    const context = ensureAudioContext();
    if (!context) return;
    try {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 1000;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.9, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.45);
    } catch {
      // audio is a nice to have, never let it break the timer
    }
  };

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (
          navigator as Navigator & {
            wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinel> };
          }
        ).wakeLock.request('screen');
      }
    } catch {
      // best effort only
    }
  };

  const releaseWakeLock = () => {
    try {
      wakeLockRef.current?.release();
    } catch {
      // best effort only
    }
    wakeLockRef.current = null;
  };

  const start = () => {
    startTimestampRef.current = Date.now();
    setIsRunning(true);
    setHasStarted(true);
    const context = ensureAudioContext();
    if (context && context.state === 'suspended') {
      void context.resume();
    }
    void requestWakeLock();
  };

  const pause = () => {
    if (startTimestampRef.current !== null) {
      pausedOffsetRef.current += Date.now() - startTimestampRef.current;
      startTimestampRef.current = null;
    }
    setIsRunning(false);
    releaseWakeLock();
  };

  const reset = () => {
    startTimestampRef.current = null;
    pausedOffsetRef.current = 0;
    lastBeepedStepRef.current = -1;
    setElapsedSeconds(0);
    setIsRunning(false);
    setHasStarted(false);
    releaseWakeLock();
  };

  const handleHide = () => {
    releaseWakeLock();
    onHide();
  };

  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      if (startTimestampRef.current === null) return;
      const totalMs = pausedOffsetRef.current + (Date.now() - startTimestampRef.current);
      setElapsedSeconds(Math.floor(totalMs / 1000));
    };

    intervalRef.current = window.setInterval(tick, 250);
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    let currentStepIndex = -1;
    for (let i = 0; i < steps.length; i += 1) {
      if (steps[i].startSeconds <= elapsedSeconds) currentStepIndex = i;
    }
    if (currentStepIndex > lastBeepedStepRef.current && currentStepIndex >= 0) {
      lastBeepedStepRef.current = currentStepIndex;
      playBeep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSeconds, isRunning]);

  useEffect(() => {
    return () => {
      releaseWakeLock();
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  let currentStepIndex = -1;
  for (let i = 0; i < steps.length; i += 1) {
    if (steps[i].startSeconds <= elapsedSeconds) currentStepIndex = i;
  }

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const nextStep =
    currentStepIndex >= 0 && currentStepIndex + 1 < steps.length ? steps[currentStepIndex + 1] : null;
  const lastStep = steps[steps.length - 1];
  const isDrawdown = lastStep !== undefined && elapsedSeconds > lastStep.startSeconds + DRAWDOWN_GRACE_SECONDS;

  const secondsUntilNext = nextStep ? nextStep.startSeconds - elapsedSeconds : null;

  return (
    <section
      aria-label="Live brew"
      className="rounded-md border border-border-paper bg-ink/[0.03] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-lg font-semibold">Live brew</h2>
        <button
          type="button"
          onClick={() => setIsMuted((muted) => !muted)}
          className="rounded-sm border border-border-paper bg-paper px-3 py-1 font-mono text-xs uppercase tracking-wide text-ink outline-none transition-colors hover:bg-border-paper/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <p className="mt-3 text-center font-mono text-6xl font-semibold tabular-nums text-ink">
        {formatElapsed(elapsedSeconds)}
      </p>

      <div aria-live="polite" className="mt-3 text-center">
        {!hasStarted ? (
          <>
            <p className="font-mono text-sm font-semibold uppercase tracking-wide text-accent">Ready</p>
            <p className="mt-1 font-mono text-xs text-ink/70">Press Start when your kettle is ready.</p>
          </>
        ) : isDrawdown ? (
          <>
            <p className="font-mono text-sm font-semibold uppercase tracking-wide text-accent">Drawdown</p>
            <p className="mt-1 font-mono text-sm font-semibold text-ink">
              Target time: {recipe.targetDrawdown}
            </p>
          </>
        ) : currentStep ? (
          <>
            <p className="font-mono text-sm font-semibold uppercase tracking-wide text-accent">
              {currentStep.label}
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-ink">
              Pour to {currentStep.cumulativeGrams} g
            </p>
            <p className="mt-1 font-mono text-xs text-ink/70">{currentStep.detail}</p>
          </>
        ) : null}
      </div>

      {hasStarted && !isDrawdown && nextStep && secondsUntilNext !== null ? (
        <p className="mt-2 text-center font-mono text-xs text-ink/70">
          {nextStep.label} in {formatElapsed(Math.max(secondsUntilNext, 0))}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {isRunning ? (
          <button
            type="button"
            onClick={pause}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-ink outline-none transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-ink outline-none transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {elapsedSeconds > 0 ? 'Resume' : 'Start'}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded-sm border border-border-paper bg-paper px-4 py-2 font-sans text-sm font-medium text-ink outline-none transition-colors hover:bg-border-paper/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleHide}
          className="rounded-sm border border-border-paper bg-paper px-4 py-2 font-sans text-sm font-medium text-ink outline-none transition-colors hover:bg-border-paper/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Hide
        </button>
      </div>
    </section>
  );
}
