import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Mail, Calendar, Shield } from "lucide-react";
import MobileLayout from "@/components/MobileLayout";
import { useToast } from "@/hooks/use-toast";

const db = supabase as any;

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameCount, setGameCount] = useState(0);

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

    const { data: games } = await db
      .from("user_games")
      .select("id")
      .eq("user_id", session.user.id);
    
    setGameCount(games?.length || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logget ut",
      description: "Du er nå logget ut av VenneSpill",
    });
    navigate("/");
  };

  return (
    <MobileLayout>
      <div className="bg-background min-h-screen">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-xl md:text-2xl font-bold">Min Profil</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 md:ml-64">
          <div className="max-w-2xl space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Kontoinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">E-post</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Medlem siden</p>
                    <p className="font-medium">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString("nb-NO")
                        : "Ukjent"}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rolle</p>
                      <p className="font-medium text-primary">Administrator</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Statistikk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{gameCount}</p>
                    <p className="text-sm text-muted-foreground mt-1">Aktive spill</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold text-primary">0</p>
                    <p className="text-sm text-muted-foreground mt-1">Kjøpte konsept</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="pt-6">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logg ut
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
