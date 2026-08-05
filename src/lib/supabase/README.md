/**
 * Supabase isolation boundary.
 *
 * This folder is the ONLY place that may import @supabase/supabase-js.
 * It exposes a typed client + data-access helpers for feature modules.
 *
 * Why: if the backend changes, only this directory changes.
 */
