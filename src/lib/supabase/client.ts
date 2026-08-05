/**
 * Supabase client — isolation boundary.
 *
 * This file is the ONLY place in the codebase that imports @supabase/supabase-js.
 * Feature modules must consume Supabase through the helpers exported here, never
 * by importing the library directly.
 *
 * Hardening at construction time:
 * - Rejects `service_role` / `sb_secret_` keys. Those bypass RLS and must never
 *   reach the browser bundle.
 * - Rejects URLs that include a path (e.g. `/rest/v1/`).
 * - Refuses to construct the client if required env vars are missing.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Support both the legacy `anon` and the newer `publishable` naming.
// Supabase renamed `anon` → `publishable` in their key naming. We accept both
// to avoid forcing a rename of .env on existing setups.
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

function fail(message: string): never {
  throw new Error(`[supabase/client] ${message}`)
}

function validateUrl(raw: string | undefined): string {
  if (!raw) fail('VITE_SUPABASE_URL is not set. Check your .env file.')
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    fail(`VITE_SUPABASE_URL is not a valid URL: ${raw}`)
  }
  if (parsed.protocol !== 'https:') {
    fail(`VITE_SUPABASE_URL must use https. Got: ${parsed.protocol}`)
  }
  if (parsed.pathname && parsed.pathname !== '/') {
    fail(
      `VITE_SUPABASE_URL must not include a path. Got "${parsed.pathname}". ` +
        `Use the project URL only (e.g. https://xxxx.supabase.co).`,
    )
  }
  if (!parsed.hostname.endsWith('.supabase.co')) {
    fail(
      `VITE_SUPABASE_URL host does not look like a Supabase project: ${parsed.hostname}`,
    )
  }
  return parsed.origin
}

function validateAnonKey(raw: string | undefined): string {
  if (!raw) {
    fail(
      'No Supabase key found. Set VITE_SUPABASE_PUBLISHABLE_KEY ' +
        '(or VITE_SUPABASE_ANON_KEY for legacy) in your .env file.',
    )
  }

  // New Supabase publishable key format: sb_publishable_...
  // Legacy anon JWT format: eyJ...
  const looksLikePublishable = raw.startsWith('sb_publishable_')
  const looksLikeLegacyAnonJwt = raw.startsWith('eyJ')

  if (raw.startsWith('sb_secret_')) {
    fail(
      'Supabase key looks like a service_role secret key. ' +
        'That key bypasses RLS and MUST NOT live in the frontend. ' +
        'Rotate it in Supabase (Settings → API) and use the publishable key instead.',
    )
  }
  if (raw.includes('service_role') || raw.includes('SERVICE_ROLE')) {
    fail('Supabase key contains "service_role". Use the publishable/anon key.')
  }
  if (!looksLikePublishable && !looksLikeLegacyAnonJwt) {
    fail(
      'Supabase key has an unexpected format. ' +
        'Expected sb_publishable_... (new) or eyJ... (legacy JWT).',
    )
  }
  return raw
}

const url = validateUrl(SUPABASE_URL)
const anonKey = validateAnonKey(SUPABASE_ANON_KEY)

export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const SUPABASE_PROJECT_HOST = new URL(url).hostname
