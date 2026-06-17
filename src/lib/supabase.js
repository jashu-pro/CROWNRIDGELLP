import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
if (supabaseUrl && supabaseAnonKey) {
	supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
	// Avoid throwing at runtime when env vars are not provided during development
	// Consumer code should handle a null `supabase` (e.g., skip auth calls).
	// This keeps the app running so the UI can be inspected without secrets.
	// To enable full functionality, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
	// eslint-disable-next-line no-console
	console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set — supabase client disabled')
}

export { supabase }
