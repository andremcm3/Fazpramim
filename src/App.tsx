import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import RegisterCliente from "./pages/RegisterCliente";
import RegisterPrestador from "./pages/RegisterPrestador";
import Login from "./pages/Login";
import Search from "./pages/Search";
import PrestadorDetails from "./pages/PrestadorDetails";
import SolicitarServico from "./pages/SolicitarServico";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/cliente" element={<RegisterCliente />} />
          <Route path="/register/prestador" element={<RegisterPrestador />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/prestador/:id" element={<PrestadorDetails />} />
          <Route path="/solicitar-servico/:id" element={<SolicitarServico />} />
          <Route path="/chat/:id" element={<Chat />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
