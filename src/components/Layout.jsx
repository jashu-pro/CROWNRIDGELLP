import React from 'react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { useProject } from '../context/ProjectContext'
import { Auth } from './Auth'

export const Layout = ({ children, title, activeTab }) => {
  const { session, checkSession, loading, project } = useProject()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <Auth onSessionChange={checkSession} />
  }

  const navbarTitle = title || (project ? project.project_name : 'KickoffGen')

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <Sidebar />
      <main className="ml-60 flex flex-col min-h-screen">
        <TopNavbar title={navbarTitle} activeTab={activeTab} />
        <div className="p-margin-md flex-1">{children}</div>
      </main>
    </div>
  )
}
