-- Add an explicit cancellation flag so a sending broadcast can be stopped
-- mid-batch by the dashboard, and the cron processor can bail out early.
ALTER TABLE public.broadcasts
  ADD COLUMN is_cancelled boolean DEFAULT false NOT NULL;
