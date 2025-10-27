/*
  # Initial VenneSpill Database Schema

  1. New Tables
    - `user_roles` - User role management (admin, user)
    - `concepts` - Competition packages available for purchase
    - `orders` - User orders with Stripe integration support
    - `user_games` - Active game sessions
    - `participants` - Game participants with scores
    - `rounds` - Game rounds
    - `scores` - Individual round scores

  2. Security
    - Enable RLS on all tables
    - Policies for user data isolation
    - Admin-only access for concepts management
    - Users can only access their own games and orders

  3. Features
    - Automatic total points calculation for participants
    - Real-time updates for leaderboards
    - Stripe payment integration fields (for future use)

  4. GDPR Compliance
    - Cascade delete on user deletion
    - No sensitive data stored
    - User data isolated via RLS
*/

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active concepts"
  ON public.concepts FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can manage concepts"
  ON public.concepts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE RESTRICT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_concept_id ON orders(concept_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);

CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

CREATE TABLE IF NOT EXISTS public.user_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE RESTRICT NOT NULL,
  group_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own games"
  ON public.user_games FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create games"
  ON public.user_games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON public.user_games FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
  ON public.user_games FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.user_games(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  total_points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in their games"
  ON public.participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE user_games.id = participants.game_id
      AND user_games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage participants in their games"
  ON public.participants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE user_games.id = participants.game_id
      AND user_games.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES public.user_games(id) ON DELETE CASCADE NOT NULL,
  round_number INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rounds in their games"
  ON public.rounds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE user_games.id = rounds.game_id
      AND user_games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage rounds in their games"
  ON public.rounds FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_games
      WHERE user_games.id = rounds.game_id
      AND user_games.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
  points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores in their games"
  ON public.scores FOR SELECT
  TO authenticated
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
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rounds
      JOIN public.user_games ON user_games.id = rounds.game_id
      WHERE rounds.id = scores.round_id
      AND user_games.user_id = auth.uid()
    )
  );

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
    WHERE s.participant_id = COALESCE(NEW.participant_id, OLD.participant_id)
  )
  WHERE id = COALESCE(NEW.participant_id, OLD.participant_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_participant_points_on_score_change
AFTER INSERT OR UPDATE OR DELETE ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.update_participant_total_points();

INSERT INTO public.concepts (name, description, price, image_url) 
VALUES
  ('Turneringskveld', 'En full kveld med konkurranser for 4-8 personer. Inkluderer quiz, utfordringer og morsomme oppgaver!', 299.00, null),
  ('Konkurranseløp', 'Et spennende konkurranseløp over flere dager med poenggiving. Perfekt for vennegrupper som vil ha langvarig moro!', 499.00, null),
  ('Utfordringsbonanza', 'Den ultimate pakken! Over 20 forskjellige utfordringer og konkurranser for maksimal moro.', 699.00, null)
ON CONFLICT DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;
