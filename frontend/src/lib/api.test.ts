import { AxiosHeaders } from 'axios'
import { afterEach, describe, expect, it } from 'vitest'
import { api, normalizeApiError, publicApi } from './api'
import { csrfStore } from './csrf-store'

describe('API clients', () => {
  const originalAdapter = api.defaults.adapter

  afterEach(() => {
    csrfStore.clear()
    api.defaults.adapter = originalAdapter
  })

  it('attaches the CSRF token to mutation requests', async () => {
    csrfStore.setToken('csrf-test-token')
    api.defaults.adapter = async (config) => ({
      data: config.headers,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    })

    const response = await api.post('/test-mutation', {})
    expect(AxiosHeaders.from(response.data).get('X-CSRF-Token')).toBe('csrf-test-token')
  })

  it('uses the API root for public token endpoints', () => {
    expect(publicApi.getUri({ url: '/employer-evaluation/validate' })).toBe('http://localhost:3000/employer-evaluation/validate')
  })

  it('normalizes backend domain errors into readable errors', () => {
    expect(normalizeApiError({ response: { status: 403, data: { error: { code: 'FORBIDDEN', message: 'Access denied' } } } })).toEqual({
      code: 'FORBIDDEN',
      message: 'Access denied',
      status: 403,
    })
  })

  it('passes FormData uploads through without a manually specified multipart boundary', async () => {
    let capturedData: unknown
    let capturedContentType: unknown
    api.defaults.adapter = async (config) => {
      capturedData = config.data
      capturedContentType = config.headers.get('Content-Type')
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config, request: {} }
    }

    const formData = new FormData()
    formData.append('file', new Blob(['csv'], { type: 'text/csv' }), 'import.csv')
    await api.post('/users/import', formData)

    expect(capturedData).toBeInstanceOf(FormData)
    expect(String(capturedContentType ?? '').toLowerCase()).not.toContain('boundary=manual')
  })
})
