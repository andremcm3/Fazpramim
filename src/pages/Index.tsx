import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Star, Shield, Clock, Search, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import HomePrestador from "./HomePrestador";

// Component to fetch and render provider's requests with simple accept action
const ProviderRequestsPanel: React.FC<{ providerId?: string | null }> = ({ providerId }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  const fetchRequests = async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/accounts/providers/${providerId}/requests/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Token ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('Erro ao buscar solicitações');
      const data = await res.json();
      // DRF may return { results: [...] } or []
      const results = Array.isArray(data) ? data : data.results || [];
      setRequests(results);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [providerId]);

  const pendingCount = requests.filter(r => {
    const s = (r.status || r.state || '').toString().toLowerCase();
    return s === 'pending' || s === 'pendente' || s === 'awaiting' || s === 'waiting' || s === 'created';
  }).length;
  const inProgressCount = requests.filter(r => {
    const s = (r.status || r.state || '').toString().toLowerCase();
    return s === 'in_progress' || s === 'inprogress' || s === 'em andamento' || s === 'aceito' || s === 'accepted';
  }).length;
  const completedCount = requests.filter(r => {
    const s = (r.status || r.state || '').toString().toLowerCase();
    return s === 'completed' || s === 'done' || s === 'concluido' || s === 'finished';
  }).length;

  // Try patching common request endpoints; return response if ok
  const patchRequestEndpoint = async (requestId: any, body: any) => {
    const token = localStorage.getItem('token');
    const endpoints = [
      `http://127.0.0.1:8000/api/accounts/requests/${requestId}/`,
      `http://127.0.0.1:8000/api/requests/${requestId}/`,
      `http://127.0.0.1:8000/api/requests/${requestId}/update/`,
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Token ${token}` } : {}),
          },
          body: JSON.stringify(body),
        });
        if (res.ok) return res;
      } catch (err) {
        console.warn('Tentativa falhou para', url, err);
      }
    }
    throw new Error('Nenhum endpoint aceitou a atualização');
  };

  const updateRequestStatusLocal = (requestId: any, status: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  };

  const acceptRequest = async (requestId: any) => {
    // Try common status values; fallback locally
    const tryStatuses = ['in_progress', 'accepted', 'aceito'];
    for (const s of tryStatuses) {
      try {
        await patchRequestEndpoint(requestId, { status: s });
        updateRequestStatusLocal(requestId, s);
        toast({ title: 'Solicitação aceita', description: 'Você aceitou a solicitação.' });
        // refresh list
        await fetchRequests();
        return;
      } catch (err) {
        // continue trying other status values
        console.warn('Falha ao tentar status', s, err);
      }
    }
    toast({ title: 'Erro', description: 'Não foi possível aceitar a solicitação. Verifique o console.' });
  };

  const declineRequest = async (requestId: any) => {
    const tryStatuses = ['declined', 'rejected', 'rejeitado'];
    for (const s of tryStatuses) {
      try {
        await patchRequestEndpoint(requestId, { status: s });
        updateRequestStatusLocal(requestId, s);
        toast({ title: 'Solicitação recusada', description: 'Você recusou a solicitação.' });
        await fetchRequests();
        return;
      } catch (err) {
        console.warn('Falha ao tentar status', s, err);
      }
    }
    toast({ title: 'Erro', description: 'Não foi possível recusar a solicitação. Verifique o console.' });
  };

  return (
    <div>
      <Card className="surface-card cursor-pointer hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]" onClick={() => setShowList(!showList)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Solicitações Recebidas</h3>
              <p className="text-sm text-muted-foreground">Pendentes / Em andamento / Concluídas</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{pendingCount} / {inProgressCount} / {completedCount}</p>
              <p className="text-xs text-muted-foreground">P / A / C</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showList && (
        <Card className="surface-card mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Histórico de Solicitações</h4>
              <div>
                <button className="text-sm text-muted-foreground mr-2" onClick={(e) => { e.stopPropagation(); fetchRequests(); }}>Atualizar</button>
              </div>
            </div>

            {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {!loading && requests.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma solicitação encontrada.</p>}

            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="p-3 border rounded-md flex items-start justify-between" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <p className="font-semibold">{req.client_name || req.requester_name || req.client_email || 'Cliente'}</p>
                    <p className="text-sm text-muted-foreground">{req.description || req.description_text || req.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">{req.desired_datetime ? new Date(req.desired_datetime).toLocaleString() : ''}</p>
                    <p className="text-xs mt-1">Status: <strong>{req.status || req.state || 'unknown'}</strong></p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {((req.status || '').toString().toLowerCase() === 'pending' || (req.status || '').toString().toLowerCase() === 'pendente') && (
                      <div className="flex gap-2">
                        <button className="bg-primary text-white rounded px-3 py-1 text-sm" onClick={(e) => { e.stopPropagation(); acceptRequest(req.id); }}>Aceitar</button>
                        <button className="bg-destructive text-white rounded px-3 py-1 text-sm" onClick={(e) => { e.stopPropagation(); declineRequest(req.id); }}>Recusar</button>
                      </div>
                    )}
                    <button className="text-sm text-muted-foreground" onClick={(e) => { e.stopPropagation(); window.open(`/solicitacao/${req.id}`, '_self'); }}>Ver</button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Debug
  console.log('Index - isAuthenticated:', isAuthenticated);
  console.log('Index - user:', user);
  console.log('Index - user?.tipo:', user?.tipo);

  // Se for prestador autenticado, usa a home específica dele
  if (isAuthenticated && user?.tipo === "prestador") {
    console.log('Index - Renderizando HomePrestador');
    return <HomePrestador />;
  }

  console.log('Index - Renderizando home padrão');
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {!isAuthenticated ? (
        <>
          {/* Hero Section */}
          <section className="py-20 px-4">
            <div className="container mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Conectando você aos
                <span className="bg-[var(--brand-gradient)] bg-clip-text text-transparent block">
                  melhores profissionais
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A plataforma que conecta clientes a prestadores de serviços qualificados. 
                Encontre o profissional ideal ou ofereça seus serviços com segurança.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="btn-hero text-lg px-8 py-4"
                  onClick={() => navigate("/register")}
                >
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="btn-outline-brand text-lg"
                  onClick={() => navigate("/search")}
                >
                  Buscar Prestadores
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 bg-muted/20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">
                Por que escolher o FAZ PRA MIM?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Profissionais Verificados</h3>
                  <p className="text-muted-foreground">
                    Todos os prestadores passam por processo de verificação rigoroso
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Pagamento Seguro</h3>
                  <p className="text-muted-foreground">
                    Sistema de pagamento protegido com garantia de satisfação
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Suporte 24/7</h3>
                  <p className="text-muted-foreground">
                    Atendimento disponível a qualquer hora para ajudar você
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl font-bold mb-6">
                Pronto para começar?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de usuários que já encontraram a solução perfeita
              </p>
              <Button 
                size="lg" 
                className="btn-hero text-lg px-8 py-4"
                onClick={() => navigate("/register")}
              >
                Criar Conta Gratuita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </section>
        </>
      ) : (
        <section className="container mx-auto px-4 py-12">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Bem-vindo, {user?.nome}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  O que você precisa hoje?
                </p>
              </div>

          {/* Ações Rápidas */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card 
              className="surface-card cursor-pointer hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)] hover:scale-105"
              onClick={() => navigate("/search")}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-lg bg-[var(--brand-gradient)] flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Buscar Prestadores
                </h3>
                <p className="text-muted-foreground">
                  Encontre profissionais qualificados para o serviço que você precisa
                </p>
              </CardContent>
            </Card>

            <Card 
              className="surface-card cursor-pointer hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)] hover:scale-105"
              onClick={() => navigate("/search")}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Solicitar Serviço
                </h3>
                <p className="text-muted-foreground">
                  Descreva o que você precisa e receba propostas de prestadores
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="surface-card">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Prestadores Verificados</p>
              </CardContent>
            </Card>
            <Card className="surface-card">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">5.0</p>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
              </CardContent>
            </Card>
            <Card className="surface-card">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-muted-foreground">Suporte Disponível</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
