import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Gamepad2, Users, TrendingUp } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";

const db = supabase as any;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalParticipants: 0,
    recentGames: [] as any[],
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (!onboardingCompleted) {
      navigate("/onboarding");
      return;
    }

    setUser(session.user);
    fetchStats(session.user.id);
  };

  const fetchStats = async (userId: string) => {
    const { data: games } = await db
      .from("user_games")
      .select("*, concepts(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3);

    let totalParticipants = 0;
    if (games) {
      for (const game of games) {
        const { count } = await db
          .from("participants")
          .select("*", { count: "exact", head: true })
          .eq("game_id", game.id);
        totalParticipants += count || 0;
      }
    }

    setStats({
      totalGames: games?.length || 0,
      totalParticipants,
      recentGames: games || [],
    });
  };

  return (
    <MobileLayout>
      <div className="bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Velkommen tilbake! 👋
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:ml-64">
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Totalt spill</CardTitle>
                <Gamepad2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalGames}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Deltakere</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalParticipants}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Aktivitet</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <span className="text-green-500">↑</span> {stats.totalGames}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Siste spill</h2>
            {stats.recentGames.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-8 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Ingen spill ennå. Start et nytt spill! 🎮
                  </p>
                  <Button asChild>
                    <Link to="/games">Opprett spill</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {stats.recentGames.map((game: any) => (
                  <Card key={game.id} className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-lg">{game.group_name}</CardTitle>
                      <CardDescription>{game.concepts?.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <Link to={`/game/${game.id}`}>Åpne spill</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Hurtighandlinger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/games">
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Mine Konsept
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/leaderboard">
                    <Trophy className="mr-2 h-4 w-4" />
                    Se Poengtavle
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Dashboard;