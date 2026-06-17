import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Icon } from '../components/Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from '../components/Toast'
import { db } from '../lib/db'

export const ProjectCreation = () => {
  const navigate = useNavigate()
  const { setProjectId, refreshProjects } = useProject()
  const { showToast } = useToast()

  const [priority, setPriority] = useState('medium')
  const [teamMembers, setTeamMembers] = useState([
    { name: 'James R.', role: 'Senior Consultant', department: 'Delivery', skills: ['Agile', 'Scrum'] },
    { name: 'Elena M.', role: 'Lead Architect', department: 'Consulting', skills: ['Cloud Architecture', 'AWS'] },
  ])
  
  const [showAddMemberInline, setShowAddMemberInline] = useState(false)
  const [inlineName, setInlineName] = useState('')
  const [inlineRole, setInlineRole] = useState('')
  const [inlineDept, setInlineDept] = useState('')
  const [inlineSkills, setInlineSkills] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    clientName: '',
    projectName: '',
    industry: 'Financial Services',
    projectType: '',
    contractValue: '',
    startDate: '',
    endDate: '',
    projectManager: 'Sarah Jenkins',
    notes: '',
  })

  const handleAddInlineMember = (e) => {
    e.preventDefault()
    if (!inlineName.trim()) {
      showToast('Member name is required', 'error')
      return
    }
    const newMember = {
      name: inlineName.trim(),
      role: inlineRole.trim() || 'Consultant',
      department: inlineDept.trim() || 'Consulting',
      skills: inlineSkills.split(',').map(s => s.trim()).filter(Boolean)
    }
    setTeamMembers([...teamMembers, newMember])
    setInlineName('')
    setInlineRole('')
    setInlineDept('')
    setInlineSkills('')
    setShowAddMemberInline(false)
    showToast(`${newMember.name} added to package checklist`, 'success')
  }

  // Remove member from list
  const handleRemoveMember = (idxToRemove) => {
    const member = teamMembers[idxToRemove]
    setTeamMembers(teamMembers.filter((_, idx) => idx !== idxToRemove))
    showToast(`Removed ${member.name}`, 'success')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.projectName || !formData.clientName) {
      showToast('Client Name and Project Name are required', 'error')
      return
    }

    setLoading(true)

    try {
      // 1. Save Project
      const savedProj = await db.projects.save({
        client_name: formData.clientName,
        project_name: formData.projectName,
        industry: formData.industry,
        project_type: formData.projectType,
        contract_value: parseFloat(formData.contractValue) || 0,
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        priority,
        notes: formData.notes,
        status: 'active'
      })

      // 2. Save Team Members linked to this project
      for (const member of teamMembers) {
        await db.team_members.save({
          project_id: savedProj.id,
          name: member.name,
          role: member.role,
          email: `${member.name.toLowerCase().replace(/[^a-z]/g, '')}@consulting.com`,
          avatar_url: '',
          capacity: 100,
          status: 'available',
          department: member.department,
          skills: member.skills
        })
      }

      // 3. Save Default Milestones and Tasks to populate the project
      await db.milestones.save({
        project_id: savedProj.id,
        title: 'Project Kickoff & Requirements',
        description: 'Stakeholder interviews, requirements gathering, and initial baseline definitions.',
        start_date: formData.startDate || new Date().toISOString().split('T')[0],
        end_date: formData.startDate || new Date().toISOString().split('T')[0],
        status: 'in_progress',
        progress: 10
      })

      await db.tasks.save({
        project_id: savedProj.id,
        title: 'Draft Requirement Specifications document',
        due_date: formData.startDate || new Date().toISOString().split('T')[0],
        priority: 'high',
        status: 'pending',
        owner_name: teamMembers[0]?.name || 'Sarah Jenkins',
        completed: false
      })

      // 4. Save Default Channels
      await db.channels.save({
        project_id: savedProj.id,
        type: 'slack',
        name: 'Slack',
        description: 'Primary async communications channel',
        channel_url: `#proj-${formData.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        is_active: true
      })

      showToast('Project Kickoff Package Generated!', 'success')
      setSuccess(true)
      
      // Select the new project as active
      setProjectId(savedProj.id)
      await refreshProjects()

      setTimeout(() => {
        setSuccess(false)
        setLoading(false)
        navigate('/dashboard')
      }, 1500)

    } catch (err) {
      setLoading(false)
      showToast(err.message || 'Error generating kickoff package', 'error')
    }
  }

  const priorityButtons = [
    { id: 'low', label: 'Low', color: 'bg-status-success' },
    { id: 'medium', label: 'Medium', color: 'bg-status-warning' },
    { id: 'high', label: 'High', color: 'bg-status-error' },
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-gutter">
          <h2 className="font-headline-md text-headline-md text-on-surface">Initialize Project</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Set up the core parameters for your consultancy's next kickoff package.
          </p>
        </div>

        <div className="bg-surface-base border border-border-subtle rounded-xl shadow-sm overflow-hidden">
          <div className="px-margin-md py-4 border-b border-border-subtle bg-surface-muted/50 flex justify-between items-center">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Project Configuration
            </span>
            <Icon name="more_vert" className="text-outline cursor-pointer hover:text-on-surface" size={20} />
          </div>

          <form className="p-margin-md space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="client-name">
                  Client Name
                </label>
                <input
                  id="client-name"
                  type="text"
                  required
                  placeholder="Acme Corporation"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md placeholder:text-outline-variant"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="project-name">
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  required
                  placeholder="Cloud Infrastructure Migration"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md placeholder:text-outline-variant"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="industry">
                  Industry
                </label>
                <select
                  id="industry"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  <option>Financial Services</option>
                  <option>Healthcare</option>
                  <option>Technology</option>
                  <option>Manufacturing</option>
                  <option>Retail</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="project-type">
                  Project Type
                </label>
                <input
                  id="project-type"
                  type="text"
                  placeholder="Cloud Transformation"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md placeholder:text-outline-variant"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="contract-value">
                  Contract Value ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-outline-variant font-body-md">$</span>
                  <input
                    id="contract-value"
                    type="number"
                    placeholder="125,000"
                    className="w-full bg-surface-base border border-border-subtle rounded-lg pl-8 pr-3 py-2 font-body-md text-body-md placeholder:text-outline-variant"
                    value={formData.contractValue}
                    onChange={(e) => setFormData({ ...formData, contractValue: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="start-date">
                  Start Date
                </label>
                <input
                  id="start-date"
                  type="date"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="end-date">
                  End Date
                </label>
                <input
                  id="end-date"
                  type="date"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="pm">
                  Project Manager
                </label>
                <select
                  id="pm"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md"
                  value={formData.projectManager}
                  onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                >
                  <option>Sarah Jenkins</option>
                  <option>Mark Thompson</option>
                  <option>David Chen</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface-variant">Team Members</label>
                <div className="flex flex-wrap gap-2 p-2 border border-border-subtle rounded-lg bg-surface-base min-h-[42px] items-center">
                  {teamMembers.map((member, idx) => (
                    <span
                      key={idx}
                      className="bg-surface-container text-on-secondary-fixed-variant px-2 py-1 rounded-md font-label-md flex items-center gap-1"
                    >
                      {member.name}
                      <span
                        className="cursor-pointer text-outline hover:text-status-error flex items-center"
                        onClick={() => handleRemoveMember(idx)}
                      >
                        <Icon name="close" size={14} />
                      </span>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAddMemberInline(!showAddMemberInline)}
                    className="text-primary hover:bg-primary-fixed px-2 py-1 rounded-md font-label-md transition-colors flex items-center gap-1"
                  >
                    <Icon name="add" size={14} /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Inline Add Member Box */}
            {showAddMemberInline && (
              <div className="p-4 bg-surface-container-low border border-border-subtle rounded-lg space-y-3">
                <h4 className="font-headline-sm text-label-md text-on-surface font-semibold uppercase">Add Consultant</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="bg-white border border-border-subtle rounded px-2.5 py-1 text-body-md"
                    value={inlineName}
                    onChange={(e) => setInlineName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    className="bg-white border border-border-subtle rounded px-2.5 py-1 text-body-md"
                    value={inlineRole}
                    onChange={(e) => setInlineRole(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    className="bg-white border border-border-subtle rounded px-2.5 py-1 text-body-md"
                    value={inlineDept}
                    onChange={(e) => setInlineDept(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Skills (comma separated, e.g. Terraform, AWS)"
                    className="flex-1 bg-white border border-border-subtle rounded px-2.5 py-1 text-body-md"
                    value={inlineSkills}
                    onChange={(e) => setInlineSkills(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMemberInline(false)}
                      className="px-3 py-1 border border-border-subtle rounded text-label-md font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddInlineMember}
                      className="px-4 py-1 bg-primary text-white rounded text-label-md font-semibold hover:opacity-90"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="font-label-md text-label-md text-on-surface-variant">Priority Level</label>
              <div className="flex gap-4">
                {priorityButtons.map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setPriority(btn.id)}
                    className={`flex-1 py-2 px-4 rounded-lg border font-label-md transition-all flex items-center justify-center gap-2 ${
                      priority === btn.id
                        ? 'border-primary bg-primary-container/10 text-primary font-bold'
                        : 'border-border-subtle hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${btn.color}`} />
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="notes">
                Internal Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Mention key stakeholders, specific compliance requirements, or primary technical hurdles..."
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 font-body-md text-body-md placeholder:text-outline-variant"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="pt-6 border-t border-border-subtle flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 rounded-lg border border-border-subtle text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-2 rounded-lg text-white font-label-md font-bold transition-all shadow-md ${
                  success
                    ? 'bg-status-success'
                    : 'bg-primary hover:opacity-90 active:scale-95'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Icon name="progress_activity" size={18} className="animate-spin" />
                    Processing...
                  </span>
                ) : success ? (
                  <span className="flex items-center gap-2">
                    <Icon name="check_circle" size={18} filled />
                    Package Generated!
                  </span>
                ) : (
                  'Generate Kickoff Package'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-margin-md">
          <div className="flex gap-4 p-4 rounded-xl border border-border-subtle bg-white/50">
            <div className="w-10 h-10 rounded-full bg-secondary-container/10 flex items-center justify-center text-primary shrink-0">
              <Icon name="auto_awesome" size={24} />
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface font-bold">Automated Setup</h4>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-80 mt-1">
                Generating a package will create a customized Slack channel, Jira project, and initial slide deck.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 rounded-xl border border-border-subtle bg-white/50">
            <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center text-status-success shrink-0">
              <Icon name="verified_user" size={24} />
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface font-bold">Privacy Check</h4>
              <p className="font-body-md text-body-md text-on-surface-variant opacity-80 mt-1">
                Contract value and internal notes are restricted to project admins and PMO leadership.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
