import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { useProject } from '../context/ProjectContext'
import { useToast } from './Toast'
import { db } from '../lib/db'

export const TopNavbar = () => {
  const { projects, setProjectId, session, logout } = useProject()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [systemDateTime, setSystemDateTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentTime = systemDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  const currentDate = systemDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState({ projects: [], tasks: [], members: [] })

  // Popover states
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New member assigned',
      desc: 'Elena Rodriguez was added to Cloud Migration.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Milestone Completed',
      desc: 'Phase 1 kickoff meeting requirements finalized.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'System Alert',
      desc: 'Jira integration sync completed with 0 errors.',
      time: '4h ago',
      unread: false,
    },
  ])
  const unreadCount = notifications.filter((n) => n.unread).length

  // Dark mode state
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  )

  const toggleDarkMode = () => {
    const nextDark = !darkMode
    setDarkMode(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      showToast('Dark mode enabled', 'success')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      showToast('Light mode enabled', 'success')
    }
  }

  // Refs for click outside
  const searchRef = useRef(null)
  const notificationsRef = useRef(null)
  const settingsRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search query effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ projects: [], tasks: [], members: [] })
      return
    }

    const performSearch = async () => {
      const q = searchQuery.toLowerCase()
      try {
        const filteredProjects = projects.filter(
          (p) =>
            p.project_name.toLowerCase().includes(q) ||
            p.client_name.toLowerCase().includes(q)
        )

        const allMembers = await db.team_members.list()
        const filteredMembers = allMembers.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q) ||
            (m.department && m.department.toLowerCase().includes(q))
        )

        const allTasks = await db.tasks.list()
        const filteredTasks = allTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.owner_name && t.owner_name.toLowerCase().includes(q))
        )

        setSearchResults({
          projects: filteredProjects.slice(0, 3),
          members: filteredMembers.slice(0, 3),
          tasks: filteredTasks.slice(0, 3),
        })
      } catch (err) {
        console.error('Search error:', err)
      }
    }

    const timer = setTimeout(performSearch, 150)
    return () => clearTimeout(timer)
  }, [searchQuery, projects])

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all project data? This will restore defaults.')) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('ko_')) {
          localStorage.removeItem(key)
        }
      })
      showToast('Database reset successfully!', 'success')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <header className="h-16 bg-surface border-b border-border-subtle shadow-sm flex justify-between items-center px-container-padding-desktop sticky top-0 z-40">
      {/* Brand Logo / Home link */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-headline-sm font-headline-sm font-bold text-primary hover:opacity-90 transition-opacity">
          KickoffGen
        </Link>
      </div>

      {/* Large Centered Search Bar */}
      <div className="flex-1 flex justify-center px-4 max-w-2xl mx-auto">
        <div ref={searchRef} className="relative w-full max-w-md">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
              <Icon name="search" size={20} />
            </span>
            <input
              type="text"
              placeholder="Search projects, tasks, team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-slate-100 dark:bg-slate-850 text-on-surface placeholder:text-outline/70 pl-10 pr-9 py-2 rounded-full border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-body-md text-body-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>

          {/* Floating Search Results Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
              {!searchQuery ? (
                <div className="p-3">
                  <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-2">Recent Projects</div>
                  {projects.length > 0 ? (
                    <div className="space-y-1">
                      {projects.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setProjectId(p.id)
                            showToast(`Switched to project: ${p.project_name}`, 'success')
                            setIsSearchFocused(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                        >
                          <Icon name="folder" size={18} className="text-primary" />
                          <div className="truncate">
                            <div className="text-body-md font-medium text-on-surface truncate">{p.project_name}</div>
                            <div className="text-[11px] text-outline truncate">{p.client_name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-body-md text-outline px-3 py-1">No projects found.</div>
                  )}
                </div>
              ) : (
                <div className="p-3 space-y-4">
                  {/* Projects Section */}
                  {searchResults.projects.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Projects</div>
                      <div className="space-y-0.5">
                        {searchResults.projects.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setProjectId(p.id)
                              showToast(`Switched to project: ${p.project_name}`, 'success')
                              setIsSearchFocused(false)
                              setSearchQuery('')
                            }}
                            className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                          >
                            <Icon name="folder" size={18} className="text-primary" />
                            <div className="truncate">
                              <div className="text-body-md font-medium text-on-surface truncate">{p.project_name}</div>
                              <div className="text-[11px] text-outline truncate">{p.client_name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks Section */}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Tasks</div>
                      <div className="space-y-0.5">
                        {searchResults.tasks.map((t) => {
                          const p = projects.find((proj) => proj.id === t.project_id)
                          return (
                            <button
                              key={t.id}
                              onClick={() => {
                                if (t.project_id) setProjectId(t.project_id)
                                navigate('/milestones')
                                setIsSearchFocused(false)
                                setSearchQuery('')
                                showToast(`Navigated to task: ${t.title}`, 'success')
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                            >
                              <Icon name="check_circle" size={18} className={t.completed ? "text-status-success" : "text-outline"} />
                              <div className="truncate">
                                <div className="text-body-md font-medium text-on-surface truncate">{t.title}</div>
                                <div className="text-[11px] text-outline truncate">{p ? p.project_name : 'General'}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Members Section */}
                  {searchResults.members.length > 0 && (
                    <div>
                      <div className="text-[11px] font-bold text-outline uppercase tracking-wider px-3 mb-1">Team Members</div>
                      <div className="space-y-0.5">
                        {searchResults.members.map((m) => {
                          const p = projects.find((proj) => proj.id === m.project_id)
                          return (
                            <button
                              key={m.id}
                              onClick={() => {
                                if (m.project_id) setProjectId(m.project_id)
                                navigate('/team')
                                setIsSearchFocused(false)
                                setSearchQuery('')
                                showToast(`Navigated to member: ${m.name}`, 'success')
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg flex items-center gap-2.5 transition-colors"
                            >
                              <Icon name="person" size={18} className="text-accent-vivid" />
                              <div className="truncate">
                                <div className="text-body-md font-medium text-on-surface truncate">{m.name}</div>
                                <div className="text-[11px] text-outline truncate">{m.role} {p ? `• ${p.project_name}` : ''}</div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {searchResults.projects.length === 0 &&
                    searchResults.tasks.length === 0 &&
                    searchResults.members.length === 0 && (
                      <div className="p-4 text-center text-outline text-body-md">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Far Right Interactive Options */}
      <div className="flex items-center gap-2">
        {/* System Date & Time Display */}
        <div className="hidden md:flex flex-col items-end px-3 py-1 bg-slate-100 dark:bg-slate-800/40 rounded-lg border border-border-subtle dark:border-slate-850 mr-2 text-right shrink-0">
          <span className="text-[11px] font-bold text-primary font-mono tracking-wide">{currentTime}</span>
          <span className="text-[10px] text-outline font-medium">{currentDate}</span>
        </div>

        {/* Notification Bell */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => {
              console.log("Clicked: Notification Bell");
              setShowNotifications(!showNotifications)
              setShowSettings(false)
              setShowProfile(false)
            }}
            className="relative p-2 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full"
          >
            <Icon name="notifications" size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full border border-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border-subtle dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <span className="font-semibold text-body-md text-on-surface">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      console.log("Clicked: Mark all notifications as read");
                      setNotifications(notifications.map(n => ({ ...n, unread: false })))
                      showToast('All notifications marked as read', 'success')
                    }}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="divide-y divide-border-subtle dark:divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      console.log("Clicked: Notification Item", n.id);
                      setNotifications(notifications.map(item => item.id === n.id ? { ...item, unread: false } : item))
                      showToast(`Opened alert: ${n.title}`, 'success')
                    }}
                    className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3 ${
                      n.unread ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${n.unread ? 'bg-primary' : 'bg-transparent'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-body-md font-medium text-on-surface">{n.title}</div>
                      <div className="text-label-md text-outline mt-0.5">{n.desc}</div>
                      <div className="text-[10px] text-outline/70 mt-1">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border-subtle dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false)
                    showToast('Opening notification center...', 'success')
                  }}
                  className="text-body-md text-primary font-semibold hover:underline w-full py-1"
                >
                  View all activity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Cog */}
        <div ref={settingsRef} className="relative">
          <button
            onClick={() => {
              console.log("Clicked: Settings Cog");
              setShowSettings(!showSettings)
              setShowNotifications(false)
              setShowProfile(false)
            }}
            className="p-2 text-on-surface-variant hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-full"
          >
            <Icon name="settings" size={22} />
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-4">
              <h4 className="font-semibold text-body-md text-on-surface border-b border-border-subtle dark:border-slate-800 pb-2">
                Settings
              </h4>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-body-md text-on-surface font-medium">Dark Mode</span>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    darkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      darkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* DB Status */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-outline uppercase tracking-wider">Database Status</div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-border-subtle dark:border-slate-800">
                  <span className={`w-2.5 h-2.5 rounded-full ${db.isSupabase ? 'bg-status-success animate-pulse' : 'bg-status-warning'}`} />
                  <div>
                    <div className="text-label-md font-semibold text-on-surface">
                      {db.isSupabase ? 'Supabase Connected' : 'Local Storage Engine'}
                    </div>
                    <div className="text-[10px] text-outline">
                      {db.isSupabase ? 'Cloud sync active' : 'Offline fallback mode'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Database */}
              <div className="pt-2 border-t border-border-subtle dark:border-slate-800">
                <button
                  onClick={() => {
                    console.log("Clicked: Reset App Data");
                    handleResetData();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-status-error/30 text-status-error rounded-lg hover:bg-status-error/5 transition-all text-label-md font-semibold"
                >
                  <Icon name="delete_forever" size={16} />
                  Reset App Data
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              console.log("Clicked: Profile Avatar");
              setShowProfile(!showProfile)
              setShowNotifications(false)
              setShowSettings(false)
            }}
            className="flex items-center focus:outline-none ml-2"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle hover:border-primary transition-all">
              <img
                alt="User profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7Qk6fsUnOGWZrr6x1jXkrICj7qQZch0GPR6q02C-ag7h7qqBkpwRCkgfLldj01t-GVXAVgkm7b2QAaH3oXtCHE9UdQnvVShiu5nAeTnqzabdQ4GCMEM3s_XmWsb5wKW7DbHf0TtGXHZgY0MpCpCLGsvgpsgH_fR8aGZiYfSzDHOAMp24X5_W_b0uIIfWoJuYHoTne7UwdQPP8rptwHpDvnrCz2nqx37wxVnJHuSO0Na4DbTjYf9HuxpX3AWlafe7VaUoEYdPq-l4"
              />
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-border-subtle dark:border-slate-800 rounded-xl shadow-xl z-50 p-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border-subtle shrink-0">
                  <img
                    alt="User profile"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7Qk6fsUnOGWZrr6x1jXkrICj7qQZch0GPR6q02C-ag7h7qqBkpwRCkgfLldj01t-GVXAVgkm7b2QAaH3oXtCHE9UdQnvVShiu5nAeTnqzabdQ4GCMEM3s_XmWsb5wKW7DbHf0TtGXHZgY0MpCpCLGsvgpsgH_fR8aGZiYfSzDHOAMp24X5_W_b0uIIfWoJuYHoTne7UwdQPP8rptwHpDvnrCz2nqx37wxVnJHuSO0Na4DbTjYf9HuxpX3AWlafe7VaUoEYdPq-l4"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-body-md font-bold text-on-surface capitalize truncate">
                    {session?.user?.email ? session.user.email.split('@')[0] : (session?.email ? session.email.split('@')[0] : 'Consultant')}
                  </div>
                  <div className="text-label-md text-outline truncate">
                    {session?.user?.email || session?.email || 'admin@kickoff.com'}
                  </div>
                </div>
              </div>

              <div className="border-t border-border-subtle dark:border-slate-800 pt-2 space-y-1">
                <button
                  onClick={() => {
                    console.log("Clicked: Profile My Dashboard");
                    setShowProfile(false)
                    navigate('/dashboard')
                    showToast('Navigated to profile dashboard', 'success')
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg text-body-md text-on-surface font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="dashboard" size={18} className="text-outline" />
                  My Dashboard
                </button>

                <button
                  onClick={async () => {
                    console.log("Clicked: Profile Sign Out");
                    setShowProfile(false)
                    await logout()
                    showToast('Successfully signed out', 'success')
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-body-md text-status-error font-medium flex items-center gap-2 transition-colors"
                >
                  <Icon name="logout" size={18} className="text-status-error" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
