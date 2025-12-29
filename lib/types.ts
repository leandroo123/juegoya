/**
 * Supabase Database Types
 * 
 * TODO: Generate proper types from Supabase schema
 * Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types.ts
 * 
 * For now, using 'any' to unblock builds. This should be replaced with
 * actual generated types from your Supabase project.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any

// Export commonly used types for convenience
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
