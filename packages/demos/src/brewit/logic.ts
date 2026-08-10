/**
 * GENERATED FILE - do not edit by hand.
 *
 * Copied from zzaaid03/Brewit, src/lib/brewEngine.ts. The engine is pure and
 * framework-free, so the lab demo runs the same logic the real app runs.
 *
 * To update: change brewEngine.ts in the Brewit repo, then run `pnpm sync:brewit`
 * here and commit the result. CI fails the deploy if this file falls behind.
 */

export type BrewMethod = 'V60' | 'Kalita Wave' | 'Chemex' | 'AeroPress' | 'French Press'
export type RoastLevel = 'light' | 'medium' | 'dark'
export type ProcessType = 'washed' | 'natural' | 'honey' | 'anaerobic' | 'other'
export type TasteGoal = 'balanced' | 'bright' | 'sweet' | 'bold'
export type CupIssue = 'sour' | 'bitter' | 'weak' | 'dry'
export type Experience = 'beginner' | 'amateur' | 'expert'

export interface BrewInput {
  method: BrewMethod
  origin: string
  process: ProcessType
  roastLevel: RoastLevel
  tasteGoal: TasteGoal
  // dose and ratio are optional, derived from experience/profile when omitted
  doseGrams?: number
  ratio?: number
  // waterTempC is optional; when omitted the engine will compute an appropriate temp
  waterTempC?: number
  experience?: Experience
  // grindOffset is optional; positive steps coarser, negative steps finer
  grindOffset?: number
}

export interface PourStep {
  label: string
  time: string
  waterGrams: number
  detail: string
  kind?: 'pour' | 'steep' | 'plunge'
}

export type GrindSetting =
  | 'extra-fine'
  | 'fine'
  | 'medium-fine'
  | 'medium'
  | 'medium-coarse'
  | 'coarse'
  | 'extra-coarse'

export interface GeneratedRecipe {
  title: string
  method: BrewMethod
  totalWaterGrams: number
  ratio: number
  waterTempC: number
  targetDrawdown: string
  grind: GrindSetting
  pours: PourStep[]
  notes: string[]
  troubleshooting: Record<CupIssue, string>
}

const roastTempShift: Record<RoastLevel, number> = {
  light: 1.5,
  medium: 0,
  dark: -1.5,
}

const roastRatioShift: Record<RoastLevel, number> = {
  light: 0.2,
  medium: 0,
  dark: -0.2,
}

const tasteTempShift: Record<TasteGoal, number> = {
  balanced: 0,
  bright: -0.8,
  sweet: 0.6,
  bold: 0.8,
}

const tasteRatioShift: Record<TasteGoal, number> = {
  balanced: 0,
  bright: 0.4,
  sweet: 0.1,
  bold: -0.8,
}

const processTempShift: Record<ProcessType, number> = {
  washed: 0,
  honey: -0.3,
  natural: -0.7,
  anaerobic: -1.2,
  other: 0,
}

const grindScale: GrindSetting[] = [
  'extra-fine',
  'fine',
  'medium-fine',
  'medium',
  'medium-coarse',
  'coarse',
  'extra-coarse',
]

const grindBaseIndexByMethod: Record<BrewMethod, number> = {
  V60: grindScale.indexOf('medium-fine'),
  'Kalita Wave': grindScale.indexOf('medium'),
  Chemex: grindScale.indexOf('medium-coarse'),
  AeroPress: grindScale.indexOf('fine'),
  'French Press': grindScale.indexOf('coarse'),
}

const grindRoastStep: Record<RoastLevel, number> = {
  light: -1,
  medium: 0,
  dark: 1,
}

const grindLimitsByMethod: Record<BrewMethod, { min: number; max: number }> = {
  V60: { min: grindScale.indexOf('fine'), max: grindScale.indexOf('coarse') },
  'Kalita Wave': { min: grindScale.indexOf('fine'), max: grindScale.indexOf('coarse') },
  Chemex: { min: grindScale.indexOf('fine'), max: grindScale.indexOf('coarse') },
  AeroPress: { min: grindScale.indexOf('extra-fine'), max: grindScale.indexOf('medium') },
  'French Press': {
    min: grindScale.indexOf('medium-coarse'),
    max: grindScale.indexOf('extra-coarse'),
  },
}

const targetTimeByMethod: Record<BrewMethod, string> = {
  V60: '2:45 - 3:15',
  'Kalita Wave': '2:50 - 3:30',
  Chemex: '3:45 - 4:30',
  AeroPress: '1:45 - 2:15',
  'French Press': '4:00 - 4:30',
}

