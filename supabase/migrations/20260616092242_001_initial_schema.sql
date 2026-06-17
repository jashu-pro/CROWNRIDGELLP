-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  project_name text NOT NULL,
  industry text DEFAULT 'Technology',
  project_type text,
  contract_value decimal DEFAULT 0,
  start_date date,
  end_date date,
  priority text DEFAULT 'medium',
  status text DEFAULT 'active',
  notes text,
  project_manager_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  avatar_url text,
  email text,
  capacity integer DEFAULT 100,
  status text DEFAULT 'active',
  department text,
  skills text[],
  created_at timestamptz DEFAULT now()
);

-- Tasks/Milestones table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  priority text DEFAULT 'medium',
  status text DEFAULT 'pending',
  owner_id uuid REFERENCES team_members(id),
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Communication channels table
CREATE TABLE communication_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  channel_type text NOT NULL,
  name text NOT NULL,
  description text,
  channel_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Stakeholders table
CREATE TABLE stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  organization text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Milestones table
CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_date date,
  end_date date,
  status text DEFAULT 'scheduled',
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Escalation levels table
CREATE TABLE escalation_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  level integer NOT NULL,
  severity text NOT NULL,
  description text,
  contact_name text,
  contact_role text,
  response_time text,
  created_at timestamptz DEFAULT now()
);

-- Meeting frequencies table
CREATE TABLE meeting_frequencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  frequency text,
  day_of_week text,
  time text,
  duration text,
  attendees jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_frequencies ENABLE ROW LEVEL SECURITY;

-- Create policies for projects (public for demo)
CREATE POLICY "select_projects" ON projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_projects" ON projects FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_projects" ON projects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_projects" ON projects FOR DELETE TO anon, authenticated USING (true);

-- Create policies for team_members
CREATE POLICY "select_team_members" ON team_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_team_members" ON team_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_team_members" ON team_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_team_members" ON team_members FOR DELETE TO anon, authenticated USING (true);

-- Create policies for tasks
CREATE POLICY "select_tasks" ON tasks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_tasks" ON tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_tasks" ON tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_tasks" ON tasks FOR DELETE TO anon, authenticated USING (true);

-- Create policies for communication_channels
CREATE POLICY "select_communication_channels" ON communication_channels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_communication_channels" ON communication_channels FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_communication_channels" ON communication_channels FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_communication_channels" ON communication_channels FOR DELETE TO anon, authenticated USING (true);

-- Create policies for stakeholders
CREATE POLICY "select_stakeholders" ON stakeholders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_stakeholders" ON stakeholders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_stakeholders" ON stakeholders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_stakeholders" ON stakeholders FOR DELETE TO anon, authenticated USING (true);

-- Create policies for milestones
CREATE POLICY "select_milestones" ON milestones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_milestones" ON milestones FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_milestones" ON milestones FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_milestones" ON milestones FOR DELETE TO anon, authenticated USING (true);

-- Create policies for escalation_levels
CREATE POLICY "select_escalation_levels" ON escalation_levels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_escalation_levels" ON escalation_levels FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_escalation_levels" ON escalation_levels FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_escalation_levels" ON escalation_levels FOR DELETE TO anon, authenticated USING (true);

-- Create policies for meeting_frequencies
CREATE POLICY "select_meeting_frequencies" ON meeting_frequencies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_meeting_frequencies" ON meeting_frequencies FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_meeting_frequencies" ON meeting_frequencies FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_meeting_frequencies" ON meeting_frequencies FOR DELETE TO anon, authenticated USING (true);

-- Integrations/credentials table
CREATE TABLE integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  service text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  last_used text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_integrations" ON integrations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_integrations" ON integrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_integrations" ON integrations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_integrations" ON integrations FOR DELETE TO anon, authenticated USING (true);