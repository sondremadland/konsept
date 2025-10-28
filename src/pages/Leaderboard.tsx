import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";

const db = supabase as any;

interface LeaderboardEntry {
  id: string;
  name: string;
  total_points: number;
  game_name: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    fetchLeaderboard(session.user.id);
  };

  const fetchLeaderboard = async (userId: string) => {
    try {
      const { data: games } = await db
        .from("user_games")
        .select("id, group_name")
        .eq("user_id", userId);

      if (!games || games.length === 0) {
        setLoading(false);
        return;
      }

      const allParticipants: LeaderboardEntry[] = [];

      for (const game of games) {
        const { data: participants } = await db
          .from("participants")
          .select("id, name, total_points")
          .eq("game_id", game.id)
          .order("total_points", { ascending: false });

        if (participants) {
          participants.forEach((p: any) => {
            allParticipants.push({
              ...p,
              game_name: game.group_name,
            });
          });
        }
      }

      allParticipants.sort((a, b) => b.total_points - a.total_points);
      setLeaderboard(allParticipants);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return <span className="text-muted-foreground font-bold">{index + 1}</span>;
  };

  return (
    <MobileLayout>
      <div className="bg-background min-h-screen">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl md:text-2xl font-bold">Poengtavle 🏆</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:ml-64">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Laster poengtavle...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Ingen deltakere ennå</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Start et spill og legg til deltakere for å se poengtavlen!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`shadow-card transition-all ${
                    index === 0 ? "border-2 border-primary shadow-glow" : ""
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{entry.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {entry.game_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {entry.total_points}
                      </p>
                      <p className="text-xs text-muted-foreground">poeng</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Leaderboard;
