import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check, X, ArrowLeft } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";

const db = supabase as any;

interface Invitation {
  id: string;
  game_id: string;
  status: string;
  created_at: string;
  user_games: {
    group_name: string;
    concepts: {
      name: string;
    };
  };
  inviter: {
    display_name: string;
    email: string;
  };
}

const Invitations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setCurrentUserEmail(session.user.email || "");
    fetchInvitations(session.user.email || "");
  };

  const fetchInvitations = async (email: string) => {
    const { data } = await db
      .from("game_invitations")
      .select(`
        *,
        user_games!inner(group_name, concepts!inner(name)),
        inviter:inviter_id(display_name:user_profiles!inner(display_name, email))
      `)
      .eq("invitee_email", email)
      .order("created_at", { ascending: false });

    const formattedData = data?.map((inv: any) => ({
      id: inv.id,
      game_id: inv.game_id,
      status: inv.status,
      created_at: inv.created_at,
      user_games: {
        group_name: inv.user_games.group_name,
        concepts: {
          name: inv.user_games.concepts.name
        }
      },
      inviter: {
        display_name: inv.inviter?.display_name?.[0]?.display_name || "Ukjent",
        email: inv.inviter?.display_name?.[0]?.email || ""
      }
    })) || [];

    setInvitations(formattedData);
    setLoading(false);
  };

  const handleAcceptInvitation = async (invitationId: string, gameId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error: updateError } = await db
      .from("game_invitations")
      .update({
        status: "accepted",
        invitee_id: session.user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", invitationId);

    if (updateError) {
      toast({ title: "Feil", description: updateError.message, variant: "destructive" });
      return;
    }

    const { data: profile } = await db
      .from("user_profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .single();

    const { error: participantError } = await db
      .from("participants")
      .insert({
        game_id: gameId,
        user_id: session.user.id,
        name: profile?.display_name || session.user.email?.split("@")[0] || "Ukjent"
      });

    if (participantError) {
      toast({ title: "Feil", description: participantError.message, variant: "destructive" });
    } else {
      toast({ title: "Invitasjon akseptert! 🎉", description: "Du er nå med i spillet" });
      fetchInvitations(currentUserEmail);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    const { error } = await db
      .from("game_invitations")
      .update({
        status: "rejected",
        updated_at: new Date().toISOString()
      })
      .eq("id", invitationId);

    if (error) {
      toast({ title: "Feil", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invitasjon avslått" });
      fetchInvitations(currentUserEmail);
    }
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Laster invitasjoner...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
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

        <div className="container mx-auto px-4 py-12 md:ml-64">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Mine invitasjoner 📧</h1>
              <p className="text-muted-foreground">
                Se og behandle invitasjoner til spill
              </p>
            </div>

            <div className="space-y-4">
              {invitations.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="py-12 text-center">
                    <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Du har ingen invitasjoner
                    </p>
                    <Button asChild>
                      <Link to="/dashboard">Tilbake til dashboard</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                invitations.map((invitation) => (
                  <Card key={invitation.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{invitation.user_games.group_name}</CardTitle>
                          <CardDescription>
                            {invitation.user_games.concepts.name}
                          </CardDescription>
                          <p className="text-sm text-muted-foreground mt-2">
                            Fra: {invitation.inviter.display_name}
                          </p>
                        </div>
                        <Badge
                          variant={
                            invitation.status === "accepted"
                              ? "default"
                              : invitation.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {invitation.status === "pending" && "Avventer"}
                          {invitation.status === "accepted" && "Akseptert"}
                          {invitation.status === "rejected" && "Avslått"}
                        </Badge>
                      </div>
                    </CardHeader>
                    {invitation.status === "pending" && (
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptInvitation(invitation.id, invitation.game_id)}
                            className="flex-1"
                          >
                            <Check className="mr-2 h-5 w-5" />
                            Aksepter
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRejectInvitation(invitation.id)}
                            className="flex-1"
                          >
                            <X className="mr-2 h-5 w-5" />
                            Avslå
                          </Button>
                        </div>
                      </CardContent>
                    )}
                    {invitation.status === "accepted" && (
                      <CardContent>
                        <Button asChild className="w-full">
                          <Link to={`/game/${invitation.game_id}`}>
                            Åpne spill
                          </Link>
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Invitations;
