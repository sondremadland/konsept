import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus, LogOut, Play, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Game {
  id: string;
  group_name: string;
  created_at: string;
  concept_id: string;
  concepts: {
    name: string;
  };
}

interface Concept {
  id: string;
  name: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGame, setNewGame] = useState({
    groupName: "",
    conceptId: "",
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

    // Check if onboarding is completed
    const onboardingCompleted = localStorage.getItem("onboarding_completed");
    if (!onboardingCompleted) {
      navigate("/onboarding");
      return;
    }

    setUser(session.user);
    
    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();
    
    setIsAdmin(!!roleData);
    
    fetchGames();
    fetchConcepts();
  };

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from("user_games")
      .select("*, concepts(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching games:", error);
    } else {
      setGames(data || []);
    }
  };

  const fetchConcepts = async () => {
    const { data, error } = await supabase
      .from("concepts")
      .select("id, name")
      .eq("active", true);

    if (error) {
      console.error("Error fetching concepts:", error);
    } else {
      setConcepts(data || []);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("user_games")
        .insert({
          user_id: user.id,
          concept_id: newGame.conceptId,
          group_name: newGame.groupName,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Spill opprettet! 🎉",
        description: "Nå kan du legge til deltakere og starte konkurransene.",
      });

      setDialogOpen(false);
      setNewGame({ groupName: "", conceptId: "" });
      navigate(`/game/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Kunne ikke opprette spill",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">VenneSpill</span>
          </Link>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" asChild>
                <Link to="/admin">
                  <Settings className="mr-2 h-5 w-5" />
                  Admin
                </Link>
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Logg ut
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Ditt Dashboard 🏆</h1>
              <p className="text-muted-foreground">
                Velkommen tilbake, {user?.email}!
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Nytt spill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start et nytt spill</DialogTitle>
                  <DialogDescription>
                    Velg konsept og gi gjengen et navn
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGame} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Gruppenavn</Label>
                    <Input
                      id="groupName"
                      placeholder="F.eks. 'Fredagsgjengen' eller 'Team Awesome'"
                      value={newGame.groupName}
                      onChange={(e) =>
                        setNewGame({ ...newGame, groupName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="concept">Velg konsept</Label>
                    <Select
                      value={newGame.conceptId}
                      onValueChange={(value) =>
                        setNewGame({ ...newGame, conceptId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Velg et konsept" />
                      </SelectTrigger>
                      <SelectContent>
                        {concepts.map((concept) => (
                          <SelectItem key={concept.id} value={concept.id}>
                            {concept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Opprett spill
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {games.length === 0 ? (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Ingen spill ennå</CardTitle>
                <CardDescription>
                  Opprett ditt første spill for å komme i gang! 🎮
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {games.map((game) => (
                <Card key={game.id} className="shadow-card hover:shadow-glow transition-all">
                  <CardHeader>
                    <CardTitle>{game.group_name}</CardTitle>
                    <CardDescription>{game.concepts.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Opprettet {new Date(game.created_at).toLocaleDateString("nb-NO")}
                    </p>
                    <Button asChild className="w-full">
                      <Link to={`/game/${game.id}`}>
                        <Play className="mr-2 h-5 w-5" />
                        Åpne spill
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;