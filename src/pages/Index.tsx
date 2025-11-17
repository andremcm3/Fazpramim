import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Star, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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

      <Footer />
    </div>
  );
};

export default Index;
