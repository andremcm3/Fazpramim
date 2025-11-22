import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Star, 
  Clock, 
  MessageCircle, 
  Calendar,
  CheckCircle,
  Award,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Mock data para o prestador específico
const mockPrestadorDetails: Record<string, any> = {
  "1": {
    id: 1,
    nome: "Carlos Silva",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    servicoPrincipal: "Eletricista Residencial",
    avaliacao: 4.8,
    numAvaliacoes: 127,
    localizacao: "São Paulo - SP",
    telefone: "(11) 99999-9999",
    email: "carlos@email.com",
    descricao: "Eletricista com mais de 10 anos de experiência em instalações residenciais e comerciais. Especialista em sistemas elétricos modernos, automação residencial e energia solar. Trabalho sempre com materiais de primeira qualidade e ofereço garantia em todos os serviços.",
    servicos: [
      { nome: "Instalação Elétrica Completa", preco: "R$ 120/hora", descricao: "Instalação completa de sistemas elétricos" },
      { nome: "Manutenção Preventiva", preco: "R$ 80/hora", descricao: "Revisão e manutenção de instalações" },
      { nome: "Reparo de Emergência", preco: "R$ 150/hora", descricao: "Atendimento de emergência 24h" },
      { nome: "Automação Residencial", preco: "A combinar", descricao: "Sistemas inteligentes para casa" }
    ],
    avaliacoes: [
      {
        id: 1,
        cliente: "Maria Santos",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
        nota: 5,
        comentario: "Excelente profissional! Muito pontual e organizou. Resolveu meu problema elétrico rapidamente.",
        data: "2024-01-15"
      },
      {
        id: 2,
        cliente: "João Oliveira",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
        nota: 5,
        comentario: "Trabalho impecável! Instalou toda a parte elétrica da minha reforma com qualidade e no prazo.",
        data: "2024-01-10"
      },
      {
        id: 3,
        cliente: "Ana Costa",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
        nota: 4,
        comentario: "Bom atendimento e preço justo. Recomendo!",
        data: "2024-01-05"
      }
    ],
    disponibilidade: [
      { dia: "Segunda", horarios: ["08:00-12:00", "14:00-18:00"] },
      { dia: "Terça", horarios: ["08:00-12:00", "14:00-18:00"] },
      { dia: "Quarta", horarios: ["08:00-12:00"] },
      { dia: "Quinta", horarios: ["08:00-12:00", "14:00-18:00"] },
      { dia: "Sexta", horarios: ["08:00-12:00", "14:00-18:00"] },
      { dia: "Sábado", horarios: ["08:00-12:00"] },
      { dia: "Domingo", horarios: [] }
    ],
    certificacoes: ["Certificado NR-10", "Curso de Automação Residencial", "5+ anos de experiência"],
    areaAtuacao: "Atende toda a Grande São Paulo"
  }
};

const PrestadorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const prestador = mockPrestadorDetails[id as keyof typeof mockPrestadorDetails];

  if (!prestador) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Prestador não encontrado</h1>
          <Button onClick={() => navigate("/search")} className="bg-primary hover:bg-primary-hover">
            Voltar à pesquisa
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const handleSolicitarServico = () => {
    navigate(`/solicitar-servico/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header do Prestador */}
          <Card className="surface-card mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <Avatar className="w-32 h-32 mx-auto md:mx-0">
                    <AvatarImage src={prestador.foto} alt={prestador.nome} />
                    <AvatarFallback className="text-2xl">
                      {prestador.nome.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {prestador.nome}
                  </h1>
                  <p className="text-xl text-primary font-semibold mb-4">
                    {prestador.servicoPrincipal}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(prestador.avaliacao)}
                      <span className="font-semibold ml-2">{prestador.avaliacao}</span>
                      <span className="text-muted-foreground">
                        ({prestador.numAvaliacoes} avaliações)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start mb-6">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {prestador.localizacao}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {prestador.telefone}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Button 
                      size="lg" 
                      onClick={handleSolicitarServico}
                      className="bg-accent hover:bg-accent-hover"
                    >
                      Solicitar Serviço
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="btn-outline-brand"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Iniciar Chat
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sobre */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2 text-accent" />
                    Sobre o Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {prestador.descricao}
                  </p>
                </CardContent>
              </Card>

              {/* Serviços */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle>Serviços Oferecidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {prestador.servicos.map((servico, index) => (
                      <div key={index} className="flex justify-between items-start p-4 border border-border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">
                            {servico.nome}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {servico.descricao}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span className="font-semibold text-accent">
                            {servico.preco}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Avaliações */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle>Avaliações dos Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {prestador.avaliacoes.length > 0 ? (
                    <div className="space-y-6">
                      {prestador.avaliacoes.map((avaliacao) => (
                        <div key={avaliacao.id}>
                          <div className="flex items-start space-x-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={avaliacao.avatar} alt={avaliacao.cliente} />
                              <AvatarFallback>
                                {avaliacao.cliente.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold">{avaliacao.cliente}</span>
                                <div className="flex items-center space-x-1">
                                  {renderStars(avaliacao.nota)}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-muted-foreground">
                                {avaliacao.comentario}
                              </p>
                            </div>
                          </div>
                          {avaliacao.id !== prestador.avaliacoes[prestador.avaliacoes.length - 1].id && (
                            <Separator className="mt-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Sem avaliações até o momento
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Disponibilidade */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    Disponibilidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {prestador.disponibilidade.map((dia, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{dia.dia}</span>
                        <div className="text-right">
                          {dia.horarios.length > 0 ? (
                            <div className="text-sm text-muted-foreground">
                              {dia.horarios.map((horario, i) => (
                                <div key={i}>{horario}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Indisponível</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Certificações */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-accent" />
                    Qualificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {prestador.certificacoes.map((cert, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Área de Atuação */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary" />
                    Área de Atuação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {prestador.areaAtuacao}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrestadorDetails;