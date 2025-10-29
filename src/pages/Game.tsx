import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Temporary type workaround until Supabase types are regenerated
const db = supabase as any;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trophy, Target, ChevronDown, ChevronUp, UserPlus, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Participant {
  id: string;
  name: string;
  total_points: number;
}

interface Round {
  id: string;
  round_number: number;
  round_name: string | null;
  created_at: string;
}

interface Score {
  id: string;
  round_id: string;
  participant_id: string;
  points: number;
}

interface ParticipantWithRoundScores extends Participant {
  roundScores: Record<string, number>;
}

const Game = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [game, setGame] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantsWithScores, setParticipantsWithScores] = useState<ParticipantWithRoundScores[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [allScores, setAllScores] = useState<Score[]>([]);
  const [newParticipant, setNewParticipant] = useState("");
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [roundDialogOpen, setRoundDialogOpen] = useState(false);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [expandedRounds, setExpandedRounds] = useState<Set<string>>(new Set());
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [editingRoundName, setEditingRoundName] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchGame();
    fetchParticipants();
    fetchRounds();
    fetchScores();

    const channel = supabase
      .channel(`game-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `game_id=eq.${id}`
        },
        () => {
          fetchParticipants();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scores'
        },
        () => {
          fetchParticipants();
          fetchScores();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rounds',
          filter: `game_id=eq.${id}`
        },
        () => {
          fetchRounds();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    if (participants.length > 0 && rounds.length > 0) {
      combineParticipantsWithScores();
    }
  }, [participants, rounds, allScores]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/auth");
    else setCurrentUserId(session.user.id);
  };

  const fetchGame = async () => {
    const { data } = await db
      .from("user_games")
      .select("*, concepts(name)")
      .eq("id", id)
      .single();
    setGame(data);
    setLoading(false);
  };

  const fetchParticipants = async () => {
    const { data } = await db
      .from("participants")
      .select("*")
      .eq("game_id", id)
      .order("total_points", { ascending: false });
    setParticipants(data || []);
  };

  const fetchRounds = async () => {
    const { data } = await db
      .from("rounds")
      .select("*")
      .eq("game_id", id)
      .order("round_number", { ascending: true });
    setRounds(data || []);
  };

  const fetchScores = async () => {
    const { data } = await db
      .from("scores")
      .select("*, rounds!inner(game_id)")
      .eq("rounds.game_id", id);
    setAllScores(data || []);
  };

  const combineParticipantsWithScores = () => {
    const participantsWithRoundScores: ParticipantWithRoundScores[] = participants.map(participant => {
      const roundScores: Record<string, number> = {};

      rounds.forEach(round => {
        const scoreForRound = allScores.find(
          score => score.participant_id === participant.id && score.round_id === round.id
        );
        roundScores[round.id] = scoreForRound ? scoreForRound.points : 0;
      });

      return {
        ...participant,
        roundScores
      };
    });

    participantsWithRoundScores.sort((a, b) => b.total_points - a.total_points);
    setParticipantsWithScores(participantsWithRoundScores);
  };

  const toggleRoundExpanded = (roundId: string) => {
    setExpandedRounds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roundId)) {
        newSet.delete(roundId);
      } else {
        newSet.add(roundId);
      }
      return newSet;
    });
  };

  const getRoundScores = (roundId: string) => {
    return participantsWithScores.map(p => ({
      name: p.name,
      points: p.roundScores[roundId] || 0
    })).sort((a, b) => b.points - a.points);
  };

  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    const { data } = await db
      .from("user_profiles")
      .select("*")
      .ilike("email", `%${searchEmail}%`)
      .limit(5);

    setSearchResults(data || []);
  };

  const handleInviteUser = async (userId: string, email: string) => {
    const { error } = await db.from("game_invitations").insert({
      game_id: id,
      inviter_id: currentUserId,
      invitee_email: email,
      invitee_id: userId,
      status: "pending"
    });

    if (error) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invitasjon sendt! 📧", description: `${email} har fått invitasjon` });
      setSearchEmail("");
      setSearchResults([]);
      setInviteDialogOpen(false);
    }
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
      setParticipantDialogOpen(false);
    }
  };

  const handleCreateRound = async () => {
    if (participants.length === 0) {
      toast({ 
        title: "Ingen deltakere", 
        description: "Legg til deltakere før du oppretter runder",
        variant: "destructive" 
      });
      return;
    }

    const nextRoundNumber = rounds.length + 1;
    const { data, error } = await db
      .from("rounds")
      .insert({ game_id: id, round_number: nextRoundNumber })
      .select()
      .single();

    if (error) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Runde ${nextRoundNumber} opprettet! 🎯` });
      setRoundDialogOpen(false);
      fetchRounds();
    }
  };

  const handleOpenScoreDialog = async (round: Round) => {
    setSelectedRound(round);
    const initialScores: Record<string, number> = {};

    const { data: existingScores } = await db
      .from("scores")
      .select("*")
      .eq("round_id", round.id);

    participants.forEach(p => {
      const existingScore = existingScores?.find((s: Score) => s.participant_id === p.id);
      initialScores[p.id] = existingScore ? existingScore.points : 0;
    });

    setScores(initialScores);
    setScoreDialogOpen(true);
  };

  const handleSubmitScores = async () => {
    if (!selectedRound) return;

    await db
      .from("scores")
      .delete()
      .eq("round_id", selectedRound.id);

    const scoreInserts = Object.entries(scores).map(([participantId, points]) => ({
      round_id: selectedRound.id,
      participant_id: participantId,
      points: points || 0,
    }));

    const { error } = await db.from("scores").insert(scoreInserts);

    if (error) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Poeng registrert! ✨", description: "Poengtavlen er oppdatert" });
      setScoreDialogOpen(false);
      setSelectedRound(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laster spill...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">Spillet ble ikke funnet</p>
            <Button asChild>
              <Link to="/dashboard">Tilbake til dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">{game.group_name} 🎮</h1>
            <p className="text-muted-foreground">{game.concepts.name}</p>
          </div>

          <Tabs defaultValue="leaderboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="leaderboard">Poengtavle</TabsTrigger>
              <TabsTrigger value="rounds">Runder</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Live Poengtavle 🏆</h2>
                <div className="flex gap-2">
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Inviter bruker
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inviter bruker til spillet</DialogTitle>
                        <DialogDescription>
                          Søk etter brukere ved e-post og send dem invitasjon
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            placeholder="Søk etter e-post..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                          />
                          <Button onClick={handleSearchUsers}>
                            <Search className="h-5 w-5" />
                          </Button>
                        </div>
                        {searchResults.length > 0 && (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {searchResults.map((user) => (
                              <Card key={user.id}>
                                <CardContent className="py-3 flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{user.display_name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleInviteUser(user.id, user.email)}
                                  >
                                    Inviter
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
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
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Plass</TableHead>
                            <TableHead>Navn</TableHead>
                            {rounds.map((round) => (
                              <TableHead key={round.id} className="text-center">
                                {round.round_name || `R${round.round_number}`}
                              </TableHead>
                            ))}
                            <TableHead className="text-right font-bold">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {participantsWithScores.map((participant, index) => (
                            <TableRow key={participant.id} className="animate-fade-in">
                              <TableCell className="font-bold">
                                {index === 0 && <Trophy className="inline mr-1 h-5 w-5 text-yellow-500 animate-pulse" />}
                                #{index + 1}
                              </TableCell>
                              <TableCell className="font-medium">{participant.name}</TableCell>
                              {rounds.map((round) => (
                                <TableCell key={round.id} className="text-center">
                                  {participant.roundScores[round.id] || 0}
                                </TableCell>
                              ))}
                              <TableCell className="text-right font-bold text-lg text-primary">
                                {participant.total_points}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rounds" className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Runder 🎯</h2>
                <Button onClick={handleCreateRound}>
                  <Plus className="mr-2 h-5 w-5" />
                  Ny runde
                </Button>
              </div>

              <div className="grid gap-4">
                {rounds.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        Ingen runder ennå. Opprett den første runden for å starte! 🚀
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  rounds.map((round) => (
                    <Card key={round.id} className="shadow-card">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRoundExpanded(round.id)}
                            >
                              {expandedRounds.has(round.id) ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </Button>
                            {editingRoundId === round.id ? (
                              <div className="flex gap-2">
                                <Input
                                  value={editingRoundName}
                                  onChange={(e) => setEditingRoundName(e.target.value)}
                                  placeholder="Rundenavn"
                                  className="w-48"
                                />
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    await db
                                      .from("rounds")
                                      .update({ round_name: editingRoundName })
                                      .eq("id", round.id);
                                    setEditingRoundId(null);
                                    fetchRounds();
                                    toast({ title: "Rundenavn oppdatert! ✨" });
                                  }}
                                >
                                  Lagre
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingRoundId(null)}
                                >
                                  Avbryt
                                </Button>
                              </div>
                            ) : (
                              <CardTitle
                                onClick={() => {
                                  setEditingRoundId(round.id);
                                  setEditingRoundName(round.round_name || `Runde ${round.round_number}`);
                                }}
                                className="cursor-pointer hover:text-primary transition-colors"
                              >
                                {round.round_name || `Runde ${round.round_number}`}
                              </CardTitle>
                            )}
                          </div>
                          <Button onClick={() => handleOpenScoreDialog(round)}>
                            <Target className="mr-2 h-5 w-5" />
                            Registrer poeng
                          </Button>
                        </div>
                      </CardHeader>
                      {expandedRounds.has(round.id) && (
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Deltaker</TableHead>
                                <TableHead className="text-right">Poeng</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getRoundScores(round.id).map((score, index) => (
                                <TableRow key={index}>
                                  <TableCell>{score.name}</TableCell>
                                  <TableCell className="text-right font-bold">
                                    {score.points}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Score Input Dialog */}
          <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrer poeng - {selectedRound?.round_name || `Runde ${selectedRound?.round_number}`}</DialogTitle>
                <DialogDescription>
                  Skriv inn poengene for hver deltaker i denne runden
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-4">
                    <Label className="w-1/2">{participant.name}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={scores[participant.id] || 0}
                      onChange={(e) =>
                        setScores({ ...scores, [participant.id]: parseInt(e.target.value) || 0 })
                      }
                      placeholder="Poeng"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSubmitScores} className="w-full" size="lg">
                Lagre poeng
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default Game;