import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  console.log('Querying schema details for public.notifications...')
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'notifications' }).catch(async () => {
    // If RPC doesn't exist, we can select information_schema via query or rpc or select 1 row and check keys
    return supabase.from('notifications').select('*').limit(1)
  })

  if (error) {
    console.error('Query failed:', error)
    return
  }

  console.log('Successfully queried table notifications!')
  if (data && data.length > 0) {
    console.log('Keys of notifications row:', Object.keys(data[0]))
  } else {
    console.log('Table is empty. Let us check columns via RPC or REST schema query.')
    // Let's do a postgrest schema check
    const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`)
    const schema = await res.json()
    const notifDef = schema.definitions ? schema.definitions.notifications : null
    if (notifDef && notifDef.properties) {
      console.log('Columns defined in PostgREST schema for notifications:')
      console.log(Object.keys(notifDef.properties))
    } else {
      console.log('Could not load definitions from REST endpoint schema.')
    }
  }
}

check()
