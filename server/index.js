import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import morgan from 'morgan'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is not defined in environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('Backend connected to Supabase URL:', supabaseUrl)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() })
})

// Helper to handle Supabase query responses
const handleResponse = async (promise, res) => {
  try {
    const { data, error } = await promise
    if (error) {
      console.error('Supabase Query Error:', error)
      return res.status(error.status || 500).json({ error: error.message, code: error.code })
    }
    res.json(data)
  } catch (err) {
    console.error('Server Internal Error:', err)
    res.status(500).json({ error: err.message })
  }
}

// ----------------------------------------------------
// PROJECTS ROUTES
// ----------------------------------------------------
app.get('/api/projects', async (req, res) => {
  handleResponse(
    supabase.from('projects').select('*').order('created_at', { ascending: false }),
    res
  )
})

app.get('/api/projects/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('id', req.params.id).single()
    if (error) return res.status(error.status || 500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/projects', async (req, res) => {
  const { client_name, project_name, industry, project_type, contract_value, start_date, end_date, priority, status, notes, project_manager_id } = req.body
  const payload = { client_name, project_name, industry, project_type, contract_value, start_date, end_date, priority, status, notes, project_manager_id }
  handleResponse(
    supabase.from('projects').insert(payload).select().single(),
    res
  )
})

app.put('/api/projects/:id', async (req, res) => {
  const { client_name, project_name, industry, project_type, contract_value, start_date, end_date, priority, status, notes, project_manager_id } = req.body
  const payload = { client_name, project_name, industry, project_type, contract_value, start_date, end_date, priority, status, notes, project_manager_id }
  handleResponse(
    supabase.from('projects').update(payload).eq('id', req.params.id).select().single(),
    res
  )
})

