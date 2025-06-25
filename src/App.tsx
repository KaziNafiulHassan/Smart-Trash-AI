
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ModelSettingsProvider } from "@/contexts/ModelSettingsContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Neo4jTest from "./pages/Neo4jTest";
import RAGTest from "./pages/RAGTest";
import FeedbackTest from "./pages/FeedbackTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ModelSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/neo4j-test" element={<Neo4jTest />} />
              <Route path="/rag-test" element={<RAGTest />} />
              <Route path="/feedback-test" element={<FeedbackTest />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ModelSettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
