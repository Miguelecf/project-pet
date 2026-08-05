/**
 * Pure validation functions for the Supabase client.
 *
 * Extracted so they can be unit-tested without mocking import.meta.env.
 * Throwing behavior is part of the contract — guards return `never` on failure.
 */

export function validateSupabaseUrl(raw: string | undefined): string {
  if (!raw) {
    throw new Error('[supabase/client] VITE_SUPABASE_URL is not set. Check your .env file.')
  }
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error(`[supabase/client] VITE_SUPABASE_URL is not a valid URL: ${raw}`)
  }
  if (parsed.protocol !== 'https:') {
    throw new Error(
      `[supabase/client] VITE_SUPABASE_URL must use https. Got: ${parsed.protocol}`,
    )
  }
  if (parsed.pathname && parsed.pathname !== '/') {
    throw new Error(
      `[supabase/client] VITE_SUPABASE_URL must not include a path. Got "${parsed.pathname}". ` +
        `Use the project URL only (e.g. https://xxxx.supabase.co).`,
    )
  }
  if (!parsed.hostname.endsWith('.supabase.co')) {
    throw new Error(
      `[supabase/client] VITE_SUPABASE_URL host does not look like a Supabase project: ${parsed.hostname}`,
    )
  }
  return parsed.origin
}

/**
 * Validates a Supabase browser-safe key.
 * Accepts the new `sb_publishable_...` format or the legacy `eyJ...` JWT.
 * Rejects `sb_secret_...` (service_role) and any key containing the
 * literal "service_role" string.
 */
export function validateSupabaseKey(raw: string | undefined): string {
  if (!raw) {
    throw new Error(
      '[supabase/client] No Supabase key found. Set VITE_SUPABASE_PUBLISHABLE_KEY ' +
        '(or VITE_SUPABASE_ANON_KEY for legacy) in your .env file.',
    )
  }

  const looksLikePublishable = raw.startsWith('sb_publishable_')
  const looksLikeLegacyAnonJwt = raw.startsWith('eyJ')

  if (raw.startsWith('sb_secret_')) {
    throw new Error(
      '[supabase/client] Supabase key looks like a service_role secret key. ' +
        'That key bypasses RLS and MUST NOT live in the frontend. ' +
        'Rotate it in Supabase (Settings → API) and use the publishable key instead.',
    )
  }
  if (raw.includes('service_role') || raw.includes('SERVICE_ROLE')) {
    throw new Error(
      '[supabase/client] Supabase key contains "service_role". Use the publishable/anon key.',
    )
  }
  if (!looksLikePublishable && !looksLikeLegacyAnonJwt) {
    throw new Error(
      '[supabase/client] Supabase key has an unexpected format. ' +
        'Expected sb_publishable_... (new) or eyJ... (legacy JWT).',
    )
  }
  return raw
}
