import { supabase } from './supabase'

// Helper for generating UUIDs in LocalStorage
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ----------------------------------------------------
// DEFAULT MOCK DATA SEEDS FOR LOCAL STORAGE (CLEARED)
// ----------------------------------------------------
const defaultProjects = []
const defaultTeamMembers = []
const defaultTasks = []
const defaultMilestones = []
const defaultChannels = []
const defaultStakeholders = []
const defaultEscalations = []
const defaultMeetings = []
const defaultIntegrations = []

// Clear any previously stored mock data from LocalStorage to ensure a clean slate
if (typeof window !== 'undefined' && !localStorage.getItem('ko_cleared_prefilled_v1')) {
  const keysToClear = [
    'ko_projects',
    'ko_team_members',
    'ko_tasks',
    'ko_milestones',
    'ko_channels',
    'ko_stakeholders',
    'ko_escalations',
    'ko_meetings',
    'ko_integrations',
    'ko_active_project_id'
  ]
  keysToClear.forEach(key => localStorage.removeItem(key))
  localStorage.setItem('ko_cleared_prefilled_v1', 'true')
}

// ----------------------------------------------------
// LOCAL STORAGE DB ENGINE WRAPPER
// ----------------------------------------------------
class LocalDB {
  getTable(key, defaultVal) {
    const data = localStorage.getItem(`ko_${key}`)
    if (data && data.includes('2024-')) {
      localStorage.removeItem(`ko_${key}`)
      localStorage.setItem(`ko_${key}`, JSON.stringify(defaultVal))
      return defaultVal
    }
    if (!data) {
      localStorage.setItem(`ko_${key}`, JSON.stringify(defaultVal))
      return defaultVal
    }
    return JSON.parse(data)
  }

  setTable(key, data) {
    localStorage.setItem(`ko_${key}`, JSON.stringify(data))
  }

  // Projects
  async getProjects() {
    return this.getTable('projects', defaultProjects)
  }
  async saveProject(proj) {
    const list = await this.getProjects()
    if (proj.id) {
      const idx = list.findIndex((p) => p.id === proj.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...proj }
    } else {
      proj.id = generateUUID()
      list.push(proj)
    }
    this.setTable('projects', list)
    return proj
  }
  async deleteProject(id) {
    const list = await this.getProjects()
    const filtered = list.filter((p) => p.id !== id)
    this.setTable('projects', filtered)
  }

  // Team Members
  async getTeamMembers(projectId) {
    const list = this.getTable('team_members', defaultTeamMembers)
    return projectId ? list.filter((t) => t.project_id === projectId) : list
  }
  async saveTeamMember(member) {
    const list = this.getTable('team_members', defaultTeamMembers)
    if (member.id) {
      const idx = list.findIndex((m) => m.id === member.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...member }
    } else {
      member.id = generateUUID()
      list.push(member)
    }
    this.setTable('team_members', list)
    return member
  }
  async deleteTeamMember(id) {
    const list = this.getTable('team_members', defaultTeamMembers)
    this.setTable('team_members', list.filter((m) => m.id !== id))
  }

  // Tasks
  async getTasks(projectId) {
    const list = this.getTable('tasks', defaultTasks)
    return projectId ? list.filter((t) => t.project_id === projectId) : list
  }
  async saveTask(task) {
    const list = this.getTable('tasks', defaultTasks)
    if (task.id) {
      const idx = list.findIndex((t) => t.id === task.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...task }
    } else {
      task.id = generateUUID()
      list.push(task)
    }
    this.setTable('tasks', list)
    return task
  }
  async deleteTask(id) {
    const list = this.getTable('tasks', defaultTasks)
    this.setTable('tasks', list.filter((t) => t.id !== id))
  }

  // Milestones
  async getMilestones(projectId) {
    const list = this.getTable('milestones', defaultMilestones)
    return projectId ? list.filter((m) => m.project_id === projectId) : list
  }
  async saveMilestone(milestone) {
    const list = this.getTable('milestones', defaultMilestones)
    if (milestone.id) {
      const idx = list.findIndex((m) => m.id === milestone.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...milestone }
    } else {
      milestone.id = generateUUID()
      list.push(milestone)
    }
    this.setTable('milestones', list)
    return milestone
  }
  async deleteMilestone(id) {
    const list = this.getTable('milestones', defaultMilestones)
    this.setTable('milestones', list.filter((m) => m.id !== id))
  }

  // Channels
  async getChannels(projectId) {
    const list = this.getTable('channels', defaultChannels)
    return projectId ? list.filter((c) => c.project_id === projectId) : list
  }
  async saveChannel(channel) {
    const list = this.getTable('channels', defaultChannels)
    if (channel.id) {
      const idx = list.findIndex((c) => c.id === channel.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...channel }
    } else {
      channel.id = generateUUID()
      list.push(channel)
    }
    this.setTable('channels', list)
    return channel
  }
  async deleteChannel(id) {
    const list = this.getTable('channels', defaultChannels)
    this.setTable('channels', list.filter((c) => c.id !== id))
  }

