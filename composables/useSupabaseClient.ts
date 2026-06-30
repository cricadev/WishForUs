import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null = null
let cachedSignature = ''

export const useSupabaseClient = () => {
  const config = useRuntimeConfig()
  const supabaseUrl = String(config.public.supabaseUrl || '')
  const supabaseAnonKey = String(config.public.supabaseAnonKey || '')

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured yet. Add NUXT_PUBLIC_SUPABASE_URL and NUXT_PUBLIC_SUPABASE_ANON_KEY to your environment.')
  }

  const signature = `${supabaseUrl}:${supabaseAnonKey.slice(0, 8)}`

  if (!cachedClient || cachedSignature !== signature) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    })
    cachedSignature = signature
  }

  return cachedClient
}
