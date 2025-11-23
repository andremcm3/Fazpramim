import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertCircle, CheckCircle, Calendar, DollarSign, User, ArrowLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SolicitacoesPrestador = () => {
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/accounts/provider/requests/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const solicitacoesFormatadas = data
            .filter((s: any) => s.status !== 'completed' && s.status !== 'rejected')
            .map((solicitacao: any) => ({
              id: solicitacao.id,
              cliente: solicitacao.client?.username || solicitacao.client?.email || 'Cliente',
              descricao: solicitacao.description,
              data: new Date(solicitacao.created_at).toLocaleDateString('pt-BR'),
              valor: solicitacao.proposed_value ? `R$ ${parseFloat(solicitacao.proposed_value).toFixed(2)}` : 'N/A',
              status: solicitacao.status === 'pending' ? 'pending' : 'accepted'
            }));
          setSolicitacoes(solicitacoesFormatadas);
        }
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
      }
    };
    
    fetchSolicitacoes();
  }, []);

  const handleAceitar = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/accounts/service-request/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      
      if (response.ok) {
        setSolicitacoes(prev => 
          prev.map(s => s.id === id ? { ...s, status: "accepted" } : s)
        );
      }
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
    }
  };

  const handleRejeitar = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/accounts/service-request/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (response.ok) {
        setSolicitacoes(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "accepted":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="w-3 h-3 mr-1" />
            Em Andamento
          </Badge>
        );
      default:
        return null;
    }
  };

  const pendentes = solicitacoes.filter(s => s.status === "pending");
  const emAndamento = solicitacoes.filter(s => s.status === "accepted");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/home-prestador")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Solicitações de Serviço
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie suas solicitações abertas
          </p>
        </div>

        <Tabs defaultValue="pendentes" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pendentes">
              Pendentes ({pendentes.length})
            </TabsTrigger>
            <TabsTrigger value="andamento">
              Em Andamento ({emAndamento.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="space-y-4">
            {pendentes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma solicitação pendente</p>
                </CardContent>
              </Card>
            ) : (
              pendentes.map((solicitacao) => (
                <Card key={solicitacao.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{solicitacao.descricao}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <User className="w-4 h-4" />
                          {solicitacao.cliente}
                        </CardDescription>
                      </div>
                      {getStatusBadge(solicitacao.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{solicitacao.data}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{solicitacao.valor}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleAceitar(solicitacao.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aceitar
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejeitar(solicitacao.id)}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="andamento" className="space-y-4">
            {emAndamento.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum serviço em andamento</p>
                </CardContent>
              </Card>
            ) : (
              emAndamento.map((solicitacao) => (
                <Card key={solicitacao.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{solicitacao.descricao}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <User className="w-4 h-4" />
                          {solicitacao.cliente}
                        </CardDescription>
                      </div>
                      {getStatusBadge(solicitacao.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{solicitacao.data}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{solicitacao.valor}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => console.log("Abrir chat:", solicitacao.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mensagens
                      </Button>
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => console.log("Finalizar:", solicitacao.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalizar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
};

export default SolicitacoesPrestador;
