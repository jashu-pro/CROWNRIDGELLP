import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env')
  process.exit(1)
}

async function check() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    })
    const schema = await res.json()
    console.log('Raw Schema Response:', schema)
  } catch (err) {
    console.error('Failed:', err.message)
  }
}

check()
