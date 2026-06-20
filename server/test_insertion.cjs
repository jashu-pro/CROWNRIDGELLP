const API_URL = 'http://localhost:5000/api'

async function runTest() {
  console.log('--- STARTING E2E NOTIFICATION INSERTION TEST ---')
  try {
    // 1. Create Project
    console.log('1. Inserting new project...')
    const project = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_name: 'Scratch Test Project',
        client_name: 'Crownridge Partners',
        industry: 'Finance',
        project_type: 'Audit Integration',
        contract_value: 750000,
        status: 'active',
        priority: 'high'
      })
    }).then(res => res.json())
    console.log('Created Project ID:', project.id)

    // Wait slightly to let notifications trigger and save
    await new Promise(r => setTimeout(r, 800))

    // 2. Create Team Member
    console.log('2. Inserting team member...')
    const member = await fetch(`${API_URL}/team_members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        name: 'Alex Mercer',
        role: 'Lead Architect',
        email: 'alex@crownridge.in',
        capacity: 100,
        status: 'active'
      })
    }).then(res => res.json())
    console.log('Created Team Member ID:', member.id)

    await new Promise(r => setTimeout(r, 800))

    // 3. Create Milestone
    console.log('3. Inserting milestone...')
    const milestone = await fetch(`${API_URL}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        title: 'Draft Integration Scope',
        description: 'Completed integration blueprint',
        status: 'scheduled',
        progress: 0,
        dates: 'Jul 01, 2026 — Jul 05, 2026'
      })
    }).then(res => res.json())
    console.log('Created Milestone ID:', milestone.id)

    await new Promise(r => setTimeout(r, 800))

    // 4. Create Task
    console.log('4. Inserting task...')
    const task = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        title: 'Setup Database Connection',
        description: 'Connect Express server to local DB instance',
        status: 'pending',
        priority: 'high',
        owner_id: member.id,
        progress: 0
      })
    }).then(res => res.json())
    console.log('Created Task ID:', task.id)

    await new Promise(r => setTimeout(r, 1200))

    // 5. Query latest notifications
    console.log('5. Querying notifications table to check rows...')
    const notificationsRes = await fetch(`${API_URL}/notifications?limit=10`).then(res => res.json())
    const recentNotifications = notificationsRes.data || []
    
    console.log(`\nFound ${recentNotifications.length} recent notifications in database:`)
    recentNotifications.forEach((n, idx) => {
      console.log(`[#${idx + 1}] Title: "${n.title}" | Message: "${n.message}" | Category: "${n.category}" | Type: "${n.type}"`)
    })

    // Cleanup test records so we do not pollute database
    console.log('\nCleaning up test project (cascades deletes to milestones, tasks, team members)...')
    await fetch(`${API_URL}/projects/${project.id}`, { method: 'DELETE' })
    console.log('Cleanup finished.')
    
  } catch (err) {
    console.error('Test failed with error:', err)
  }
}

runTest()
