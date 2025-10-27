import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Temporary type workaround until Supabase types are regenerated
const db = supabase as any;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, User } from "lucide-react";
import concept1 from "@/assets/concept-1.jpg";
import concept2 from "@/assets/concept-2.jpg";
import concept3 from "@/assets/concept-3.jpg";

const conceptImages: Record<string, string> = {
  "Turneringskveld": concept1,
  "Konkurranseløp": concept2,
  "Utfordringsbonanza": concept3,
};

interface Concept {
  id: string;
  name: string;
  description: string;
  price: number;
}

const ConceptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [concept, setConcept] = useState<Concept | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          email: session.user.email || "",
        }));
      }
    });

    fetchConcept();
  }, [id]);

  const fetchConcept = async () => {
    const { data, error } = await db
      .from("concepts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke hente konsept",
        variant: "destructive",
      });
      navigate("/");
    } else {
      setConcept(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Du må være logget inn",
        description: "Logg inn for å bestille et konsept",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      const { error } = await db.from("orders").insert({
        user_id: user.id,
        concept_id: id,
        user_name: formData.name,
        user_email: formData.email,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Bestilling mottatt! 🎉",
        description: "Vi har mottatt din bestilling og vil kontakte deg snart.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Noe gikk galt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!concept) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Tilbake
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div>
            <div className="rounded-2xl overflow-hidden shadow-glow mb-6">
              <img
                src={conceptImages[concept.name] || concept1}
                alt={concept.name}
                className="w-full h-auto"
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{concept.name}</CardTitle>
                <CardDescription className="text-lg">
                  {concept.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold gradient-hero bg-clip-text text-transparent">
                  {concept.price} kr
                </p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Bestill dette konseptet 📧</CardTitle>
                <CardDescription>
                  Fyll ut skjemaet så kontakter vi deg snart for å fullføre bestillingen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="inline mr-2 h-4 w-4" />
                      Ditt navn
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ola Nordmann"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="inline mr-2 h-4 w-4" />
                      E-postadresse
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ola@eksempel.no"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Hva skjer nå?</strong>
                    </p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Vi mottar din forespørsel</li>
                      <li>Vi sender deg betalingsinformasjon på e-post</li>
                      <li>Du får tilgang til konseptet i ditt dashboard</li>
                      <li>Samle gjengen og start moroa! 🎉</li>
                    </ol>
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Sender bestilling..." : "Send bestilling"}
                  </Button>

                  {!user && (
                    <p className="text-sm text-center text-muted-foreground">
                      Du må være{" "}
                      <Button variant="link" asChild className="p-0 h-auto">
                        <Link to="/auth">logget inn</Link>
                      </Button>{" "}
                      for å bestille
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptDetail;