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
import { validateSupabaseKey, validateSupabaseUrl } from './guards'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Support both the legacy `anon` and the newer `publishable` naming.
// Supabase renamed `anon` → `publishable` in their key naming. We accept both
// to avoid forcing a rename of .env on existing setups.
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

const url = validateSupabaseUrl(SUPABASE_URL)
const key = validateSupabaseKey(SUPABASE_KEY)

export const supabase: SupabaseClient = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const SUPABASE_PROJECT_HOST = new URL(url).hostname
