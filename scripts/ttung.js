import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

const INCLUDED_DIRS = ['components', 'lib']
const EXTENSIONS = new Set(['.ts', '.tsx'])

function walk(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walk(full))
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      results.push(full)
    }
  }
  return results
}

const files = INCLUDED_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))

// I will just accept this REGEX magic sauce
const TTUNG_RE = /\bttung\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*)\1\s*,?\s*\)/g

function extractTtungCalls(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const calls = []
  let m
  while ((m = TTUNG_RE.exec(content))) {
    const line = content.slice(0, m.index).split('\n').length
    calls.push({ file: filePath, line, de: m[2] })
  }
  return calls
}

const allCalls = files.flatMap(extractTtungCalls)

const DE2EN_PATH = path.join(ROOT, 'lib', 'strings', 'de2en.ts')

// and again, I trust in regex magic
const ENTRY_RE =
  /^\s*(?:(['"])((?:\\.|(?!\1)[\s\S])*)\1|([^\s:'",]+))\s*:\s*(['"])((?:\\.|(?!\4)[\s\S])*)\4/gm

function readDe2en() {
  const content = fs.readFileSync(DE2EN_PATH, 'utf-8')
  const entries = {}
  let m
  while ((m = ENTRY_RE.exec(content))) {
    const key = (m[2] ?? m[3]).replace(/\\(['\\])/g, '$1')
    entries[key] = m[5].replace(/\\(['\\])/g, '$1')
  }
  return entries
}

const de2en = readDe2en()

const usage = new Map()
for (const call of allCalls) {
  if (!usage.has(call.de)) usage.set(call.de, [])
  usage.get(call.de).push({ file: call.file, line: call.line })
}

const translated = []
const untranslated = []
for (const [de, locations] of usage) {
  ;(de2en[de] ? translated : untranslated).push({ de, locations })
}

translated.sort((a, b) =>
  a.de.localeCompare(b.de, 'de', { sensitivity: 'base' }),
)

untranslated.sort((a, b) =>
  a.de.localeCompare(b.de, 'de', { sensitivity: 'base' }),
)

const unused = []
for (const de of Object.keys(de2en)) {
  if (!usage.has(de)) unused.push(de)
}

unused.sort((a, b) => a.localeCompare(b, 'de', { sensitivity: 'base' }))

function escape(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

const lines = ['export const de2en: { [key: string]: string } = {']
for (const e of untranslated) {
  lines.push(`  // TODO: NEUE Übersetzung (${e.locations.length}x verwendet)`)
  lines.push(`  '${escape(e.de)}': '',`)
}
for (const e of translated) {
  lines.push(`  '${escape(e.de)}': '${escape(de2en[e.de])}',`)
}
for (const de of unused) {
  lines.push(`  // TODO: veraltet, im Code nicht verwendet`)
  lines.push(`  '${escape(de)}': '${escape(de2en[de])}',`)
}
lines.push('}')

fs.writeFileSync(DE2EN_PATH, lines.join('\n') + '\n')
