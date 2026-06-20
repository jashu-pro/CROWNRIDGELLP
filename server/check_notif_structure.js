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

async function test() {
  console.log('Inserting notification with title, message, and type...')
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      title: 'Structural Check',
      message: 'Inspecting columns...',
      type: 'info'
    })
    .select()

  if (error) {
    console.error('Insert failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error details:', error.details)
  } else {
    console.log('✅ Insert succeeded!')
    console.log('Returned row data keys (actual columns):', Object.keys(data[0]))
    console.log('Full data:', data)
    
    // Clean up
    await supabase.from('notifications').delete().eq('id', data[0].id)
    console.log('Cleanup complete.')
  }
}

test()
