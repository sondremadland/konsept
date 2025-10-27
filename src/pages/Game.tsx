import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Temporary type workaround until Supabase types are regenerated
const db = supabase as any;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trophy } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Participant {
  id: string;
  name: string;
  total_points: number;
}

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [game, setGame] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipant, setNewParticipant] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchGame();
    fetchParticipants();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/auth");
  };

  const fetchGame = async () => {
    const { data } = await db
      .from("user_games")
      .select("*, concepts(name)")
      .eq("id", id)
      .single();
    setGame(data);
  };

  const fetchParticipants = async () => {
    const { data } = await db
      .from("participants")
      .select("*")
      .eq("game_id", id)
      .order("total_points", { ascending: false });
    setParticipants(data || []);
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await db.from("participants").insert({
      game_id: id,
      name: newParticipant,
    });

    if (error) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deltaker lagt til! 🎉" });
      setNewParticipant("");
      setDialogOpen(false);
      fetchParticipants();
    }
  };

  if (!game) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Tilbake til dashboard
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{game.group_name} 🎮</h1>
            <p className="text-muted-foreground">{game.concepts.name}</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Poengtavle 🏆</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-5 w-5" />
                  Legg til deltaker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Legg til deltaker</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddParticipant} className="space-y-4">
                  <div>
                    <Label>Navn</Label>
                    <Input
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      placeholder="Navn på deltaker"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Legg til</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Rangeringer</CardTitle>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Ingen deltakere ennå. Legg til deltakere for å starte! 🚀
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Plass</TableHead>
                      <TableHead>Navn</TableHead>
                      <TableHead className="text-right">Poeng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant, index) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-bold">
                          {index === 0 && <Trophy className="inline mr-1 h-5 w-5 text-yellow-500" />}
                          #{index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{participant.name}</TableCell>
                        <TableCell className="text-right font-bold">{participant.total_points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Game;