app.delete('/api/projects/:id', async (req, res) => {
  handleResponse(
    supabase.from('projects').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// TEAM MEMBERS ROUTES
// ----------------------------------------------------
app.get('/api/team_members', async (req, res) => {
  const { project_id } = req.query
  let q = supabase.from('team_members').select('*')
  if (project_id) q = q.eq('project_id', project_id)
  handleResponse(q, res)
})

app.post('/api/team_members', async (req, res) => {
  const { project_id, name, role, avatar_url, email, capacity, status, department, skills } = req.body
  const payload = { project_id, name, role, avatar_url, email, capacity, status, department, skills }
  handleResponse(
    supabase.from('team_members').insert(payload).select().single(),
    res
  )
})

app.put('/api/team_members/:id', async (req, res) => {
  const { project_id, name, role, avatar_url, email, capacity, status, department, skills } = req.body
  const payload = { project_id, name, role, avatar_url, email, capacity, status, department, skills }
  handleResponse(
    supabase.from('team_members').update(payload).eq('id', req.params.id).select().single(),
    res
  )
})

app.delete('/api/team_members/:id', async (req, res) => {
  handleResponse(
    supabase.from('team_members').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// TASKS ROUTES
// ----------------------------------------------------
app.get('/api/tasks', async (req, res) => {
  const { project_id } = req.query
  let q = supabase.from('tasks').select('*, team_members(name)')
  if (project_id) q = q.eq('project_id', project_id)
  handleResponse(q, res)
})

app.get('/api/tasks/all-raw', async (req, res) => {
  handleResponse(supabase.from('tasks').select('*'), res)
})

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('tasks').select('*').eq('id', req.params.id).single()
    if (error) return res.status(error.status || 500).json({ error: error.message })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/tasks', async (req, res) => {
  const { project_id, title, description, due_date, priority, status, owner_id, progress, completed_at } = req.body
  const payload = { project_id, title, description, due_date, priority, status, owner_id, progress, completed_at }
  handleResponse(
    supabase.from('tasks').insert(payload).select('*, team_members(name)').single(),
    res
  )
})

app.put('/api/tasks/:id', async (req, res) => {
  const { project_id, title, description, due_date, priority, status, owner_id, progress, completed_at } = req.body
  const payload = { project_id, title, description, due_date, priority, status, owner_id, progress, completed_at }
  handleResponse(
    supabase.from('tasks').update(payload).eq('id', req.params.id).select('*, team_members(name)').single(),
    res
  )
})

app.delete('/api/tasks/:id', async (req, res) => {
  handleResponse(
    supabase.from('tasks').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// MILESTONES ROUTES
// ----------------------------------------------------
app.get('/api/milestones', async (req, res) => {
  const { project_id } = req.query
  let q = supabase.from('milestones').select('*')
  if (project_id) q = q.eq('project_id', project_id)
  handleResponse(q, res)
})

app.get('/api/milestones/all-raw', async (req, res) => {
  handleResponse(supabase.from('milestones').select('*'), res)
})

app.post('/api/milestones', async (req, res) => {
  const { project_id, title, description, start_date, end_date, status, progress } = req.body
  const payload = { project_id, title, description, start_date, end_date, status, progress }
  
  if (req.body.dates && (!payload.start_date || !payload.end_date)) {
    const datesStr = req.body.dates
    const parts = datesStr.split('—').map(p => p.trim())
    const toLocalYYYYMMDD = (d) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    const parsePart = (part) => {
      if (!part) return null
      const parsed = Date.parse(part)
      if (!isNaN(parsed)) return toLocalYYYYMMDD(new Date(parsed))
      const withYear = Date.parse(`${part}, ${new Date().getFullYear()}`)
      if (!isNaN(withYear)) return toLocalYYYYMMDD(new Date(withYear))
      return null
    }
    payload.start_date = payload.start_date || parsePart(parts[0])
    payload.end_date = payload.end_date || parsePart(parts[1] || parts[0])
  }

  handleResponse(
    supabase.from('milestones').insert(payload).select().single(),
    res
  )
})

app.put('/api/milestones/:id', async (req, res) => {
  const { project_id, title, description, start_date, end_date, status, progress } = req.body
  const payload = { project_id, title, description, start_date, end_date, status, progress }
  
  if (req.body.dates && (!payload.start_date || !payload.end_date)) {
    const datesStr = req.body.dates
    const parts = datesStr.split('—').map(p => p.trim())
    const toLocalYYYYMMDD = (d) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    const parsePart = (part) => {
      if (!part) return null
      const parsed = Date.parse(part)
      if (!isNaN(parsed)) return toLocalYYYYMMDD(new Date(parsed))
      const withYear = Date.parse(`${part}, ${new Date().getFullYear()}`)
      if (!isNaN(withYear)) return toLocalYYYYMMDD(new Date(withYear))
      return null
    }
    payload.start_date = payload.start_date || parsePart(parts[0])
    payload.end_date = payload.end_date || parsePart(parts[1] || parts[0])
  }

  handleResponse(
    supabase.from('milestones').update(payload).eq('id', req.params.id).select().single(),
    res
  )
})

app.delete('/api/milestones/:id', async (req, res) => {
  handleResponse(
    supabase.from('milestones').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// COMMUNICATION CHANNELS ROUTES
// ----------------------------------------------------
app.get('/api/communication_channels', async (req, res) => {
  const { project_id } = req.query
  let q = supabase.from('communication_channels').select('*')
  if (project_id) q = q.eq('project_id', project_id)
  handleResponse(q, res)
})

app.post('/api/communication_channels', async (req, res) => {
  const { project_id, name, description, channel_url, is_active } = req.body
  const channel_type = req.body.channel_type || req.body.type
  const payload = { project_id, name, description, channel_url, is_active, channel_type }
  handleResponse(
    supabase.from('communication_channels').insert(payload).select().single(),
    res
  )
})

app.put('/api/communication_channels/:id', async (req, res) => {
  const { project_id, name, description, channel_url, is_active } = req.body
  const channel_type = req.body.channel_type || req.body.type
  const payload = { project_id, name, description, channel_url, is_active, channel_type }
  handleResponse(
    supabase.from('communication_channels').update(payload).eq('id', req.params.id).select().single(),
    res
  )
})

app.delete('/api/communication_channels/:id', async (req, res) => {
  handleResponse(
    supabase.from('communication_channels').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// STAKEHOLDERS ROUTES
// ----------------------------------------------------
app.get('/api/stakeholders', async (req, res) => {
  const { project_id } = req.query
  let q = supabase.from('stakeholders').select('*')
  if (project_id) q = q.eq('project_id', project_id)
  handleResponse(q, res)
})

app.post('/api/stakeholders', async (req, res) => {
  handleResponse(
    supabase.from('stakeholders').insert(req.body).select().single(),
    res
  )
})

app.put('/api/stakeholders/:id', async (req, res) => {
  handleResponse(
    supabase.from('stakeholders').update(req.body).eq('id', req.params.id).select().single(),
    res
  )
})

app.delete('/api/stakeholders/:id', async (req, res) => {
  handleResponse(
    supabase.from('stakeholders').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// ESCALATION LEVELS ROUTES
// ----------------------------------------------------
app.get('/api/escalation_levels', async (req, res) => {
  const { project_id } = req.query
  let q = supabase.from('escalation_levels').select('*')
  if (project_id) q = q.eq('project_id', project_id)
  handleResponse(q, res)
})

app.post('/api/escalation_levels', async (req, res) => {
  handleResponse(
    supabase.from('escalation_levels').insert(req.body).select().single(),
    res
  )
})

app.put('/api/escalation_levels/:id', async (req, res) => {
  handleResponse(
    supabase.from('escalation_levels').update(req.body).eq('id', req.params.id).select().single(),
    res
  )
})

app.delete('/api/escalation_levels/:id', async (req, res) => {
  handleResponse(
    supabase.from('escalation_levels').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// MEETING FREQUENCIES ROUTES
// ----------------------------------------------------
app.get('/api/meeting_frequencies', async (req, res) => {
  const { project_id } = req.query
  let q = supabase.from('meeting_frequencies').select('*')
  if (project_id) q = q.eq('project_id', project_id)
  handleResponse(q, res)
})

app.post('/api/meeting_frequencies', async (req, res) => {
  handleResponse(
    supabase.from('meeting_frequencies').insert(req.body).select().single(),
    res
  )
})

app.put('/api/meeting_frequencies/:id', async (req, res) => {
  handleResponse(
    supabase.from('meeting_frequencies').update(req.body).eq('id', req.params.id).select().single(),
    res
  )
})

app.delete('/api/meeting_frequencies/:id', async (req, res) => {
  handleResponse(
    supabase.from('meeting_frequencies').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// INTEGRATIONS (CREDENTIALS) ROUTES
// ----------------------------------------------------
app.get('/api/integrations', async (req, res) => {
  const { project_id } = req.query
  let q = supabase.from('integrations').select('*')
  if (project_id) q = q.eq('project_id', project_id)
  handleResponse(q, res)
})

app.post('/api/integrations', async (req, res) => {
  handleResponse(
    supabase.from('integrations').insert(req.body).select().single(),
    res
  )
})

app.put('/api/integrations/:id', async (req, res) => {
  handleResponse(
    supabase.from('integrations').update(req.body).eq('id', req.params.id).select().single(),
    res
  )
})

app.delete('/api/integrations/:id', async (req, res) => {
  handleResponse(
    supabase.from('integrations').delete().eq('id', req.params.id),
    res
  )
})

// ----------------------------------------------------
// NOTIFICATIONS ROUTES
// ----------------------------------------------------
app.get('/api/notifications', async (req, res) => {
  try {
    const { filter, page = 1, limit = 20 } = req.query
    let q = supabase.from('notifications').select('*', { count: 'exact' })
    
    if (filter === 'unread') {
      q = q.eq('is_read', false)
    } else if (filter === 'high_priority') {
      q = q.eq('priority', 'high')
    } else if (['project', 'task', 'milestone', 'team'].includes(filter)) {
      q = q.eq('category', filter)
    }
    
    const fromIdx = (parseInt(page) - 1) * parseInt(limit)
    const toIdx = fromIdx + parseInt(limit) - 1
    
    const { data, error, count } = await q
      .order('created_at', { ascending: false })
      .range(fromIdx, toIdx)
      
    if (error) throw error
    res.json({ data: data || [], count: count || 0 })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/notifications/check-duplicate', async (req, res) => {
  try {
    const { related_id, category, type } = req.query
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .eq('related_id', related_id)
      .eq('category', category)
      .eq('type', type)
      .gt('created_at', oneDayAgo)
      .limit(1)
      
    if (error) throw error
    res.json({ duplicate: data && data.length > 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/notifications', async (req, res) => {
  handleResponse(
    supabase.from('notifications').insert(req.body).select().single(),
    res
  )
})

app.put('/api/notifications/:id', async (req, res) => {
  handleResponse(
    supabase.from('notifications').update(req.body).eq('id', req.params.id).select().single(),
    res
  )
})

app.patch('/api/notifications/:id/read', async (req, res) => {
  handleResponse(
    supabase.from('notifications').update({ is_read: true }).eq('id', req.params.id).select().single(),
    res
  )
})

app.post('/api/notifications/mark-all-read', async (req, res) => {
  handleResponse(
    supabase.from('notifications').update({ is_read: true }).eq('is_read', false),
    res
  )
})

app.delete('/api/notifications/:id', async (req, res) => {
  handleResponse(
    supabase.from('notifications').delete().eq('id', req.params.id),
    res
  )
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
