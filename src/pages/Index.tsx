import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Users, Star, Shield, Clock, Search, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
