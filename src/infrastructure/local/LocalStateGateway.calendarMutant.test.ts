import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const gatewaySource = 'src/infrastructure/local/LocalStateGateway.ts'
const schemaSource = 'src/infrastructure/local/LocalStateSchema.ts'
const gatewayTest = 'src/infrastructure/local/LocalStateGateway.test.ts'
const temporaryDirectories: string[] = []

function runPermissiveCalendarMutation() {
  const directory = mkdtempSync(join('src/infrastructure/local', '.calendar-mutant-'))
  temporaryDirectories.push(directory)
  copyFileSync(schemaSource, join(directory, 'LocalStateSchema.ts'))
  copyFileSync(gatewayTest, join(directory, 'LocalStateGateway.test.ts'))

  const source = readFileSync(gatewaySource, 'utf8')
  const mutated = source.replace(
    'return month >= 1 && month <= 12 && day >= 1 && day <= new Date(Date.UTC(year, month, 0)).getUTCDate()',
    'return month >= 1 && month <= 12 && day >= 1 && day <= 31',
  )
  expect(mutated).not.toBe(source)
  writeFileSync(join(directory, 'LocalStateGateway.ts'), mutated)

  return spawnSync(npx, ['vitest', 'run', join(directory, 'LocalStateGateway.test.ts')], {
    cwd: process.cwd(),
    encoding: 'utf8',
  })
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true })
})

describe('LocalStateGateway calendar conformance harness', () => {
  it('rejects a deliberate permissive-calendar mutation through impossible-date records', () => {
    const result = runPermissiveCalendarMutation()
    const output = `${result.stdout}\n${result.stderr}`

    expect(result.status).not.toBe(0)
    expect(output).toContain('impossible invoice issue date')
  }, 30_000)
})
