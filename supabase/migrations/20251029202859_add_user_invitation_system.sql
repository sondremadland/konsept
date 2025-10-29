/*
  # Add User Invitation System

  1. New Tables
    - `game_invitations`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references user_games)
      - `inviter_id` (uuid, references auth.users)
      - `invitee_email` (text) - email of person being invited
      - `invitee_id` (uuid, references auth.users, nullable) - filled when user accepts
      - `status` (text) - pending, accepted, rejected
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `display_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `user_id` column to `participants` table to link participants to user accounts
    - Add trigger to create user_profiles on user signup

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage invitations
    - Add policies for users to view and update their own profiles
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create game_invitations table
CREATE TABLE IF NOT EXISTS game_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES user_games ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  invitee_email text NOT NULL,
  invitee_id uuid REFERENCES auth.users ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE game_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations for their games"
  ON game_invitations FOR SELECT
  TO authenticated
  USING (
    inviter_id = auth.uid() OR
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Game owners can create invitations"
  ON game_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_games
      WHERE user_games.id = game_id
      AND user_games.user_id = auth.uid()
    )
  );

CREATE POLICY "Invitees can update invitation status"
  ON game_invitations FOR UPDATE
  TO authenticated
  USING (
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Add user_id to participants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'participants' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE participants ADD COLUMN user_id uuid REFERENCES auth.users ON DELETE SET NULL;
  END IF;
END $$;

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_invitations_invitee_email ON game_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_game_invitations_status ON game_invitations(status);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);