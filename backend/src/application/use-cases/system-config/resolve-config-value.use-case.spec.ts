import { describe, expect, it, vi } from 'vitest'
import { ResolveConfigValueUseCase } from './resolve-config-value.use-case'
import { IDepartmentConfigRepository } from '../../ports/department-config.repository.port'
import { ISystemConfigRepository } from '../../ports/system-config.repository.port'

describe('ResolveConfigValueUseCase', () => {
  function create() {
    const globals = [{ key: 'MIN_INTERNSHIP_DAYS', value: '20', description: 'Minimum', isPublic: false }]
    const system = { findAll: vi.fn().mockResolvedValue(globals), upsert: vi.fn() } as unknown as ISystemConfigRepository
    const overrides = { find: vi.fn(), upsert: vi.fn(), delete: vi.fn(), findByDepartment: vi.fn().mockResolvedValue([]) } as unknown as IDepartmentConfigRepository
    return { useCase: new ResolveConfigValueUseCase(system, overrides), system, overrides }
  }

  it('resolves a department override over the global value', async () => {
    const { useCase, overrides } = create()
    vi.mocked(overrides.findByDepartment).mockResolvedValue([{ value: '30', key: 'MIN_INTERNSHIP_DAYS' }] as never)
    const result = await useCase.execute('department-1')
    expect(result[0]).toMatchObject({ effectiveValue: '30', isOverridden: true })
  })

  it('falls back to the global value without an override', async () => {
    const { useCase, overrides } = create()
    vi.mocked(overrides.find).mockResolvedValue(null)
    const result = await useCase.execute('department-1')
    expect(result[0]).toMatchObject({ effectiveValue: '20', isOverridden: false })
  })
})
