import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ArrowLeft, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AvaliacoesPrestador = () => {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [mediaGeral, setMediaGeral] = useState(0);

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/accounts/provider/reviews/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const avaliacoesFormatadas = data.map((review: any) => ({
            id: review.id,
            cliente: review.client_name || 'Cliente',
            servico: 'Serviço realizado', // TODO: Backend pode incluir descrição do serviço
            nota: review.client_rating,
            comentario: review.client_comment || '',
            data: new Date(review.client_reviewed_at).toLocaleDateString('pt-BR'),
            foto: review.client_photo || null
          }));
          
          setAvaliacoes(avaliacoesFormatadas);
          
          if (avaliacoesFormatadas.length > 0) {
            const total = avaliacoesFormatadas.reduce((acc: number, curr: any) => acc + curr.nota, 0);
            setMediaGeral(total / avaliacoesFormatadas.length);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
      }
    };
    
    fetchAvaliacoes();
  }, []);

  const renderStars = (nota: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= nota
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const contarNotas = (nota: number) => {
    return avaliacoes.filter(a => a.nota === nota).length;
  };

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
            Minhas Avaliações
          </h1>
          <p className="text-lg text-muted-foreground">
            Veja o que os clientes dizem sobre você
          </p>
        </div>

        {/* Resumo das Avaliações */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resumo das Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-6xl font-bold text-yellow-600 mb-2">
                  {mediaGeral.toFixed(1)}
                </div>
                {renderStars(Math.round(mediaGeral))}
                <p className="text-sm text-muted-foreground mt-2">
                  Baseado em {avaliacoes.length} avaliações
                </p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((nota) => {
                  const quantidade = contarNotas(nota);
                  const porcentagem = (quantidade / avaliacoes.length) * 100;
                  
                  return (
                    <div key={nota} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-12">{nota} estrelas</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all"
                          style={{ width: `${porcentagem}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {quantidade}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Avaliações */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-semibold mb-2">Todas as Avaliações</h2>
          
          {avaliacoes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma avaliação ainda</p>
              </CardContent>
            </Card>
          ) : (
            avaliacoes.map((avaliacao) => (
              <Card key={avaliacao.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{avaliacao.cliente}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <Calendar className="w-3 h-3" />
                            {avaliacao.data}
                          </CardDescription>
                        </div>
                      </div>
                      {renderStars(avaliacao.nota)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2 font-medium">
                    Serviço: {avaliacao.servico}
                  </p>
                  {avaliacao.comentario && (
                    <p className="text-foreground">{avaliacao.comentario}</p>
                  )}
                  {avaliacao.foto && (
                    <img 
                      src={avaliacao.foto} 
                      alt="Foto da avaliação" 
                      className="mt-4 rounded-lg max-h-64 object-cover"
                    />
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AvaliacoesPrestador;
