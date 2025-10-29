import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from "lucide-react";

const Privacy = () => {
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
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Personvernerklæring</h1>
          <p className="text-muted-foreground">Sist oppdatert: {new Date().toLocaleDateString("nb-NO")}</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Innsamling av personopplysninger</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Konsept samler inn følgende informasjon når du bruker vår tjeneste:
              </p>
              <ul>
                <li>E-postadresse (for innlogging og kommunikasjon)</li>
                <li>Navn (hvis oppgitt)</li>
                <li>Spilldata (gruppenavn, deltakernavn, poengsum)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bruk av personopplysninger</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Vi bruker dine personopplysninger til:
              </p>
              <ul>
                <li>Å gi deg tilgang til din brukerkonto</li>
                <li>Å levere og administrere spilltjenestene våre</li>
                <li>Å kommunisere med deg om din konto og bestillinger</li>
                <li>Å forbedre våre tjenester</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deling av data</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Vi deler ikke dine personopplysninger med tredjeparter, med unntak av:
              </p>
              <ul>
                <li>Når det er nødvendig for å levere tjenesten (f.eks. autentisering og database-hosting)</li>
                <li>Når det er påkrevd av loven</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dine rettigheter (GDPR)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                I henhold til GDPR har du følgende rettigheter:
              </p>
              <ul>
                <li>Rett til innsyn i dine personopplysninger</li>
                <li>Rett til retting av feil informasjon</li>
                <li>Rett til sletting av dine data</li>
                <li>Rett til å begrense behandling</li>
                <li>Rett til dataportabilitet</li>
              </ul>
              <p>
                For å utøve dine rettigheter, kontakt oss på: <strong>privacy@konsept.no</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datasikkerhet</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Vi bruker industristandarder for å beskytte dine data, inkludert:
              </p>
              <ul>
                <li>Kryptert datatransmisjon (HTTPS/SSL)</li>
                <li>Sikker database med tilgangskontroll (Row Level Security)</li>
                <li>Regelmessige sikkerhetsoppdateringer</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasjonskapsler (Cookies)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Konsept bruker minimalt med informasjonskapsler for å:
              </p>
              <ul>
                <li>Holde deg innlogget</li>
                <li>Lagre preferanser</li>
              </ul>
              <p>
                Du kan blokkere cookies i nettleseren din, men dette kan påvirke funksjonaliteten.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontakt oss</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Hvis du har spørsmål om personvern, kontakt oss:
              </p>
              <p>
                <strong>E-post:</strong> privacy@konsept.no<br />
                <strong>Adresse:</strong> Konsept AS, Norge
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
