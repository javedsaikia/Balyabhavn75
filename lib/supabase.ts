import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if Supabase credentials are properly configured
const hasValidCredentials = () => {
  const hasUrl = !!supabaseUrl
  const hasAnonKey = !!supabaseAnonKey
  const anonKeyNotPlaceholder = supabaseAnonKey !== 'your_supabase_anon_key_here'
  
  // On client side, only check client-accessible variables
  if (typeof window !== 'undefined') {
    return hasUrl && hasAnonKey && anonKeyNotPlaceholder
  }
  
  // On server side, check all credentials including service key
  const hasServiceKey = !!supabaseServiceKey
  const serviceKeyNotPlaceholder = supabaseServiceKey !== 'your_supabase_service_role_key_here'
  
  return hasUrl && hasAnonKey && anonKeyNotPlaceholder && hasServiceKey && serviceKeyNotPlaceholder
}

// Create a dummy client for when credentials are not available
const createDummyClient = () => {
  return {
    auth: {
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      insert: () => Promise.resolve({ data: null, error: null })
    }),
    rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured - RPC functions unavailable' } })
  } as any
}

// Client for browser/client-side operations
// Dynamic client getter to ensure credentials are checked at runtime
export const getSupabaseClient = () => {
  return hasValidCredentials() 
    ? createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      })
    : createDummyClient()
}

// For backward compatibility, export a client instance
export const supabase = getSupabaseClient()

// Dynamic admin client getter
export const getSupabaseAdminClient = () => {
  // Admin client should only be used on server side
  if (typeof window !== 'undefined') {
    return createDummyClient()
  }
  
  return hasValidCredentials()
    ? createClient(supabaseUrl!, supabaseServiceKey!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    : createDummyClient()
}

// Admin client for server-side operations
export const supabaseAdmin = getSupabaseAdminClient()

// Connection status management
export const isSupabaseConnected = () => {
  // Check if we're in browser environment and get the env var properly
  const connectionEnabled = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_SUPABASE_CONNECTION_ENABLED === 'true'
    : process.env.NEXT_PUBLIC_SUPABASE_CONNECTION_ENABLED === 'true'
  
  const validCredentials = hasValidCredentials()
  
  // If connection is explicitly disabled, return false
  if (process.env.NEXT_PUBLIC_SUPABASE_CONNECTION_ENABLED === 'false') {
    return false
  }
  
  // If we have valid credentials, assume connection is enabled
  return validCredentials
}

// Test connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    return { connected: !error, error: error?.message }
  } catch (err) {
    return { connected: false, error: 'Connection failed' }
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          unique_id: string
          email: string
          name: string
          role: 'user' | 'admin'
          batch?: string
          department?: string
          phone?: string
          address?: string
          year_of_passing?: string
          registration_date?: string
          status: 'active' | 'pending' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unique_id: string
          email: string
          name: string
          role?: 'user' | 'admin'
          batch?: string
          department?: string
          phone?: string
          address?: string
          year_of_passing?: string
          registration_date?: string
          status?: 'active' | 'pending' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unique_id?: string
          email?: string
          name?: string
          role?: 'user' | 'admin'
          batch?: string
          department?: string
          phone?: string
          address?: string
          year_of_passing?: string
          registration_date?: string
          status?: 'active' | 'pending' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}