// Copies Brewit assets into packages/demos so the lab demo runs the same logic
// and data the real app runs. Run `pnpm sync:brewit` to update, `pnpm sync:brewit:check`
// to fail when any copy has fallen behind.
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const DEFAULT_REPO = path.resolve(repoRoot, '..', 'Brewit')
const brewitRepo = process.env.BREWIT_REPO_PATH
  ? path.resolve(repoRoot, process.env.BREWIT_REPO_PATH)
  : DEFAULT_REPO

const ENGINE_HEADER = `/**
 * GENERATED FILE - do not edit by hand.
 *
 * Copied from zzaaid03/Brewit, src/lib/brewEngine.ts. The engine is pure and
 * framework-free, so the lab demo runs the same logic the real app runs.
 *
 * To update: change brewEngine.ts in the Brewit repo, then run \`pnpm sync:brewit\`
 * here and commit the result. CI fails the deploy if this file falls behind.
 */
`

const ASSETS = [
  {
    source: path.join(brewitRepo, 'src', 'lib', 'brewEngine.ts'),
    target: path.resolve(repoRoot, 'packages', 'demos', 'src', 'brewit', 'logic.ts'),
    render: (text) => `${ENGINE_HEADER}\n${text}`,
  },
  {
    source: path.join(brewitRepo, 'src', 'data', 'origins.json'),
    target: path.resolve(repoRoot, 'packages', 'demos', 'src', 'brewit', 'origins.json'),
    // JSON has no comment syntax, so no header: a header would make this unparseable.
    render: (text) => text,
  },
]

// Windows writes CRLF, CI runs on Linux. Everything is compared and written as LF
// so the check cannot pass locally and fail forever in CI.
const normalize = (text) => text.replace(/\r\n/g, '\n')

const missing = ASSETS.filter((asset) => !existsSync(asset.source))
if (missing.length > 0) {
  console.error('Brewit source file(s) not found:')
  for (const asset of missing) {
    console.error(`  ${asset.source}`)
  }
  console.error('Clone zzaaid03/Brewit next to this repo, or set BREWIT_REPO_PATH to the Brewit checkout you want to copy from.')
  process.exit(1)
}

const checkOnly = process.argv.includes('--check')

if (checkOnly) {
  let stale = false

  for (const asset of ASSETS) {
    const relTarget = path.relative(repoRoot, asset.target).split(path.sep).join('/')
    const generated = normalize(asset.render(readFileSync(asset.source, 'utf8')))
    const existing = existsSync(asset.target) ? normalize(readFileSync(asset.target, 'utf8')) : null

    if (existing === generated) {
      console.log(`OK: ${relTarget} matches ${asset.source}.`)
      continue
    }

    stale = true
    console.error(`${relTarget} is stale. It no longer matches ${asset.source}.`)
  }

  if (stale) {
    console.error('Fix it by running:')
    console.error('  pnpm sync:brewit')
    console.error('then commit the updated file(s).')
    process.exit(1)
  }

  process.exit(0)
}

for (const asset of ASSETS) {
  const relTarget = path.relative(repoRoot, asset.target).split(path.sep).join('/')
  const generated = normalize(asset.render(readFileSync(asset.source, 'utf8')))
  writeFileSync(asset.target, generated)
  console.log(`Wrote ${relTarget} from ${asset.source}`)
}
