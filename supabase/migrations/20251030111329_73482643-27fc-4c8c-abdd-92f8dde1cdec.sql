-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create game_invitations table
CREATE TABLE IF NOT EXISTS public.game_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.user_games(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  invitee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_invitations
CREATE POLICY "Users can view invitations they sent"
  ON public.game_invitations
  FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can view invitations sent to them"
  ON public.game_invitations
  FOR SELECT
  USING (
    auth.uid() = invitee_id OR 
    (SELECT email FROM auth.users WHERE id = auth.uid()) = invitee_email
  );

CREATE POLICY "Users can create invitations for their games"
  ON public.game_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE id = game_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invitations sent to them"
  ON public.game_invitations
  FOR UPDATE
  USING (
    auth.uid() = invitee_id OR 
    (SELECT email FROM auth.users WHERE id = auth.uid()) = invitee_email
  );

-- Add user_id to participants table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'participants' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.participants ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_game_invitations_invitee_email ON public.game_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_game_invitations_game_id ON public.game_invitations(game_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);