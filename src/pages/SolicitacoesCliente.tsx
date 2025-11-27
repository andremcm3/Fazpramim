import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertCircle, CheckCircle, Calendar, DollarSign, User, ArrowLeft, MessageSquare, Plus, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { completeServiceRequest, submitServiceReview, getProviderDetails } from "@/service/app";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SolicitacoesCliente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = useState<any[]>([]);
  const [providerDetails, setProviderDetails] = useState<Record<number, any>>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTargetId, setReviewTargetId] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [finalizadosIds, setFinalizadosIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/accounts/client/requests/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const solicitacoesFormatadas = data.map((solicitacao: any) => {
            const p = solicitacao.provider || {};
            // Mapear possíveis campos de nome que o backend pode usar
            const displayName = p.nome || p.name || p.full_name || p.username || p.email || 'Prestador';
            // Mapear possíveis campos de foto
            const avatarUrl = p.avatar_url || p.photo || p.profile_photo || p.foto || p.image || null;
            return {
              id: solicitacao.id,
              providerId: p.id || p.pk || null,
              prestador: displayName,
              avatarUrl,
              descricao: solicitacao.description,
              data: new Date(solicitacao.created_at).toLocaleDateString('pt-BR'),
              valor: solicitacao.proposed_value ? `R$ ${parseFloat(solicitacao.proposed_value).toFixed(2)}` : 'N/A',
              status: solicitacao.status,
              client_has_reviewed: !!solicitacao.client_has_reviewed,
              provider_has_reviewed: !!solicitacao.provider_has_reviewed,
              client_rating: typeof solicitacao.client_rating === 'number' ? solicitacao.client_rating : null,
              client_comment: solicitacao.client_comment || null,
              provider_rating: typeof solicitacao.provider_rating === 'number' ? solicitacao.provider_rating : null,
              provider_comment: solicitacao.provider_comment || null,
            };
          });
          setSolicitacoes(solicitacoesFormatadas);

          // Buscar detalhes dos prestadores (avatar, rating) de forma deduplicada
          const token = localStorage.getItem('token') || '';
          const uniqueIds = Array.from(new Set(solicitacoesFormatadas.map(s => s.providerId).filter(Boolean)));
          if (uniqueIds.length) {
            Promise.all(uniqueIds.map(id => 
              getProviderDetails(id as number, token)
                .then(data => ({ id, data }))
                .catch(() => ({ id, data: null }))
            )).then(results => {
              setProviderDetails(prev => {
                const copy = { ...prev };
                results.forEach(r => { if (r.data) copy[r.id as number] = r.data; });
                return copy;
              });
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
      }
    };
    
    fetchSolicitacoes();
  }, []);

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
          description: res?.message || "Aguardando confirmação do prestador para finalizar." 
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

  const handleNovaSolicitacao = () => {
    navigate("/search");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            Aguardando Resposta
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
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Minhas Solicitações
              </h1>
              <p className="text-lg text-muted-foreground">
                Acompanhe o status dos seus serviços
              </p>
            </div>
            <Button 
              onClick={handleNovaSolicitacao}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Solicitação
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pendentes" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
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
                  <p className="text-muted-foreground mb-4">Nenhuma solicitação pendente</p>
                  <Button onClick={handleNovaSolicitacao}>
                    <Plus className="w-4 h-4 mr-2" />
                    Fazer Nova Solicitação
                  </Button>
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
                          <Avatar className="h-6 w-6">
                            { (solicitacao.avatarUrl || providerDetails[solicitacao.providerId]?.avatar_url) ? (
                              <AvatarImage src={solicitacao.avatarUrl || providerDetails[solicitacao.providerId]?.avatar_url} />
                            ) : (
                              <AvatarFallback>{(solicitacao.prestador || 'P').charAt(0).toUpperCase()}</AvatarFallback>
                            ) }
                          </Avatar>
                          <span>{`Prestador - ${solicitacao.prestador}`}</span>
                          {(providerDetails[solicitacao.providerId]?.average_rating ?? providerDetails[solicitacao.providerId]?.rating) !== undefined && (
                            <span className="flex items-center text-xs ml-2"> 
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              {Number(providerDetails[solicitacao.providerId].average_rating ?? providerDetails[solicitacao.providerId].rating).toFixed(1)}
                              <span className="ml-1 text-muted-foreground">/5{typeof providerDetails[solicitacao.providerId]?.total_reviews === 'number' ? ` (${providerDetails[solicitacao.providerId].total_reviews} avaliações)` : ''}</span>
                            </span>
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
                    <div className="text-sm text-muted-foreground">
                      Aguardando o prestador aceitar ou rejeitar sua solicitação
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
                          <Avatar className="h-6 w-6">
                            { (solicitacao.avatarUrl || providerDetails[solicitacao.providerId]?.avatar_url) ? (
                              <AvatarImage src={solicitacao.avatarUrl || providerDetails[solicitacao.providerId]?.avatar_url} />
                            ) : (
                              <AvatarFallback>{(solicitacao.prestador || 'P').charAt(0).toUpperCase()}</AvatarFallback>
                            ) }
                          </Avatar>
                          <span>{`Prestador - ${solicitacao.prestador}`}</span>
                          {(providerDetails[solicitacao.providerId]?.average_rating ?? providerDetails[solicitacao.providerId]?.rating) !== undefined && (
                            <span className="flex items-center text-xs ml-2"> 
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              {Number(providerDetails[solicitacao.providerId].average_rating ?? providerDetails[solicitacao.providerId].rating).toFixed(1)}
                              <span className="ml-1 text-muted-foreground">/5{typeof providerDetails[solicitacao.providerId]?.total_reviews === 'number' ? ` (${providerDetails[solicitacao.providerId].total_reviews} avaliações)` : ''}</span>
                            </span>
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
                    {solicitacao.client_rating !== null && (
                      <div className="mb-4 space-y-1">
                        {renderStars(solicitacao.client_rating)}
                        {solicitacao.client_comment && (
                          <p className="text-xs text-muted-foreground italic line-clamp-2">"{solicitacao.client_comment}"</p>
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
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            { (solicitacao.avatarUrl || providerDetails[solicitacao.providerId]?.avatar_url) ? (
                              <AvatarImage src={solicitacao.avatarUrl || providerDetails[solicitacao.providerId]?.avatar_url} />
                            ) : (
                              <AvatarFallback>{(solicitacao.prestador || 'P').charAt(0).toUpperCase()}</AvatarFallback>
                            ) }
                          </Avatar>
                          <span>{`Prestador - ${solicitacao.prestador}`}</span>
                          {(providerDetails[solicitacao.providerId]?.average_rating ?? providerDetails[solicitacao.providerId]?.rating) !== undefined && (
                            <span className="flex items-center text-xs ml-2"> 
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              {Number(providerDetails[solicitacao.providerId].average_rating ?? providerDetails[solicitacao.providerId].rating).toFixed(1)}
                              <span className="ml-1 text-muted-foreground">/5{typeof providerDetails[solicitacao.providerId]?.total_reviews === 'number' ? ` (${providerDetails[solicitacao.providerId].total_reviews} avaliações)` : ''}</span>
                            </span>
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
                        Ver Conversa
                      </Button>
                      <Button 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => { setReviewTargetId(solicitacao.id); setReviewOpen(true); }}
                        disabled={solicitacao.client_has_reviewed}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {solicitacao.client_has_reviewed ? 'Avaliação enviada' : 'Avaliar Prestador'}
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
              <DialogTitle>Enviar Avaliação</DialogTitle>
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
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conte como foi o serviço" />
              </div>
              <div>
                <label className="text-sm font-medium">Foto (opcional)</label>
                <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancelar</Button>
              <Button onClick={async () => {
                if (!reviewTargetId) return;
                try {
                  const token = localStorage.getItem('token') || '';
                  await submitServiceReview(reviewTargetId, token, { rating, comment, photo: photoFile });
                  toast({ title: "Avaliação enviada!", description: "Obrigado por avaliar o prestador." });
                  setReviewOpen(false);
                  setComment("");
                  setPhotoFile(null);
                  // Atualizar item como avaliado com base no backend (fonte da verdade)
                  setSolicitacoes(prev => prev.map(s => 
                    s.id === reviewTargetId ? { ...s, client_has_reviewed: true } : s
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

export default SolicitacoesCliente;
