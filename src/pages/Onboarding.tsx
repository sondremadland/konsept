import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Target, ChevronRight } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: Trophy,
      title: "Velkommen til Konsept! 🎉",
      description: "Her kan du kjøpe og spille sosiale konkurranser med vennegjengen din. La oss vise deg hvordan det fungerer!",
    },
    {
      icon: Users,
      title: "Opprett et spill 🎮",
      description: "Velg et konsept, gi gjengen et navn og legg til deltakere. Alt er klart på få sekunder!",
    },
    {
      icon: Target,
      title: "Registrer poeng 📊",
      description: "Etter hver runde registrerer du poeng for deltakerne. Poengtavlen oppdateres automatisk, og alle kan følge med på hvem som leder!",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem("onboarding_completed", "true");
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    navigate("/dashboard");
  };

  const CurrentIcon = steps[step].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-glow animate-fade-in">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-hero flex items-center justify-center animate-scale-in">
            <CurrentIcon className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl mb-2">{steps[step].title}</CardTitle>
          <CardDescription className="text-lg">{steps[step].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === step ? "w-12 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-4 justify-between">
            <Button variant="ghost" onClick={handleSkip}>
              Hopp over
            </Button>
            <Button onClick={handleNext} size="lg">
              {step < steps.length - 1 ? (
                <>
                  Neste <ChevronRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                "Kom i gang! 🚀"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
