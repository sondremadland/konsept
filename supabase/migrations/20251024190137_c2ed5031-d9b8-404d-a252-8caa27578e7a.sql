-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create concepts table (competition packages)
CREATE TABLE public.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on concepts
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;

-- Policies for concepts
CREATE POLICY "Anyone can view active concepts"
  ON public.concepts FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage concepts"
  ON public.concepts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create user_games table (active game sessions)
CREATE TABLE public.user_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE NOT NULL,
  group_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on user_games
ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

-- Policies for user_games
CREATE POLICY "Users can view their own games"
  ON public.user_games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create games"
  ON public.user_games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON public.user_games FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
  ON public.user_games FOR DELETE
  USING (auth.uid() = user_id);

-- Create participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.user_games(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on participants
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Policies for participants
CREATE POLICY "Users can view participants in their games"
  ON public.participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE user_games.id = participants.game_id
      AND user_games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage participants in their games"
  ON public.participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE user_games.id = participants.game_id
      AND user_games.user_id = auth.uid()
    )
  );

-- Create rounds table
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.user_games(id) ON DELETE CASCADE NOT NULL,
  round_number INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on rounds
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Policies for rounds
CREATE POLICY "Users can view rounds in their games"
  ON public.rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE user_games.id = rounds.game_id
      AND user_games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage rounds in their games"
  ON public.rounds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE user_games.id = rounds.game_id
      AND user_games.user_id = auth.uid()
    )
  );

-- Create scores table
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on scores
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Policies for scores
CREATE POLICY "Users can view scores in their games"
  ON public.scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rounds
      JOIN public.user_games ON user_games.id = rounds.game_id
      WHERE rounds.id = scores.round_id
      AND user_games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage scores in their games"
  ON public.scores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rounds
      JOIN public.user_games ON user_games.id = rounds.game_id
      WHERE rounds.id = scores.round_id
      AND user_games.user_id = auth.uid()
    )
  );

-- Function to update participant total_points
CREATE OR REPLACE FUNCTION public.update_participant_total_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.participants
  SET total_points = (
    SELECT COALESCE(SUM(s.points), 0)
    FROM public.scores s
    JOIN public.rounds r ON r.id = s.round_id
    WHERE s.participant_id = NEW.participant_id
  )
  WHERE id = NEW.participant_id;
  RETURN NEW;
END;
$$;

-- Trigger to update total_points when scores change
CREATE TRIGGER update_participant_points_on_score_change
AFTER INSERT OR UPDATE OR DELETE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.update_participant_total_points();

-- Insert some sample concepts
INSERT INTO public.concepts (name, description, price, image_url) VALUES
('Turneringskveld', 'En full kveld med konkurranser for 4-8 personer. Inkluderer quiz, utfordringer og morsomme oppgaver!', 299.00, null),
('Konkurranseløp', 'Et spennende konkurranseløp over flere dager med poenggiving. Perfekt for vennegrupper som vil ha langvarig moro!', 499.00, null),
('Utfordringsbonanza', 'Den ultimate pakken! Over 20 forskjellige utfordringer og konkurranser for maksimal moro.', 699.00, null);