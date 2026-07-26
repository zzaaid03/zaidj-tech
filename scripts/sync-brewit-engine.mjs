// Copies Brewit's brew engine into packages/demos so the lab demo runs the same
// logic the real app runs. Run `pnpm sync:brewit` to update, `pnpm sync:brewit:check`
// to fail when the copy has fallen behind.
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const DEFAULT_SOURCE = path.resolve(repoRoot, '..', 'Brewit', 'src', 'lib', 'brewEngine.ts')
const TARGET = path.resolve(repoRoot, 'packages', 'demos', 'src', 'brewit', 'logic.ts')

const HEADER = `/**
 * GENERATED FILE - do not edit by hand.
 *
 * Copied from zzaaid03/Brewit, src/lib/brewEngine.ts. The engine is pure and
 * framework-free, so the lab demo runs the same logic the real app runs.
 *
 * To update: change brewEngine.ts in the Brewit repo, then run \`pnpm sync:brewit\`
 * here and commit the result. CI fails the deploy if this file falls behind.
 */
`

// Windows writes CRLF, CI runs on Linux. Everything is compared and written as LF
// so the check cannot pass locally and fail forever in CI.
const normalize = (text) => text.replace(/\r\n/g, '\n')

const source = process.env.BREWIT_ENGINE_PATH
  ? path.resolve(repoRoot, process.env.BREWIT_ENGINE_PATH)
  : DEFAULT_SOURCE

if (!existsSync(source)) {
  console.error(`Brewit engine not found at: ${source}`)
  console.error('Clone zzaaid03/Brewit next to this repo, or set BREWIT_ENGINE_PATH to the brewEngine.ts you want to copy.')
  process.exit(1)
}

const generated = normalize(`${HEADER}\n${readFileSync(source, 'utf8')}`)
const checkOnly = process.argv.includes('--check')
const relTarget = path.relative(repoRoot, TARGET).split(path.sep).join('/')

if (checkOnly) {
  const existing = existsSync(TARGET) ? normalize(readFileSync(TARGET, 'utf8')) : null

  if (existing === generated) {
    console.log(`OK: ${relTarget} matches the Brewit engine.`)
    process.exit(0)
  }

  console.error(`${relTarget} is stale. It no longer matches ${source}.`)
  console.error('Fix it by running:')
  console.error('  pnpm sync:brewit')
  console.error(`then commit the updated ${relTarget}.`)
  process.exit(1)
}

writeFileSync(TARGET, generated)
console.log(`Wrote ${relTarget} from ${source}`)
