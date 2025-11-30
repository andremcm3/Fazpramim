import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertCircle, CheckCircle, Calendar, DollarSign, User, ArrowLeft, MessageSquare, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acceptServiceRequest, rejectServiceRequest, completeServiceRequest, submitServiceReview } from "@/service/app";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SolicitacoesPrestador = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [finalizadosIds, setFinalizadosIds] = useState<Set<number>>(new Set());
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTargetId, setReviewTargetId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://fazpramim-back.onrender.com/api/accounts/provider/requests/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const solicitacoesFormatadas = data
            .filter((s: any) => s.status !== 'rejected')
            .map((solicitacao: any) => ({
              id: solicitacao.id,
              cliente: solicitacao.client?.username || solicitacao.client?.email || 'Cliente',
              clienteFoto: solicitacao.client?.profile_photo || '/placeholder.svg',
              descricao: solicitacao.description,
              data: new Date(solicitacao.created_at).toLocaleDateString('pt-BR'),
              valor: solicitacao.proposed_value ? `R$ ${parseFloat(solicitacao.proposed_value).toFixed(2)}` : 'N/A',
              status: solicitacao.status === 'pending' ? 'pending' : solicitacao.status === 'accepted' ? 'accepted' : 'completed',
              clienteAvaliacao: solicitacao.client_rating || null,
              provider_has_reviewed: !!solicitacao.provider_has_reviewed,
              provider_rating: typeof solicitacao.provider_rating === 'number' ? solicitacao.provider_rating : null,
              provider_comment: solicitacao.provider_comment || null,
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
      const token = localStorage.getItem('token') || '';
      const res = await acceptServiceRequest(id, token);
      setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: "accepted" } : s));
      toast({ title: "Solicitação aceita", description: res?.message || "A solicitação foi aceita com sucesso." });
    } catch (error: any) {
      toast({ title: "Não foi possível aceitar", description: error?.message || "Verifique suas permissões ou status." });
      console.error('Erro ao aceitar solicitação:', error);
    }
  };

  const handleRejeitar = async (id: number) => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await rejectServiceRequest(id, token);
      setSolicitacoes(prev => prev.filter(s => s.id !== id));
      toast({ title: "Solicitação rejeitada", description: res?.message || "A solicitação foi rejeitada com sucesso." });
    } catch (error: any) {
      toast({ title: "Não foi possível rejeitar", description: error?.message || "Verifique suas permissões ou status." });
      console.error('Erro ao rejeitar solicitação:', error);
    }
  };

  const handleFinalizar = async (id: number) => {
    try {
      const token = localStorage.getItem('token') || '';
      const res = await completeServiceRequest(id, token);
      
      // Verificar se ambos confirmaram (status = completed)
      if (res?.status === 'completed') {
        toast({ 
          title: "Serviço concluído!", 
          description: res?.message || "O serviço foi finalizado com sucesso." 
        });
        // Remover da lista de Em Andamento
        setSolicitacoes(prev => prev.filter(s => s.id !== id));
      } else {
        toast({ 
          title: "Confirmação registrada", 
          description: res?.message || "Aguardando confirmação do cliente para finalizar." 
        });
      }
      // Marcar como finalizado independente do resultado
      setFinalizadosIds(prev => new Set(prev).add(id));
    } catch (error: any) {
      toast({ 
        title: "Não foi possível finalizar", 
        description: error?.message || "Verifique se o serviço pode ser finalizado." 
      });
      console.error('Erro ao finalizar serviço:', error);
    }
  };

  const handleAbrirChat = (id: number) => {
    navigate(`/chat/${id}`);
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
  const concluidos = solicitacoes.filter(s => s.status === "completed");

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">{rating.toFixed(1)}/5</span>
    </div>
  );

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
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pendentes">
              Pendentes ({pendentes.length})
            </TabsTrigger>
            <TabsTrigger value="andamento">
              Em Andamento ({emAndamento.length})
            </TabsTrigger>
            <TabsTrigger value="concluidos">
              Concluídos ({concluidos.length})
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
                        <CardDescription className="flex items-center gap-3 mt-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={solicitacao.clienteFoto} />
                            <AvatarFallback>{solicitacao.cliente[0]}</AvatarFallback>
                          </Avatar>
                          <span>{solicitacao.cliente}</span>
                          {solicitacao.clienteAvaliacao && (
                            <div className="flex items-center gap-1 ml-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{solicitacao.clienteAvaliacao}</span>
                            </div>
                          )}
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
                        <CardDescription className="flex items-center gap-3 mt-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={solicitacao.clienteFoto} />
                            <AvatarFallback>{solicitacao.cliente[0]}</AvatarFallback>
                          </Avatar>
                          <span>{solicitacao.cliente}</span>
                          {solicitacao.clienteAvaliacao && (
                            <div className="flex items-center gap-1 ml-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{solicitacao.clienteAvaliacao}</span>
                            </div>
                          )}
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
                        onClick={() => handleAbrirChat(solicitacao.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Mensagens
                      </Button>
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleFinalizar(solicitacao.id)}
                        disabled={finalizadosIds.has(solicitacao.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {finalizadosIds.has(solicitacao.id) ? 'Finalizado' : 'Finalizar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="concluidos" className="space-y-4">
            {concluidos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum serviço concluído ainda</p>
                </CardContent>
              </Card>
            ) : (
              concluidos.map((solicitacao) => (
                <Card key={solicitacao.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{solicitacao.descricao}</CardTitle>
                        <CardDescription className="flex items-center gap-3 mt-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={solicitacao.clienteFoto} />
                            <AvatarFallback>{solicitacao.cliente[0]}</AvatarFallback>
                          </Avatar>
                          <span>{solicitacao.cliente}</span>
                          {solicitacao.clienteAvaliacao && (
                            <div className="flex items-center gap-1 ml-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{solicitacao.clienteAvaliacao}</span>
                            </div>
                          )}
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
                    {solicitacao.provider_rating !== null && (
                      <div className="mb-4 space-y-1">
                        {renderStars(solicitacao.provider_rating)}
                        {solicitacao.provider_comment && (
                          <p className="text-xs text-muted-foreground italic line-clamp-2">"{solicitacao.provider_comment}"</p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleAbrirChat(solicitacao.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ver Conversa
                      </Button>
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => { setReviewTargetId(solicitacao.id); setReviewOpen(true); }}
                        disabled={solicitacao.provider_has_reviewed}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {solicitacao.provider_has_reviewed ? 'Avaliação enviada' : 'Avaliar Cliente'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de Avaliação */}
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avaliar Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nota</label>
                <div className="flex items-center gap-2 mt-2">
                  {[1,2,3,4,5].map((n) => (
                    <Button key={n} variant={rating === n ? "default" : "outline"} size="sm" onClick={() => setRating(n)}>
                      <Star className="w-4 h-4 mr-1" /> {n}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Comentário</label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conte como foi trabalhar com este cliente" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                if (!reviewTargetId) return;
                try {
                  const token = localStorage.getItem('token') || '';
                  await submitServiceReview(reviewTargetId, token, { rating, comment, photo: null });
                  toast({ title: "Avaliação enviada!", description: "Obrigado por avaliar o cliente." });
                  setReviewOpen(false);
                  setComment("");
                  setSolicitacoes(prev => prev.map(s => 
                    s.id === reviewTargetId ? { ...s, provider_has_reviewed: true } : s
                  ));
                } catch (error: any) {
                  toast({ title: "Erro ao enviar avaliação", description: error?.message || "Tente novamente." });
                }
              }}>Enviar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <Footer />
    </div>
  );
};

export default SolicitacoesPrestador;
