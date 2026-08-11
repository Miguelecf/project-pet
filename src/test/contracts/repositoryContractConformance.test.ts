import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import type { ContractMutant } from './inMemoryContractFixtures'

const mutationRunner = 'src/test/contracts/repositoryContracts.mutant.test.ts'
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

function runMutant(mutant: ContractMutant) {
  return spawnSync(npx, ['vitest', 'run', mutationRunner], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, CONTRACT_MUTANT: mutant },
  })
}

describe('repository contract conformance harness', () => {
  it.each([
    ['payment-void-unpersisted', 'persists a voided payment and returns its balance and status transition'],
    ['daily-income-delete-retained', 'creates, reads, updates, and deletes daily income'],
    ['category-delete-retained', 'excludes an unreferenced category from the post-delete list'],
    ['payment-balance-untracked', 'derives remaining balance and invoice status across partial and complete payments'],
    ['payment-balance-untracked', 'rejects payment amounts greater than the remaining balance'],
  ] as const)('rejects the %s adapter mutation through %s', (mutant, expectedFailure) => {
    const result = runMutant(mutant)
    const output = `${result.stdout}\n${result.stderr}`

    expect(result.status).not.toBe(0)
    expect(output).toContain(expectedFailure)
  }, 30_000)
})
