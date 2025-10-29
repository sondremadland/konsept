import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smartphone, Monitor, Download } from "lucide-react";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

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

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <Download className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Installer Konsept 📱</h1>
          <p className="text-muted-foreground text-lg">
            Få raskere tilgang og bruk appen offline ved å installere den på enheten din
          </p>
        </div>

        {isInstallable && (
          <Card className="mb-8 shadow-glow animate-scale-in">
            <CardHeader>
              <CardTitle>Klar for installasjon! 🎉</CardTitle>
              <CardDescription>
                Du kan installere Konsept direkte på enheten din nå
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleInstallClick} size="lg" className="w-full">
                <Download className="mr-2 h-5 w-5" />
                Installer app
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-primary" />
                <CardTitle>iPhone / iPad (iOS)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Åpne Konsept i Safari-nettleseren</li>
                <li>Trykk på Del-ikonet (firkant med pil opp) nederst</li>
                <li>Scroll ned og velg "Legg til på Hjem-skjerm"</li>
                <li>Trykk "Legg til" i øvre høyre hjørne</li>
                <li>Appen vises nå på hjemskjermen din! 🎉</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-primary" />
                <CardTitle>Android</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Åpne Konsept i Chrome</li>
                <li>Trykk på menyikonet (tre prikker) øverst til høyre</li>
                <li>Velg "Installer app" eller "Legg til på startskjerm"</li>
                <li>Bekreft installasjonen</li>
                <li>Appen er nå installert på enheten din! 🎉</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Monitor className="h-8 w-8 text-primary" />
                <CardTitle>PC / Mac (Desktop)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Åpne Konsept i Chrome, Edge, eller Safari</li>
                <li>Se etter et installasjonsikon i adresselinjen (pluss-ikon eller nedlastingsikon)</li>
                <li>Klikk på ikonet og velg "Installer"</li>
                <li>Appen åpnes nå som et eget vindu! 🎉</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-muted/50">
            <CardHeader>
              <CardTitle>Fordeler med installasjon 💫</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Raskere oppstart - åpne appen direkte fra hjemskjermen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Fungerer offline - bruk appen selv uten internett</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Fullskjermsopplevelse - ingen nettleser-menyer i veien</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Oppdateres automatisk - får alltid nyeste versjon</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link to="/">Tilbake til forsiden</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Install;
