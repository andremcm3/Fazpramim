import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Star, User, FileText, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const HomePrestador = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [servicosConcluidos, setServicosConcluidos] = useState(0);
  const [solicitacoesAbertas, setSolicitacoesAbertas] = useState(0);
  const [solicitacoesNaoAceitas, setSolicitacoesNaoAceitas] = useState(0);
  const [avaliacaoMedia, setAvaliacaoMedia] = useState(0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

  useEffect(() => {
    const fetchEstatisticas = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Buscar todas as solicitações
        const requestsResponse = await fetch('https://fazpramim-back.onrender.com/api/accounts/provider/requests/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (requestsResponse.ok) {
          const requests = await requestsResponse.json();
          setServicosConcluidos(requests.filter((r: any) => r.status === 'completed').length);
          setSolicitacoesAbertas(requests.filter((r: any) => r.status === 'accepted').length);
          setSolicitacoesNaoAceitas(requests.filter((r: any) => r.status === 'pending').length);
        }
        
        // Buscar avaliações
        const reviewsResponse = await fetch('https://fazpramim-back.onrender.com/api/accounts/provider/reviews/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        
        if (reviewsResponse.ok) {
          const reviews = await reviewsResponse.json();
          setTotalAvaliacoes(reviews.length);
          
          if (reviews.length > 0) {
            const total = reviews.reduce((acc: number, r: any) => acc + r.client_rating, 0);
            setAvaliacaoMedia(total / reviews.length);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };
    
    fetchEstatisticas();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bem-vindo, {user?.nome}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Gerencie suas solicitações e acompanhe seu desempenho
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Box 1: Histórico de Solicitações (Serviços Concluídos) */}
          <Card className="surface-card hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Histórico de Solicitações</CardTitle>
                  <CardDescription>Serviços concluídos</CardDescription>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-4xl font-bold text-green-600">{servicosConcluidos}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Serviços finalizados com sucesso
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/historico-prestador")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Histórico Completo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Box 2: Solicitações Abertas */}
          <Card className="surface-card hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Solicitações Abertas</CardTitle>
                  <CardDescription>Requerem sua atenção</CardDescription>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-medium text-blue-600">Em Andamento</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{solicitacoesAbertas}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-xs font-medium text-yellow-600">Pendentes</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{solicitacoesNaoAceitas}</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary-hover"
                  onClick={() => navigate("/solicitacoes-prestador")}
                >
                  Ver Todas as Solicitações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Box 3: Avaliação do Prestador */}
          <Card className="surface-card hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Sua Avaliação</CardTitle>
                  <CardDescription>Como os clientes te avaliam</CardDescription>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-bold text-foreground">{avaliacaoMedia.toFixed(1)}</p>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(avaliacaoMedia)
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Baseado em {totalAvaliacoes} avaliações
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/avaliacoes-prestador")}
                >
                  Ver Todas as Avaliações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Box 4: Editar Perfil */}
          <Card className="surface-card hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Meu Perfil</CardTitle>
                  <CardDescription>Gerencie suas informações</CardDescription>
                </div>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Mantenha seu perfil atualizado para atrair mais clientes
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-muted-foreground">Perfil verificado</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-muted-foreground">Documentos aprovados</span>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary-hover"
                  onClick={() => navigate("/perfil-prestador")}
                >
                  <User className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Dicas */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Dicas para Aumentar suas Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid md:grid-cols-3 gap-4 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Mantenha seu perfil sempre atualizado com fotos profissionais</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Responda rapidamente às solicitações de clientes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Solicite avaliações após concluir os serviços</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default HomePrestador;
