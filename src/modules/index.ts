/**
 * project-pet — feature-based module map
 *
 * Every bounded context lives in its own folder under src/modules/.
 * A module owns its components, hooks, types, and services.
 * Cross-module contracts live in src/types/ and src/utils/.
 *
 * Supabase access is isolated to src/lib/supabase/.
 * Modules never import @supabase/supabase-js directly.
 */

export const MODULES = [
  'auth',
  'suppliers',
  'categories',
  'invoices',
  'daily-income',
  'dashboard',
  'import',
  'export',
] as const;

export type ModuleName = (typeof MODULES)[number];
