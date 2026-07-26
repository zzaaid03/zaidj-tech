import { useId, useMemo, useState } from 'react';
import {
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

const METHODS: BrewMethod[] = ['V60', 'Kalita Wave', 'Chemex'];
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

  const input: BrewInput = useMemo(
    () => ({ method, roastLevel, process, tasteGoal, experience, origin }),
    [method, roastLevel, process, tasteGoal, experience, origin],
  );

  const recipe = useMemo(() => generateRecipe(input), [input]);

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
                onChange={(e) => setMethod(e.target.value as BrewMethod)}
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
                onChange={(e) => setRoastLevel(e.target.value as RoastLevel)}
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
                onChange={(e) => setProcess(e.target.value as ProcessType)}
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
                onChange={(e) => setTasteGoal(e.target.value as TasteGoal)}
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
                onChange={(e) => setExperience(e.target.value as Experience)}
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
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. Ethiopia Yirgacheffe"
                className="rounded-sm border border-border-paper bg-paper px-3 py-2 text-ink outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
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
          <h2 id={`${formId}-pours-heading`} className="font-sans text-lg font-semibold">
            Pour schedule
          </h2>
          <ol className="mt-2 flex flex-col gap-2">
            {recipe.pours.map((step) => (
              <li
                key={`${step.label}-${step.time}`}
                className="rounded-sm border border-border-paper bg-paper px-3 py-2"
              >
                <p className="font-mono text-sm font-semibold">
                  {step.label} - {step.time} - {step.waterGrams} g
                </p>
                <p className="mt-1 font-mono text-xs text-ink/70">{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

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
          <h2 id={`${formId}-troubleshooting-heading`} className="font-sans text-lg font-semibold">
            Troubleshooting
          </h2>
          <dl className="mt-2 flex flex-col gap-2">
            {CUP_ISSUES.map((issue) => (
              <div key={issue}>
                <dt className="font-mono text-xs uppercase tracking-wide text-ink/70">{issue}</dt>
                <dd className="font-mono text-xs text-ink">{recipe.troubleshooting[issue]}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}
