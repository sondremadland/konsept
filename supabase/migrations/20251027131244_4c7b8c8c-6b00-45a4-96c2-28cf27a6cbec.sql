-- Enable realtime for participants and scores tables for live leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scores;