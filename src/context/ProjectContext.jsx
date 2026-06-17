import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { db } from '../lib/db'

const ProjectContext = createContext(undefined)

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [projectId, setProjectIdState] = useState(localStorage.getItem('ko_active_project_id'))
  const [project, setProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  // Check Auth Session
  const checkSession = useCallback(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session: s } }) => {
        setSession(s)
      })
    } else {
      const mockSession = localStorage.getItem('ko_mock_session')
      setSession(mockSession ? JSON.parse(mockSession) : null)
    }
  }, [])

  useEffect(() => {
    checkSession()
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
        setSession(s)
      })
      return () => {
        subscription.unsubscribe()
      }
    }
  }, [checkSession])

  // Logout Handler
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem('ko_mock_session')
      setSession(null)
    }
  }

  // Load Projects
  const refreshProjects = useCallback(async () => {
    if (!session) {
      setProjects([])
      setProject(null)
      setLoading(false)
      return
    }

    try {
      const list = await db.projects.list()
      setProjects(list)

      let activeId = projectId
      if (!activeId && list.length > 0) {
        activeId = list[0].id
        setProjectIdState(activeId)
        localStorage.setItem('ko_active_project_id', activeId)
      }

      if (activeId) {
        const p = list.find((item) => item.id === activeId)
        setProject(p || null)
      } else {
        setProject(null)
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId, session])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  // Set selected project ID
  const setProjectId = (id) => {
    setProjectIdState(id)
    localStorage.setItem('ko_active_project_id', id)
    const p = projects.find((item) => item.id === id)
    setProject(p || null)
  }

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        setProjectId,
        project,
        projects,
        loading,
        refreshProjects,
        session,
        logout,
        checkSession
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