const profileDefaults: Record<Experience, { doseGrams: number; ratio: number }> = {
  beginner: { doseGrams: 18, ratio: 16.5 },
  amateur: { doseGrams: 20, ratio: 16 },
  expert: { doseGrams: 20, ratio: 16 },
}

const methodDefaults: Partial<Record<BrewMethod, { doseGrams: number; ratio: number }>> = {
  AeroPress: { doseGrams: 15, ratio: 14 },
}

const maxWaterByMethod: Partial<Record<BrewMethod, number>> = {
  AeroPress: 250,
}

const baseTempByMethod: Record<BrewMethod, number> = {
  V60: 94,
  'Kalita Wave': 94,
  Chemex: 95,
  AeroPress: 85,
  'French Press': 94,
}

const ratioLimitsByMethod: Record<BrewMethod, { min: number; max: number }> = {
  V60: { min: 14, max: 18 },
  'Kalita Wave': { min: 14, max: 18 },
  Chemex: { min: 14, max: 18 },
  AeroPress: { min: 11, max: 16 },
  'French Press': { min: 14, max: 18 },
}

const tempLimitsByMethod: Record<BrewMethod, { min: number; max: number }> = {
  V60: { min: 88, max: 97 },
  'Kalita Wave': { min: 88, max: 97 },
  Chemex: { min: 88, max: 97 },
  AeroPress: { min: 75, max: 95 },
  'French Press': { min: 88, max: 97 },
}

