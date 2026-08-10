import { useId, useMemo, useState } from 'react';
import {
  adjustForIssue,
  generateRecipe,
  type BrewInput,
  type BrewMethod,
  type CupIssue,
  type Experience,
  type ProcessType,
  type RoastLevel,
  type TasteGoal,
} from './logic';
import { downloadBeanConquerorExport } from './export';
import BrewitTimer from './BrewitTimer';
import origins from './origins.json';

const METHODS: BrewMethod[] = ['V60', 'Kalita Wave', 'Chemex', 'AeroPress', 'French Press'];
const ROASTS: RoastLevel[] = ['light', 'medium', 'dark'];
const PROCESSES: ProcessType[] = ['washed', 'natural', 'honey', 'anaerobic', 'other'];
const TASTE_GOALS: TasteGoal[] = ['balanced', 'bright', 'sweet', 'bold'];
const EXPERIENCES: Experience[] = ['beginner', 'amateur', 'expert'];
const CUP_ISSUES: CupIssue[] = ['sour', 'bitter', 'weak', 'dry'];

export default function BrewitDemo() {
  const formId = useId();

  const [method, setMethod] = useState<BrewMethod>('V60');
  const [roastLevel, setRoastLevel] = useState<RoastLevel>('medium');
  const [process, setProcess] = useState<ProcessType>('washed');
  const [tasteGoal, setTasteGoal] = useState<TasteGoal>('balanced');
  const [experience, setExperience] = useState<Experience>('amateur');
  const [origin, setOrigin] = useState('');
  const [showTimer, setShowTimer] = useState(false);

  const [dialIn, setDialIn] = useState<Pick<BrewInput, 'grindOffset' | 'ratio' | 'waterTempC'>>({});
  const [dialInLog, setDialInLog] = useState<string[]>([]);
  const [dialInMessage, setDialInMessage] = useState('');

  const input: BrewInput = useMemo(
    () => ({ method, roastLevel, process, tasteGoal, experience, origin, ...dialIn }),
    [method, roastLevel, process, tasteGoal, experience, origin, dialIn],
  );

  const recipe = useMemo(() => generateRecipe(input), [input]);

  const matchedOrigin = useMemo(() => {
    const typed = origin.trim().toLowerCase();
    if (!typed) return undefined;
    return origins.find((candidate) => candidate.name.toLowerCase() === typed);
  }, [origin]);

  function resetDialIn() {
    setDialIn({});
    setDialInLog([]);
    setDialInMessage('');
  }

  function withBaseSettingReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      resetDialIn();
      setter(value);
    };
  }

  function handleDialIn(issue: CupIssue) {
    const result = adjustForIssue(input, issue);

    if (!result.changed) {
      setDialInMessage(result.description);
      return;
    }

    setDialInMessage('');
    setDialInLog((log) => [...log, result.description]);
    setDialIn((current) => ({
      ...current,
      grindOffset: result.input.grindOffset,
      ratio: result.input.ratio,
      waterTempC: result.input.waterTempC,
    }));
  }

  function handleDownload() {
    downloadBeanConquerorExport(recipe, input);
  }

  return (
    <div className="grid grid-cols-1 gap-gutter rounded-lg border border-border-paper bg-paper p-card text-ink md:grid-cols-[2fr_3fr]">
      <div className="flex flex-col gap-gutter">
        <section aria-labelledby={`${formId}-settings-heading`}>
          <h2 id={`${formId}-settings-heading`} className="font-sans text-xl font-semibold">
            Brew settings
          </h2>
          <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-1">
              <label htmlFor={`${formId}-method`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                Method
              </label>
              <select
                id={`${formId}-method`}
                value={method}
                onChange={(e) => withBaseSettingReset(setMethod)(e.target.value as BrewMethod)}
                className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${formId}-roast`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                Roast level
              </label>
              <select
                id={`${formId}-roast`}
                value={roastLevel}
                onChange={(e) => withBaseSettingReset(setRoastLevel)(e.target.value as RoastLevel)}
                className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {ROASTS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${formId}-process`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                Process
              </label>
              <select
                id={`${formId}-process`}
                value={process}
                onChange={(e) => withBaseSettingReset(setProcess)(e.target.value as ProcessType)}
                className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {PROCESSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${formId}-taste`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                Taste goal
              </label>
              <select
                id={`${formId}-taste`}
                value={tasteGoal}
                onChange={(e) => withBaseSettingReset(setTasteGoal)(e.target.value as TasteGoal)}
                className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {TASTE_GOALS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${formId}-experience`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                Experience
              </label>
              <select
                id={`${formId}-experience`}
                value={experience}
                onChange={(e) => withBaseSettingReset(setExperience)(e.target.value as Experience)}
                className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {EXPERIENCES.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`${formId}-origin`} className="font-mono text-xs uppercase tracking-wide text-ink/70">
                Origin (optional)
              </label>
              <input
                id={`${formId}-origin`}
                type="text"
                list={`${formId}-origin-suggestions`}
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Ethiopia Yirgacheffe"
                className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              <datalist id={`${formId}-origin-suggestions`}>
                {origins.map((candidate) => (
                  <option key={candidate.name} value={candidate.name} />
                ))}
              </datalist>
              {matchedOrigin && <p className="font-mono text-xs text-ink/70">{matchedOrigin.description}</p>}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2 font-sans text-sm font-medium text-ink outline-none transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Download recipe
              </button>
            </div>
          </form>
        </section>

        <p className="font-mono text-xs text-ink/70">
          Honest note: this is the real engine from Brewit running in your browser. Origin is
          recorded as a note and deliberately changes no numbers. The export file does not import
          cleanly into Bean Conqueror yet, and that one is still on the list.
        </p>
      </div>

      <div className="flex flex-col gap-gutter">
        <section className="rounded-md border border-border-paper bg-ink/[0.03] p-4">
          <h2 className="font-sans text-lg font-semibold">{recipe.title}</h2>
          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-ink/70">Ratio</dt>
              <dd className="font-mono text-sm">1:{recipe.ratio.toFixed(1)}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-ink/70">Temperature</dt>
              <dd className="font-mono text-sm">{recipe.waterTempC} °C</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-ink/70">Grind</dt>
              <dd className="font-mono text-sm">{recipe.grind}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-ink/70">Total water</dt>
              <dd className="font-mono text-sm">{recipe.totalWaterGrams} g</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wide text-ink/70">Target drawdown</dt>
              <dd className="font-mono text-sm">{recipe.targetDrawdown}</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby={`${formId}-pours-heading`} className="rounded-md border border-border-paper bg-ink/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id={`${formId}-pours-heading`} className="font-sans text-lg font-semibold">
              Pour schedule
            </h2>
            {!showTimer ? (
              <button
                type="button"
                onClick={() => setShowTimer(true)}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-3 py-1.5 font-sans text-sm font-medium text-ink outline-none transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Start brew
              </button>
            ) : null}
          </div>
          <ol className="mt-2 flex flex-col gap-2">
            {recipe.pours.map((step) => (
              <li
                key={`${step.label}-${step.time}`}
                className="rounded-sm border border-border-paper bg-paper px-3 py-2"
              >
                <p className="font-mono text-sm font-semibold">
                  {step.label} - {step.time}
                  {(step.kind === undefined || step.kind === 'pour') && ` - ${step.waterGrams} g`}
                </p>
                <p className="mt-1 font-mono text-xs text-ink/70">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        {showTimer ? <BrewitTimer recipe={recipe} onHide={() => setShowTimer(false)} /> : null}

        <section aria-labelledby={`${formId}-notes-heading`} className="rounded-md border border-border-paper bg-ink/[0.03] p-4">
          <h2 id={`${formId}-notes-heading`} className="font-sans text-lg font-semibold">
            Notes
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {recipe.notes.map((note, i) => (
              <li key={i} className="font-mono text-xs text-ink/70">
                {note}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${formId}-troubleshooting-heading`} className="rounded-md border border-border-paper bg-ink/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id={`${formId}-troubleshooting-heading`} className="font-sans text-lg font-semibold">
              Troubleshooting
            </h2>
            {dialInLog.length > 0 ? (
              <button
                type="button"
                onClick={resetDialIn}
                className="font-mono text-xs uppercase tracking-wide text-ink/70 underline underline-offset-2 hover:text-ink"
              >
                Start over
              </button>
            ) : null}
          </div>
          <dl className="mt-2 flex flex-col gap-2">
            {CUP_ISSUES.map((issue) => (
              <div key={issue} className="flex items-center justify-between gap-3">
                <div>
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink/70">{issue}</dt>
                  <dd className="font-mono text-xs text-ink">{recipe.troubleshooting[issue]}</dd>
                </div>
                <button
                  type="button"
                  onClick={() => handleDialIn(issue)}
                  className="shrink-0 rounded-sm border border-border-paper px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-ink outline-none transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Got this
                </button>
              </div>
            ))}
          </dl>

          {dialInMessage ? (
            <p className="mt-3 font-mono text-xs text-ink/70">{dialInMessage}</p>
          ) : null}

          {dialInLog.length > 0 ? (
            <div className="mt-3 border-t border-border-paper pt-3">
              <p className="font-mono text-xs uppercase tracking-wide text-ink/70">Dial-in applied</p>
              <ul className="mt-2 flex flex-col gap-1">
                {dialInLog.map((entry, i) => (
                  <li key={i} className="font-mono text-xs text-ink">
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
