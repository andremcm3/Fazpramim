import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, DollarSign, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HistoricoPrestador = () => {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<any[]>([]);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:8000/api/accounts/provider/requests/?status=completed', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const servicosFormatados = data.map((servico: any) => ({
            id: servico.id,
            cliente: servico.client?.username || servico.client?.email || 'Cliente',
            descricao: servico.description,
            data: new Date(servico.created_at).toLocaleDateString('pt-BR'),
            valor: servico.proposed_value ? `R$ ${parseFloat(servico.proposed_value).toFixed(2)}` : 'N/A',
            avaliacao: 5 // TODO: Adicionar avaliação real quando backend fornecer
          }));
          setServicos(servicosFormatados);
        }
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };
    
    fetchServicos();
  }, []);

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
            Histórico de Serviços
          </h1>
          <p className="text-lg text-muted-foreground">
            Serviços concluídos e finalizados
          </p>
        </div>

        <div className="grid gap-4">
          {servicos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum serviço concluído ainda</p>
              </CardContent>
            </Card>
          ) : (
            servicos.map((servico) => (
              <Card key={servico.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{servico.descricao}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <User className="w-4 h-4" />
                        {servico.cliente}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{servico.data}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">{servico.valor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">{"★".repeat(servico.avaliacao)}</span>
                      <span className="text-muted-foreground">({servico.avaliacao}/5)</span>
                    </div>
                  </div>
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

export default HistoricoPrestador;
