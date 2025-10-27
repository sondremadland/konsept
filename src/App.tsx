import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ConceptDetail from "./pages/ConceptDetail";
import Dashboard from "./pages/Dashboard";
import Game from "./pages/Game";
import Admin from "./pages/Admin";
import Onboarding from "./pages/Onboarding";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import { logger } from "@/lib/logger";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        logger.error('Query error', error as Error);
      },
    },
    mutations: {
      onError: (error) => {
        logger.error('Mutation error', error as Error);
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/concept/:id" element={<ConceptDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/game/:id" element={<Game />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;