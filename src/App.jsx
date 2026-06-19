import { Routes, Route, Navigate } from 'react-router-dom'
import { ProjectCreation } from './pages/ProjectCreation'
import { Communication } from './pages/Communication'
import { Milestones } from './pages/Milestones'
import { Preview } from './pages/Preview'
import { Timeline } from './pages/Timeline'
import { Dashboard } from './pages/Dashboard'
import { Credentials } from './pages/Credentials'
import { Team } from './pages/Team'
import { Management } from './pages/Management'
import { Login } from './pages/Login'
import { Layout } from './components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/projects/new" element={<ProjectCreation />} />
      <Route path="/projects" element={<Management />} />
      <Route path="/credentials" element={<Credentials />} />
      <Route path="/communication" element={<Communication />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/team" element={<Team />} />
      <Route path="/tasks" element={<Milestones />} />
      <Route path="/milestones" element={<Milestones />} />
      <Route path="/preview" element={<Preview />} />
      <Route path="/management" element={<Management />} />
      <Route path="/help" element={
        <Layout>
          <div className="max-w-4xl mx-auto">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Help Center</h2>
            <p className="text-body-lg text-on-surface-variant">
              Welcome to the KickoffGen Help Center. Here you can find documentation, tutorials, and support resources.
            </p>
          </div>
        </Layout>
      } />
    </Routes>
  )
}

export default App
