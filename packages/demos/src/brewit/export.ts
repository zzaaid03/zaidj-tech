/**
 * Ported from zzaaid03/Brewit (github.com/zzaaid03/Brewit):
 *   - src/lib/beanConqueror.ts -> formatRecipeForBeanConqueror, buildBCExportPackage,
 *     downloadBeanConquerorExport
 *
 * The source file also exports shareBeanConquerorExport, buildBCZipExportBlob and
 * shareBeanConquerorZip. Those use the Web Share API and a dynamic import('jszip').
 * JSZip is not installed in this repo and Vite resolves dynamic imports at build
 * time, so they are deliberately not ported here.
 */
import type { BrewInput, GeneratedRecipe } from './logic'

export interface BCBrew {
  name: string
  method: string
  totalWaterGrams: number
  ratio: number
  waterTempC: number
  targetDrawdown: string
  pours: unknown[]
  notes: string[]
  input?: BrewInput
  exportedAt: string
}

export interface BCExportPackage {
  version: string
  source: string
  exportedAt: string
  brews: BCBrew[]
}

export function formatRecipeForBeanConqueror(
  recipe: GeneratedRecipe,
  input: BrewInput,
  name?: string,
): BCBrew {
  return {
    name: name ?? recipe.title,
    method: recipe.method,
    totalWaterGrams: recipe.totalWaterGrams,
    ratio: recipe.ratio,
    waterTempC: recipe.waterTempC,
    targetDrawdown: recipe.targetDrawdown,
    pours: recipe.pours,
    notes: recipe.notes,
    input: input,
    exportedAt: new Date().toISOString(),
  }
}

export function buildBCExportPackage(
  recipe: GeneratedRecipe,
  input: BrewInput,
  name?: string,
): BCExportPackage {
  return {
    version: 'brewit-1',
    source: 'Brewit',
    exportedAt: new Date().toISOString(),
    brews: [formatRecipeForBeanConqueror(recipe, input, name)],
  }
}

export function downloadBeanConquerorExport(
  recipe: GeneratedRecipe,
  input: BrewInput,
  name?: string,
): void {
  const pkg = buildBCExportPackage(recipe, input, name)
  const json = JSON.stringify(pkg, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const safeName = (name ?? recipe.title ?? 'export')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-\.]/g, '')
  const filename = `beanconqueror_brew_${safeName}_${Date.now()}.json`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
