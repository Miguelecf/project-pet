/**
 * Module-level re-exports for the Supabase isolation layer.
 *
 * Feature modules import from this file (or from specific helpers), NEVER from
 * `@supabase/supabase-js` directly.
 */

export { supabase, SUPABASE_PROJECT_HOST } from './client'
export { validateSupabaseKey, validateSupabaseUrl } from './guards'
export type { SupabaseClient, Session, User } from '@supabase/supabase-js'
