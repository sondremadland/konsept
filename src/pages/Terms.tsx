import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

const Terms = () => {
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
        <div className="text-center mb-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Brukervilkår</h1>
          <p className="text-muted-foreground">Sist oppdatert: {new Date().toLocaleDateString("nb-NO")}</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Aksept av vilkår</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Ved å bruke Konsept godtar du disse brukervilkårene. Hvis du ikke aksepterer vilkårene, kan du ikke bruke tjenesten.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Tjenestebeskrivelse</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Konsept tilbyr digitale konkurransekonsepter for vennegjenger. Tjenesten inkluderer:
              </p>
              <ul>
                <li>Tilgang til ulike spillkonsepter</li>
                <li>Mulighet til å registrere deltakere og poeng</li>
                <li>Live poengtavler og rangering</li>
                <li>Administrasjon av spill og deltakere</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Brukerkontoer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                For å bruke Konsept må du opprette en brukerkonto. Du er ansvarlig for:
              </p>
              <ul>
                <li>Å holde din påloggingsinformasjon konfidensiell</li>
                <li>All aktivitet som skjer på din konto</li>
                <li>Å gi korrekt informasjon ved registrering</li>
                <li>Å varsle oss umiddelbart ved uautorisert bruk</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Kjøp og betaling</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Når du kjøper et konsept:
              </p>
              <ul>
                <li>Prisene er oppgitt i norske kroner (NOK)</li>
                <li>Betaling skjer via sikre betalingsløsninger</li>
                <li>Du mottar tilgang til konseptet umiddelbart etter bekreftet kjøp</li>
                <li>Alle salg er endelige (se avsnitt om angrerett)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Angrerett</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                I henhold til norsk lov har du 14 dagers angrerett på kjøp av digitale tjenester, 
                med mindre du har samtykket til at ytelsen starter før angrefristens utløp og 
                du har bekreftet å ha kjennskap til at du da mister angreretten.
              </p>
              <p>
                Ved kjøp av konsepter fra Konsept får du umiddelbar tilgang, og angrerett 
                gjelder derfor ikke hvis du har startet å bruke konseptet.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Bruksrettigheter</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Når du kjøper et konsept, får du:
              </p>
              <ul>
                <li>En ikke-eksklusiv rett til å bruke konseptet</li>
                <li>Rett til å spille med din vennegjeng</li>
                <li>Tilgang til oppdateringer og forbedringer</li>
              </ul>
              <p>
                Du får IKKE rett til:
              </p>
              <ul>
                <li>Å videreselge eller distribuere konseptene</li>
                <li>Å kopiere eller reprodusere materialet kommersielt</li>
                <li>Å endre eller lage avledede verk uten tillatelse</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Ansvarsbegrensning</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Konsept leveres "som den er". Vi:
              </p>
              <ul>
                <li>Garanterer ikke at tjenesten alltid vil være tilgjengelig</li>
                <li>Er ikke ansvarlig for tap av data eller innhold</li>
                <li>Er ikke ansvarlig for indirekte tap eller skader</li>
                <li>Forbeholder oss retten til å endre eller avvikle tjenesten</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Brukeratferd</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Du samtykker i å ikke:
              </p>
              <ul>
                <li>Misbruke tjenesten eller forstyrre andre brukere</li>
                <li>Forsøke å få uautorisert tilgang til systemet</li>
                <li>Laste opp skadelig kode eller virus</li>
                <li>Bruke tjenesten til ulovlige formål</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Oppsigelse</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Vi kan suspendere eller avslutte din tilgang til Konsept hvis du:
              </p>
              <ul>
                <li>Bryter disse vilkårene</li>
                <li>Misbruker tjenesten</li>
                <li>Ikke betaler for kjøpte konsepter</li>
              </ul>
              <p>
                Du kan når som helst slette din konto ved å kontakte oss.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Endringer i vilkår</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Vi kan oppdatere disse vilkårene. Ved vesentlige endringer vil vi varsle deg 
                via e-post eller melding i appen. Fortsatt bruk etter endringer anses som aksept.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Gjeldende lov</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Disse vilkårene er underlagt norsk lov. Tvister skal løses i norske domstoler.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                For spørsmål om brukervilkår:
              </p>
              <p>
                <strong>E-post:</strong> support@konsept.no<br />
                <strong>Adresse:</strong> Konsept AS, Norge
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;
