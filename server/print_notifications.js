import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function run() {
  console.log('--- STARTING NOTIFICATIONS TEST SUITE ---')
  
  // 1. Insert multiple unread notifications
  console.log('\nInserting unread test notifications...')
  const testNotifs = [
    { title: 'Suite Test Notif 1', message: 'Message 1', type: 'info', category: 'project', is_read: false },
    { title: 'Suite Test Notif 2', message: 'Message 2', type: 'info', category: 'project', is_read: false },
    { title: 'Suite Test Notif 3', message: 'Message 3', type: 'info', category: 'project', is_read: false }
  ]
  const { data: inserted, error: insertError } = await supabase
    .from('notifications')
    .insert(testNotifs)
    .select()

  if (insertError) {
    console.error('❌ Insert failed:', insertError)
    return
  }
  console.log(`✅ Inserted ${inserted.length} notifications:`, inserted.map(n => n.id))

  // 2. Test Mark All as Read
  console.log('\nTesting Mark All as Read...')
  const markRes = await fetch('http://localhost:5000/api/notifications/mark-all-read', { method: 'POST' })
  if (markRes.ok) {
    console.log('✅ API Mark All as Read called successfully')
  } else {
    console.error('❌ API Mark All as Read failed:', markRes.status, await markRes.text())
  }

  // Count unread in database
  const { count: unreadCount, error: countError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('is_read', false)

  if (countError) {
    console.error('Count query error:', countError)
  } else {
    console.log(`Unread notifications count remaining: ${unreadCount}`)
    if (unreadCount === 0) {
      console.log('✅ SUCCESS: 0 unread notifications left!')
    } else {
      console.error('❌ FAILURE: Unread notifications count is not 0!')
    }
  }

  // 3. Test Delete Single Notification
  const idToDelete = inserted[0].id
  console.log(`\nTesting Delete Single Notification for ID ${idToDelete}...`)
  const deleteRes = await fetch(`http://localhost:5000/api/notifications/${idToDelete}`, { method: 'DELETE' })
  if (deleteRes.ok) {
    console.log('✅ API Delete called successfully')
  } else {
    console.error('❌ API Delete failed:', deleteRes.status, await deleteRes.text())
  }

  // Query back the deleted record
  const { data: searchDeleted, error: searchError } = await supabase
    .from('notifications')
    .select('id')
    .eq('id', idToDelete)

  if (searchError) {
    console.error('Search query error:', searchError)
  } else {
    if (searchDeleted && searchDeleted.length === 0) {
      console.log('✅ SUCCESS: Notification was deleted successfully!')
    } else {
      console.error('❌ FAILURE: Notification still exists in table!')
    }
  }

  // 4. Test Bulk Delete All
  console.log('\nTesting Bulk Delete All...')
  const deleteAllRes = await fetch('http://localhost:5000/api/notifications', { method: 'DELETE' })
  if (deleteAllRes.ok) {
    console.log('✅ API Delete All called successfully')
  } else {
    console.error('❌ API Delete All failed:', deleteAllRes.status, await deleteAllRes.text())
  }

  // Count total notifications left in table
  const { count: totalCount, error: totalCountError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })

  if (totalCountError) {
    console.error('Total count query error:', totalCountError)
  } else {
    console.log(`Total notifications remaining in table: ${totalCount}`)
    if (totalCount === 0) {
      console.log('✅ SUCCESS: Notifications table is completely empty!')
    } else {
      console.error(`❌ FAILURE: Notifications table has ${totalCount} rows remaining!`)
    }
  }

  console.log('\n--- TEST SUITE COMPLETE ---')
}

run()
