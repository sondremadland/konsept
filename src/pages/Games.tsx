import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, Settings, LogOut } from "lucide-react";
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
import MobileLayout from "@/components/MobileLayout";

const db = supabase as any;

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

const Games = () => {
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

    setUser(session.user);
    
    const { data: roleData } = await db
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
    const { data, error } = await db
      .from("user_games")
      .select("*, concepts(name)")
      .order("created_at", { ascending: false });

    if (!error) {
      setGames(data || []);
    }
  };

  const fetchConcepts = async () => {
    const { data, error } = await db
      .from("concepts")
      .select("id, name")
      .eq("active", true);

    if (!error) {
      setConcepts(data || []);
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await db
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
      if (data) navigate(`/game/${data.id}`);
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
    <MobileLayout>
      <div className="bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold">Mine Konsept</h1>
            <div className="flex gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="hidden md:flex">
                  <Link to="/admin">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden md:flex">
                <LogOut className="mr-2 h-4 w-4" />
                Logg ut
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:ml-64">
          <div className="mb-6">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full md:w-auto">
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
                      placeholder="F.eks. 'Fredagsgjengen'"
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <Card key={game.id} className="shadow-card hover:shadow-glow transition-all">
                  <CardHeader>
                    <CardTitle className="text-lg">{game.group_name}</CardTitle>
                    <CardDescription>{game.concepts.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {new Date(game.created_at).toLocaleDateString("nb-NO")}
                    </p>
                    <Button asChild className="w-full">
                      <Link to={`/game/${game.id}`}>
                        <Play className="mr-2 h-4 w-4" />
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
    </MobileLayout>
  );
};

export default Games;
