import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Trophy, Users, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import concept1 from "@/assets/concept-1.jpg";
import concept2 from "@/assets/concept-2.jpg";
import concept3 from "@/assets/concept-3.jpg";

interface Concept {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
}

const conceptImages: Record<string, string> = {
  "Turneringskveld": concept1,
  "Konkurranseløp": concept2,
  "Utfordringsbonanza": concept3,
};

const Index = () => {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Fetch concepts
    fetchConcepts();

    return () => subscription.unsubscribe();
  }, []);

  const fetchConcepts = async () => {
    const { data, error } = await supabase
      .from("concepts")
      .select("*")
      .eq("active", true)
      .order("price");
    
    if (error) {
      console.error("Error fetching concepts:", error);
    } else {
      setConcepts(data || []);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-hero bg-clip-text text-transparent">VenneSpill</span>
          </Link>
          <nav className="flex gap-4 items-center">
            {user ? (
              <>
                <Button asChild variant="ghost">
                  <Link to="/dashboard">Mine Spill</Link>
                </Button>
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Logg inn</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Hvem er gjengens mester? 🏆
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Sosiale konkurranser og utfordringer som gjør vennekveldene episke! 
                Kjøp et konsept, samle gjengen og start moroa.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
                  <a href="#concepts">Se konsepter</a>
                </Button>
                {!user && (
                  <Button size="lg" variant="outline" asChild className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    <Link to="/auth">Kom i gang</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-glow">
              <img src={heroImage} alt="Venner som har det gøy" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-hero flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Enkelt å sette opp</h3>
              <p className="text-muted-foreground">
                Velg et konsept, registrer deltakere og start konkurransene i løpet av minutter
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-accent flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Live poengtavle</h3>
              <p className="text-muted-foreground">
                Følg med på hvem som leder i sanntid. Spenningen er garantert!
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">For alle vennegjenger</h3>
              <p className="text-muted-foreground">
                Fra 4 til 20+ personer. Perfekt for både små og store grupper
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Concepts */}
      <section id="concepts" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Våre konsepter 🎯</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Velg mellom forskjellige konkurransepakker tilpasset din vennegjeng
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {concepts.map((concept) => (
              <Card key={concept.id} className="shadow-card hover:shadow-glow transition-all duration-300 border-2">
                <div className="aspect-square overflow-hidden rounded-t-xl">
                  <img 
                    src={conceptImages[concept.name] || concept1} 
                    alt={concept.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{concept.name}</CardTitle>
                  <CardDescription>{concept.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
                    {concept.price} kr
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" size="lg">
                    <Link to={`/concept/${concept.id}`}>
                      Sjekk ut <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Klar til å finne gjengens mester? 🎉</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Bli med tusenvis av vennegjenger som har funnet sin nye favorittaktivitet!
          </p>
          <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
            <Link to={user ? "/dashboard" : "/auth"}>
              {user ? "Gå til dashboard" : "Kom i gang gratis"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 VenneSpill - Norges morsomste konkurranser for vennegjenger 🇳🇴</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;