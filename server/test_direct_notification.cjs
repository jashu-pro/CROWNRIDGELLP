const API_URL = 'http://localhost:5000/api'

async function runTest() {
  console.log('Testing direct notification insertion...')
  try {
    const payload = {
      title: 'Database Test Notification',
      message: 'This is a test notification generated via direct script verification.',
      type: 'info',
      category: 'project',
      priority: 'medium',
      is_read: false
    }

    const res = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      const saved = await res.json()
      console.log('✅ Notification successfully saved to remote Supabase database!')
      console.log('Saved Record:', saved)

      // Query it back
      const listRes = await fetch(`${API_URL}/notifications?limit=5`).then(r => r.json())
      const list = listRes.data || []
      const found = list.find(item => item.id === saved.id)
      if (found) {
        console.log('✅ Verified notification is queryable in notifications table!')
      } else {
        console.error('❌ Notification was not found in database query.')
      }

      // Cleanup
      await fetch(`${API_URL}/notifications/${saved.id}`, { method: 'DELETE' })
      console.log('Test notification cleaned up.')
    } else {
      const err = await res.json()
      console.error('❌ Notification insertion failed:', err)
    }
  } catch (err) {
    console.error('Failed to run notification test:', err)
  }
}

runTest()
