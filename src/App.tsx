import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";
import { CookieProvider } from "@/contexts/CookieContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SportConfigProvider, useSportConfigContext } from "@/contexts/SportConfigContext";
import { SportThemeProvider } from "@/components/SportThemeProvider";
import { SportConfigTestWrapper } from "@/components/SportConfigTestWrapper";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Legal from "./pages/Legal";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import PublicLegal from "./pages/PublicLegal";
import Terms from "./pages/Terms";
import { SessionManager } from '@/components/SessionManager';

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CookieProvider>
        <LanguageProvider>
          <SportConfigProvider>
            <SportThemeProvider>
              <div>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                    <SessionManager>
                      <SportConfigTestWrapper>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                          <Route path="/legal" element={<Legal />} />
                          <Route path="/public-legal" element={<PublicLegal />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </SportConfigTestWrapper>
                    </SessionManager>
                  </BrowserRouter>
                </TooltipProvider>
              </div>
            </SportThemeProvider>
          </SportConfigProvider>
        </LanguageProvider>
      </CookieProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
