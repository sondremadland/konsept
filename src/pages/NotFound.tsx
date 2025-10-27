import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="max-w-lg w-full shadow-glow animate-fade-in text-center">
        <CardHeader>
          <div className="text-8xl mb-4">🤔</div>
          <CardTitle className="text-4xl mb-2">404</CardTitle>
          <p className="text-xl text-muted-foreground">
            Oops! Denne siden finnes ikke
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Siden du leter etter kan ha blitt flyttet eller eksisterer ikke lenger.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/">
                <Home className="mr-2 h-5 w-5" />
                Tilbake til forsiden
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/dashboard">
                <Search className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