  // Stakeholders
  async getStakeholders(projectId) {
    const list = this.getTable('stakeholders', defaultStakeholders)
    return projectId ? list.filter((s) => s.project_id === projectId) : list
  }
  async saveStakeholder(stakeholder) {
    const list = this.getTable('stakeholders', defaultStakeholders)
    if (stakeholder.id) {
      const idx = list.findIndex((s) => s.id === stakeholder.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...stakeholder }
    } else {
      stakeholder.id = generateUUID()
      list.push(stakeholder)
    }
    this.setTable('stakeholders', list)
    return stakeholder
  }
  async deleteStakeholder(id) {
    const list = this.getTable('stakeholders', defaultStakeholders)
    this.setTable('stakeholders', list.filter((s) => s.id !== id))
  }

  // Escalation Levels
  async getEscalations(projectId) {
    const list = this.getTable('escalations', defaultEscalations)
    return projectId ? list.filter((e) => e.project_id === projectId) : list
  }
  async saveEscalation(escalation) {
    const list = this.getTable('escalations', defaultEscalations)
    if (escalation.id) {
      const idx = list.findIndex((e) => e.id === escalation.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...escalation }
    } else {
      escalation.id = generateUUID()
      list.push(escalation)
    }
    this.setTable('escalations', list)
    return escalation
  }
  async deleteEscalation(id) {
    const list = this.getTable('escalations', defaultEscalations)
    this.setTable('escalations', list.filter((e) => e.id !== id))
  }

  // Meetings
  async getMeetings(projectId) {
    const list = this.getTable('meetings', defaultMeetings)
    return projectId ? list.filter((m) => m.project_id === projectId) : list
  }
  async saveMeeting(meeting) {
    const list = this.getTable('meetings', defaultMeetings)
    if (meeting.id) {
      const idx = list.findIndex((m) => m.id === meeting.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...meeting }
    } else {
      meeting.id = generateUUID()
      list.push(meeting)
    }
    this.setTable('meetings', list)
    return meeting
  }
  async deleteMeeting(id) {
    const list = this.getTable('meetings', defaultMeetings)
    this.setTable('meetings', list.filter((m) => m.id !== id))
  }

  // Integrations (Credentials)
  async getIntegrations(projectId) {
    const list = this.getTable('integrations', defaultIntegrations)
    return projectId ? list.filter((i) => i.project_id === projectId) : list
  }
  async saveIntegration(integration) {
    const list = this.getTable('integrations', defaultIntegrations)
    if (integration.id) {
      const idx = list.findIndex((i) => i.id === integration.id)
      if (idx !== -1) list[idx] = { ...list[idx], ...integration }
    } else {
      integration.id = generateUUID()
      list.push(integration)
    }
    this.setTable('integrations', list)
    return integration
  }
  async deleteIntegration(id) {
    const list = this.getTable('integrations', defaultIntegrations)
    this.setTable('integrations', list.filter((i) => i.id !== id))
  }
}

const localDB = new LocalDB()

