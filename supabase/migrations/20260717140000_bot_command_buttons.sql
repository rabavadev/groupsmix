-- Allow each custom bot command to optionally include inline keyboard buttons.
ALTER TABLE public.bot_commands
  ADD COLUMN buttons jsonb DEFAULT '[]'::jsonb NOT NULL;

-- Ensure buttons is always a JSON array of { label, url } objects.
ALTER TABLE public.bot_commands
  ADD CONSTRAINT bot_commands_buttons_array
  CHECK (jsonb_typeof(buttons) = 'array');
