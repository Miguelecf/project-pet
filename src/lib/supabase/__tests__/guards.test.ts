import { describe, expect, it } from 'vitest'
import { validateSupabaseKey, validateSupabaseUrl } from '../guards'

describe('validateSupabaseUrl', () => {
  it('accepts a clean https Supabase project URL', () => {
    expect(validateSupabaseUrl('https://abcdefghij.supabase.co')).toBe(
      'https://abcdefghij.supabase.co',
    )
  })

  it('strips trailing slash from a clean URL', () => {
    expect(validateSupabaseUrl('https://abcdefghij.supabase.co/')).toBe(
      'https://abcdefghij.supabase.co',
    )
  })

  it('throws when the URL is undefined or empty', () => {
    expect(() => validateSupabaseUrl(undefined)).toThrow(/VITE_SUPABASE_URL is not set/)
    expect(() => validateSupabaseUrl('')).toThrow(/VITE_SUPABASE_URL is not set/)
  })

  it('throws when the URL is not a valid URL', () => {
    expect(() => validateSupabaseUrl('not-a-url')).toThrow(/not a valid URL/)
  })

  it('throws when the URL does not use https', () => {
    expect(() => validateSupabaseUrl('http://abcdefghij.supabase.co')).toThrow(
      /must use https/,
    )
  })

  it('throws when the URL has a path like /rest/v1/', () => {
    expect(() => validateSupabaseUrl('https://abcdefghij.supabase.co/rest/v1/')).toThrow(
      /must not include a path/,
    )
  })

  it('throws when the host is not a Supabase project', () => {
    expect(() => validateSupabaseUrl('https://example.com')).toThrow(
      /does not look like a Supabase project/,
    )
  })
})

describe('validateSupabaseKey', () => {
  it('accepts the new sb_publishable_ key format', () => {
    expect(validateSupabaseKey('sb_publishable_abcdef123')).toBe('sb_publishable_abcdef123')
  })

  it('accepts the legacy eyJ... JWT format', () => {
    expect(validateSupabaseKey('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig')).toBe(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig',
    )
  })

  it('throws when the key is undefined or empty', () => {
    expect(() => validateSupabaseKey(undefined)).toThrow(/No Supabase key found/)
    expect(() => validateSupabaseKey('')).toThrow(/No Supabase key found/)
  })

  it('throws when the key starts with sb_secret_ (service_role)', () => {
    expect(() => validateSupabaseKey('sb_secret_abcdef123')).toThrow(
      /service_role secret key/,
    )
  })

  it('throws when the key contains the literal "service_role" anywhere', () => {
    expect(() => validateSupabaseKey('eyJ.role.service_role.sig')).toThrow(
      /contains "service_role"/,
    )
  })

  it('throws when the key has an unexpected format', () => {
    expect(() => validateSupabaseKey('random-string')).toThrow(/unexpected format/)
    expect(() => validateSupabaseKey('pk_live_xxxxx')).toThrow(/unexpected format/)
  })
})