// ----------------------------------------------------
// HYBRID BACKEND CONTROLLER EXPORT
// ----------------------------------------------------
export const db = {
  isSupabase: !!supabase,

  projects: {
    list: async () => {
      if (supabase) {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        if (error) throw error
        return data || []
      }
      return localDB.getProjects()
    },
    get: async (id) => {
      if (supabase) {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
        if (error) throw error
        return data
      }
      const list = await localDB.getProjects()
      return list.find((p) => p.id === id)
    },
    save: async (proj) => {
      if (supabase) {
        const payload = {
          client_name: proj.client_name,
          project_name: proj.project_name,
          industry: proj.industry,
          project_type: proj.project_type,
          contract_value: proj.contract_value,
          start_date: proj.start_date || null,
          end_date: proj.end_date || null,
          priority: proj.priority,
          status: proj.status || 'active',
          notes: proj.notes
        }
        if (proj.id) {
          const { data, error } = await supabase.from('projects').update(payload).eq('id', proj.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('projects').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveProject(proj)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteProject(id)
    }
  },

  team_members: {
    list: async (projectId) => {
      if (supabase) {
        let q = supabase.from('team_members').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getTeamMembers(projectId)
    },
    save: async (member) => {
      if (supabase) {
        const payload = {
          project_id: member.project_id || null,
          name: member.name,
          role: member.role,
          avatar_url: member.avatar_url,
          email: member.email,
          capacity: member.capacity,
          status: member.status,
          department: member.department,
          skills: member.skills
        }
        if (member.id) {
          const { data, error } = await supabase.from('team_members').update(payload).eq('id', member.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('team_members').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveTeamMember(member)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('team_members').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteTeamMember(id)
    }
  },

  tasks: {
    list: async (projectId) => {
      if (supabase) {
        let q = supabase.from('tasks').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getTasks(projectId)
    },
    save: async (task) => {
      if (supabase) {
        const payload = {
          project_id: task.project_id,
          title: task.title,
          description: task.description,
          due_date: task.due_date || null,
          priority: task.priority,
          status: task.status,
          owner_id: task.owner_id || null,
          progress: task.progress || 0
        }
        if (task.id) {
          const { data, error } = await supabase.from('tasks').update(payload).eq('id', task.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('tasks').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveTask(task)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('tasks').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteTask(id)
    }
  },

  milestones: {
    list: async (projectId) => {
      if (supabase) {
        let q = supabase.from('milestones').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getMilestones(projectId)
    },
    save: async (ms) => {
      if (supabase) {
        const payload = {
          project_id: ms.project_id,
          title: ms.title,
          description: ms.description,
          start_date: ms.start_date || null,
          end_date: ms.end_date || null,
          status: ms.status,
          progress: ms.progress || 0
        }
        if (ms.id) {
          const { data, error } = await supabase.from('milestones').update(payload).eq('id', ms.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('milestones').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveMilestone(ms)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('milestones').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteMilestone(id)
    }
  },

  channels: {
    list: async (projectId) => {
      if (supabase) {
        let q = supabase.from('communication_channels').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return (data || []).map((d) => ({ ...d, type: d.channel_type }))
      }
      return localDB.getChannels(projectId)
    },
    save: async (channel) => {
      if (supabase) {
        const payload = {
          project_id: channel.project_id,
          channel_type: channel.type,
          name: channel.name,
          description: channel.description,
          channel_url: channel.channel_url,
          is_active: channel.is_active
        }
        if (channel.id) {
          const { data, error } = await supabase.from('communication_channels').update(payload).eq('id', channel.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('communication_channels').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveChannel(channel)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('communication_channels').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteChannel(id)
    }
  },

  stakeholders: {
    list: async (projectId) => {
      if (supabase) {
        let q = supabase.from('stakeholders').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getStakeholders(projectId)
    },
    save: async (sh) => {
      if (supabase) {
        const payload = {
          project_id: sh.project_id,
          name: sh.name,
          role: sh.role,
          organization: sh.organization,
          email: sh.email,
          phone: sh.phone,
          avatar_url: sh.avatar_url
        }
        if (sh.id) {
          const { data, error } = await supabase.from('stakeholders').update(payload).eq('id', sh.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('stakeholders').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveStakeholder(sh)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('stakeholders').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteStakeholder(id)
    }
  },

  escalations: {
    list: async (projectId) => {
      if (supabase) {
        let q = supabase.from('escalation_levels').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getEscalations(projectId)
    },
    save: async (esc) => {
      if (supabase) {
        const payload = {
          project_id: esc.project_id,
          level: esc.level,
          severity: esc.severity,
          description: esc.description,
          contact_name: esc.contact_name,
          contact_role: esc.contact_role,
          response_time: esc.response_time
        }
        if (esc.id) {
          const { data, error } = await supabase.from('escalation_levels').update(payload).eq('id', esc.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('escalation_levels').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveEscalation(esc)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('escalation_levels').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteEscalation(id)
    }
  },

  meetings: {
    list: async (projectId) => {
      if (supabase) {
        let q = supabase.from('meeting_frequencies').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getMeetings(projectId)
    },
    save: async (mt) => {
      if (supabase) {
        const payload = {
          project_id: mt.project_id,
          name: mt.name,
          frequency: mt.frequency,
          day_of_week: mt.day_of_week,
          time: mt.time,
          duration: mt.duration,
          attendees: mt.attendees || []
        }
        if (mt.id) {
          const { data, error } = await supabase.from('meeting_frequencies').update(payload).eq('id', mt.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('meeting_frequencies').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveMeeting(mt)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('meeting_frequencies').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteMeeting(id)
    }
  },

  integrations: {
    list: async (projectId) => {
      if (supabase) {
        let q = supabase.from('integrations').select('*')
        if (projectId) q = q.eq('project_id', projectId)
        const { data, error } = await q
        if (error) throw error
        return data || []
      }
      return localDB.getIntegrations(projectId)
    },
    save: async (integration) => {
      if (supabase) {
        const payload = {
          project_id: integration.project_id,
          service: integration.service,
          description: integration.description,
          status: integration.status,
          last_used: integration.last_used
        }
        if (integration.id) {
          const { data, error } = await supabase.from('integrations').update(payload).eq('id', integration.id).select().single()
          if (error) throw error
          return data
        } else {
          const { data, error } = await supabase.from('integrations').insert(payload).select().single()
          if (error) throw error
          return data
        }
      }
      return localDB.saveIntegration(integration)
    },
    delete: async (id) => {
      if (supabase) {
        const { error } = await supabase.from('integrations').delete().eq('id', id)
        if (error) throw error
        return
      }
      return localDB.deleteIntegration(id)
    }
  }
}
