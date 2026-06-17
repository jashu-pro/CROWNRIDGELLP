import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import { useProject } from '../context/ProjectContext'

interface TopNavbarProps {
  title?: string
  activeTab?: 'dashboard' | 'projects'
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ title, activeTab = 'projects' }) => {
  const { projects, projectId, setProjectId } = useProject()

  return (
    <header className="h-16 bg-surface border-b border-border-subtle shadow-sm flex justify-between items-center px-container-padding-desktop sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-headline-sm font-headline-sm font-bold text-primary">{title || 'KickoffGen'}</span>
          {projects.length > 0 && (
            <select
              value={projectId || ''}
              onChange={(e) => setProjectId(e.target.value)}
              className="bg-surface-container-low border border-border-subtle rounded-lg px-2.5 py-1 font-label-md text-label-md text-on-surface focus:ring-1 focus:ring-primary transition-all max-w-[200px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          )}
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Link
            to="/dashboard"
            className={`font-body-md text-body-md transition-colors ${
              activeTab === 'dashboard'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/management"
            className={`font-body-md text-body-md ${
              activeTab === 'projects'
                ? 'text-primary font-bold border-b-2 border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Projects
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-surface-muted transition-colors rounded-full">
          <Icon name="notifications" size={24} />
        </button>
        <button className="p-2 text-on-surface-variant hover:bg-surface-muted transition-colors rounded-full">
          <Icon name="settings" size={24} />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle ml-2">
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7Qk6fsUnOGWZrr6x1jXkrICj7qQZch0GPR6q02C-ag7h7qqBkpwRCkgfLldj01t-GVXAVgkm7b2QAaH3oXtCHE9UdQnvVShiu5nAeTnqzabdQ4GCMEM3s_XmWsb5wKW7DbHf0TtGXHZgY0MpCpCLGsvgpsgH_fR8aGZiYfSzDHOAMp24X5_W_b0uIIfWoJuYHoTne7UwdQPP8rptwHpDvnrCz2nqx37wxVnJHuSO0Na4DbTjYf9HuxpX3AWlafe7VaUoEYdPq-l4"
          />
        </div>
      </div>
    </header>
  )
}