const experienceTempShift: Record<Experience, number> = {
  beginner: 0.8,
  amateur: 0,
  expert: -0.8,
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function roundToTenths(value: number): number {
  return Math.round(value * 10) / 10
}

function effectiveRatio(input: BrewInput): number {
  const experience: Experience = input.experience ?? 'amateur'
  const baseRatio =
    input.ratio ?? methodDefaults[input.method]?.ratio ?? profileDefaults[experience].ratio
  const limits = ratioLimitsByMethod[input.method]
  return roundToTenths(
    clamp(
      baseRatio + roastRatioShift[input.roastLevel] + tasteRatioShift[input.tasteGoal],
      limits.min,
      limits.max,
    ),
  )
}

function effectiveTemp(input: BrewInput): number {
  const experience: Experience = input.experience ?? 'amateur'
  const baseTemp = input.waterTempC ?? baseTempByMethod[input.method]
  const limits = tempLimitsByMethod[input.method]
  return Math.round(
    clamp(
      baseTemp +
        roastTempShift[input.roastLevel] +
        tasteTempShift[input.tasteGoal] +
        experienceTempShift[experience] +
        processTempShift[input.process],
      limits.min,
      limits.max,
    ),
  )
}

function effectiveGrindIndex(input: BrewInput): number {
  const limits = grindLimitsByMethod[input.method]
  return clamp(
    grindBaseIndexByMethod[input.method] + grindRoastStep[input.roastLevel] + (input.grindOffset ?? 0),
    limits.min,
    limits.max,
  )
}

function buildV60Pours(totalWater: number, bloomWater: number): PourStep[] {
  const firstTarget = Math.round(totalWater * 0.6)
  const secondTarget = Math.round(totalWater * 0.85)

  return [
    {
      label: 'Bloom',
      time: '00:00',
      waterGrams: bloomWater,
      detail: 'Wet all grounds and swirl to remove dry pockets.',
    },
    {
      label: 'Pour 1',
      time: '00:45',
      waterGrams: firstTarget - bloomWater,
      detail: 'Spiral pour from center to edge, then back to center.',
    },
    {
      label: 'Pour 2',
      time: '01:25',
      waterGrams: secondTarget - firstTarget,
      detail: 'Keep the water bed steady and avoid pouring onto paper.',
    },
    {
      label: 'Final Pour',
      time: '02:00',
      waterGrams: totalWater - secondTarget,
      detail: 'Finish gently and give one final swirl for a flat bed.',
    },
  ]
}

function buildKalitaPours(totalWater: number, bloomWater: number): PourStep[] {
  const remaining = totalWater - bloomWater
  const pulse = Math.round(remaining / 4)
  const lastPulse = remaining - pulse * 3

  return [
    {
      label: 'Bloom',
      time: '00:00',
      waterGrams: bloomWater,
      detail: 'Saturate grounds and wait for the bloom to settle.',
    },
    {
      label: 'Pulse 1',
      time: '00:45',
      waterGrams: pulse,
      detail: 'Pour in the center to maintain a low, even slurry.',
    },
    {
      label: 'Pulse 2',
      time: '01:20',
      waterGrams: pulse,
      detail: 'Small circles, keep the flow calm and consistent.',
    },
    {
      label: 'Pulse 3',
      time: '01:55',
      waterGrams: pulse,
      detail: 'Maintain the same rhythm to avoid over-agitation.',
    },
    {
      label: 'Pulse 4',
      time: '02:30',
      waterGrams: lastPulse,
      detail: 'Stop right on target and allow full drawdown.',
    },
  ]
}

function buildChemexPours(totalWater: number, bloomWater: number): PourStep[] {
  const firstTarget = Math.round(totalWater * 0.55)
  const secondTarget = Math.round(totalWater * 0.8)

  return [
    {
      label: 'Bloom',
      time: '00:00',
      waterGrams: bloomWater,
      detail: 'Thoroughly bloom and wait for gasses to release.',
    },
    {
      label: 'Main Pour',
      time: '00:55',
      waterGrams: firstTarget - bloomWater,
      detail: 'Slow spiral pour, keeping brew bed submerged.',
    },
    {
      label: 'Second Pour',
      time: '01:50',
      waterGrams: secondTarget - firstTarget,
      detail: 'Keep flow steady; avoid pouring on filter walls.',
    },
    {
      label: 'Finish',
      time: '02:40',
      waterGrams: totalWater - secondTarget,
      detail: 'Top up gently and let the thick filter finish cleanly.',
    },
  ]
}

function buildAeroPressPours(totalWater: number, bloomWater: number): PourStep[] {
  return [
    {
      label: 'Bloom',
      time: '00:00',
      waterGrams: bloomWater,
      detail: 'Wet the grounds and stir once.',
      kind: 'pour',
    },
    {
      label: 'Fill',
      time: '00:30',
      waterGrams: totalWater - bloomWater,
      detail: 'Pour the rest of the water to the top.',
      kind: 'pour',
    },
    {
      label: 'Steep',
      time: '01:00',
      waterGrams: 0,
      detail: 'Cap it and leave it alone.',
      kind: 'steep',
    },
    {
      label: 'Press',
      time: '01:30',
      waterGrams: 0,
      detail: 'Press slowly, about 30 seconds.',
      kind: 'plunge',
    },
  ]
}

function buildFrenchPressPours(totalWater: number, bloomWater: number): PourStep[] {
  return [
    {
      label: 'Saturate',
      time: '00:00',
      waterGrams: bloomWater,
      detail: 'Wet all the grounds and stir once.',
      kind: 'pour',
    },
    {
      label: 'Fill',
      time: '00:45',
      waterGrams: totalWater - bloomWater,
      detail: 'Fill to total and put the lid on.',
      kind: 'pour',
    },
    {
      label: 'Steep',
      time: '01:15',
      waterGrams: 0,
      detail: 'Leave it for about three minutes.',
      kind: 'steep',
    },
    {
      label: 'Break and press',
      time: '04:00',
      waterGrams: 0,
      detail: 'Break the crust, skim the foam, press slowly.',
      kind: 'plunge',
    },
  ]
}

function buildPours(
  method: BrewMethod,
  totalWater: number,
  bloomWater: number,
): PourStep[] {
  if (method === 'Kalita Wave') {
    return buildKalitaPours(totalWater, bloomWater)
  }
  if (method === 'Chemex') {
    return buildChemexPours(totalWater, bloomWater)
  }
  if (method === 'AeroPress') {
    return buildAeroPressPours(totalWater, bloomWater)
  }
  if (method === 'French Press') {
    return buildFrenchPressPours(totalWater, bloomWater)
  }
  return buildV60Pours(totalWater, bloomWater)
}

function buildOriginNote(origin: string): string {
  if (!origin.trim()) {
    return 'No origin selected: start with balanced settings, then tune by taste.'
  }
  return `Origin cue (${origin.trim()}): start with a gentle pour and avoid aggressive agitation in early pours.`
}

function buildProcessNote(process: ProcessType): string {
  const notes: Record<ProcessType, string> = {
    washed: 'Washed beans: push for clarity with cleaner, controlled pours.',
    natural: 'Natural process: reduce agitation late to keep sweetness focused.',
    honey: 'Honey process: medium-fine grind often brings syrupy texture.',
    anaerobic: 'Anaerobic process: keep water slightly cooler to avoid ferment harshness.',
    other: 'Unlisted process: treat the first brew as baseline and adjust from cup feedback.',
  }
  return notes[process]
}

function buildRoastGoalNote(roastLevel: RoastLevel, tasteGoal: TasteGoal): string {
  const goalText: Record<TasteGoal, string> = {
    balanced: 'Balance target: aim for even sweetness and acidity.',
    bright: 'Bright target: prioritize acidity with a slightly longer ratio.',
    sweet: 'Sweet target: hold a steady flow for smoother extraction.',
    bold: 'Bold target: stronger body with tighter ratio and fuller extraction.',
  }

  const roastText: Record<RoastLevel, string> = {
    light: 'Light roast: finer grind and hotter water usually help extraction.',
    medium: 'Medium roast: this profile responds well to small ratio changes.',
    dark: 'Dark roast: lower temp and slightly coarser grind reduce bitterness.',
  }

  return `${roastText[roastLevel]} ${goalText[tasteGoal]}`
}

export function generateRecipe(input: BrewInput): GeneratedRecipe {
  const experience: Experience = input.experience ?? 'amateur'

  const baseDose =
    input.doseGrams ?? methodDefaults[input.method]?.doseGrams ?? profileDefaults[experience].doseGrams
  const normalizedDose = clamp(baseDose, 10, 40)

  const adjustedRatio = effectiveRatio(input)
  const adjustedTemp = effectiveTemp(input)

  const grind = grindScale[effectiveGrindIndex(input)]

  const waterCap = maxWaterByMethod[input.method]
  const doseCapped = waterCap !== undefined && normalizedDose * adjustedRatio > waterCap
  const dose = doseCapped ? Math.max(10, Math.floor(waterCap / adjustedRatio)) : normalizedDose

  const totalWater = Math.round(dose * adjustedRatio)
  const bloomWater = Math.round(clamp(Math.max(dose * 2.2, totalWater * 0.18), 30, 85))

  const notes = [
    buildRoastGoalNote(input.roastLevel, input.tasteGoal),
    buildProcessNote(input.process),
    buildOriginNote(input.origin),
  ]
  if (doseCapped) {
    notes.push(`Dose reduced to ${dose} g so the brew fits a standard ${input.method}.`)
  }

  return {
    title: `${input.method} Recipe | ${input.tasteGoal.toUpperCase()} focus`,
    method: input.method,
    totalWaterGrams: totalWater,
    ratio: adjustedRatio,
    waterTempC: adjustedTemp,
    targetDrawdown: targetTimeByMethod[input.method],
    grind,
    pours: buildPours(input.method, totalWater, bloomWater),
    notes,
    troubleshooting: {
      sour: 'Go finer by 1 click, raise temp by 1°C, or extend brew time by ~10s.',
      bitter: 'Go coarser by 1 click, drop temp by 1°C, or reduce agitation on final pour.',
      weak: 'Tighten ratio (example 1:16 to 1:15.3) or add one extra pulse pour.',
      dry: 'Reduce late swirling and shorten drawdown; avoid over-extracting the tail.',
    },
  }
}

export interface DialInResult {
  input: BrewInput
  changed: boolean
  lever: 'grind' | 'ratio' | 'temp'
  description: string
}

export function adjustForIssue(input: BrewInput, issue: CupIssue): DialInResult {
  if (issue === 'sour' || issue === 'bitter') {
    const step = issue === 'sour' ? -1 : 1
    const currentOffset = input.grindOffset ?? 0
    const nextOffset = currentOffset + step
    const candidate: BrewInput = { ...input, grindOffset: nextOffset }

    if (effectiveGrindIndex(candidate) === effectiveGrindIndex(input)) {
      return {
        input,
        changed: false,
        lever: 'grind',
        description:
          step < 0
            ? 'Already as fine as this grinder scale goes.'
            : 'Already as coarse as this grinder scale goes.',
      }
    }

    return {
      input: candidate,
      changed: true,
      lever: 'grind',
      description: step < 0 ? 'Ground one step finer.' : 'Ground one step coarser.',
    }
  }

  if (issue === 'weak') {
    const experience: Experience = input.experience ?? 'amateur'
    const currentRatio = input.ratio ?? profileDefaults[experience].ratio
    const candidate: BrewInput = { ...input, ratio: roundToTenths(currentRatio - 0.5) }

    if (effectiveRatio(candidate) === effectiveRatio(input)) {
      return {
        input,
        changed: false,
        lever: 'ratio',
        description: 'Already at the tightest ratio this recipe supports.',
      }
    }

    return {
      input: candidate,
      changed: true,
      lever: 'ratio',
      description: 'Tightened the ratio by 0.5.',
    }
  }

  const currentTemp = input.waterTempC ?? baseTempByMethod[input.method]
  const candidate: BrewInput = { ...input, waterTempC: currentTemp - 1 }

  if (effectiveTemp(candidate) === effectiveTemp(input)) {
    return {
      input,
      changed: false,
      lever: 'temp',
      description: 'Already at the coolest water temp this recipe supports.',
    }
  }

  return {
    input: candidate,
    changed: true,
    lever: 'temp',
    description: 'Dropped water temp by 1°C.',
  }
}
