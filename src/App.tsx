import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Register from "./pages/Register";
import RegisterCliente from "./pages/RegisterCliente";
import RegisterPrestador from "./pages/RegisterPrestador";
import Login from "./pages/Login";
import Search from "./pages/Search";
import PrestadorDetails from "./pages/PrestadorDetails";
import SolicitarServico from "./pages/SolicitarServico";
import Chat from "./pages/Chat";
import PerfilPrestador from "./pages/PerfilPrestador";
import PerfilCliente from "./pages/PerfilCliente";
import HomePrestador from "./pages/HomePrestador";
import HistoricoPrestador from "./pages/HistoricoPrestador";
import SolicitacoesPrestador from "./pages/SolicitacoesPrestador";
import SolicitacoesCliente from "./pages/SolicitacoesCliente";
import AvaliacoesPrestador from "./pages/AvaliacoesPrestador";
import NotFound from "./pages/NotFound";
import GerenciarPortfolio from "./pages/GerenciarPortfolio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
            
            {/* 🚨 CORREÇÃO 1: Mudado de '/solicitar-servico/:id' para '/solicitar/:id' 
                para bater com o link do botão no PrestadorDetails */}
            <Route path="/solicitar/:id" element={<SolicitarServico />} />
            
            {/* 🚨 CORREÇÃO 2: Adicionada rota para visualizar a solicitação criada.
                Por enquanto, apontamos para o Chat, que é o fluxo natural. */}
            <Route path="/solicitacao/:id" element={<Chat />} />
            
            <Route path="/chat/:id" element={<Chat />} />
            
            <Route path="/perfil-prestador" element={<PerfilPrestador />} />
            <Route path="/perfil-cliente" element={<PerfilCliente />} />
            <Route path="/home-prestador" element={<HomePrestador />} />
            <Route path="/historico-prestador" element={<HistoricoPrestador />} />
            <Route path="/solicitacoes-prestador" element={<SolicitacoesPrestador />} />
            <Route path="/solicitacoes-cliente" element={<SolicitacoesCliente />} />
            <Route path="/avaliacoes-prestador" element={<AvaliacoesPrestador />} />
                        <Route path="/gerenciar-portfolio" element={<GerenciarPortfolio />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;