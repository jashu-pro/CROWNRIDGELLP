-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL, -- 'overdue', 'due_soon', 'completed', 'new_activity'
  category text NOT NULL, -- 'project', 'task', 'milestone', 'team'
  priority text NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  user_id uuid, -- Reference to auth.users if needed
  related_id uuid, -- ID of related project, task, milestone, or team member
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications (allow all operations for anon/authenticated roles for local/demo access)
DROP POLICY IF EXISTS "select_notifications" ON public.notifications;
DROP POLICY IF EXISTS "insert_notifications" ON public.notifications;
DROP POLICY IF EXISTS "update_notifications" ON public.notifications;
DROP POLICY IF EXISTS "delete_notifications" ON public.notifications;

CREATE POLICY "select_notifications" ON public.notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_notifications" ON public.notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_notifications" ON public.notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_notifications" ON public.notifications FOR DELETE TO anon, authenticated USING (true);

-- Enable Supabase Realtime for notifications table
-- (Checks if publication table lists already contain it, otherwise adds it)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    -- Try to add the table. If already exists in publication, this might fail or do nothing, so we wrap it
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION
      WHEN duplicate_object THEN
        -- Already exists in publication, do nothing
        NULL;
    END;
  END IF;
END $$;
