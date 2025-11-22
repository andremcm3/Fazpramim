import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Junte-se ao FAZ PRA MIM
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Escolha como você deseja participar da nossa plataforma
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Cliente Card */}
            <Card className="surface-card hover:shadow-[var(--shadow-medium)] transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Sou Cliente</CardTitle>
                <CardDescription className="text-base">
                  Preciso de serviços e quero encontrar os melhores profissionais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-3 mb-6 text-muted-foreground">
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-accent" />
                    Encontre profissionais qualificados
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-accent" />
                    Compare preços e avaliações
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-accent" />
                    Contratação segura e protegida
                  </li>
                </ul>
                <Button 
                  className="w-full bg-primary hover:bg-primary-hover"
                  onClick={() => navigate("/register/cliente")}
                >
                  Cadastrar como Cliente
                </Button>
              </CardContent>
            </Card>
            
            {/* Prestador Card */}
            <Card className="surface-card hover:shadow-[var(--shadow-medium)] transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Briefcase className="w-10 h-10 text-accent" />
                </div>
                <CardTitle className="text-2xl">Sou Prestador</CardTitle>
                <CardDescription className="text-base">
                  Ofereço serviços e quero encontrar novos clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-3 mb-6 text-muted-foreground">
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-accent" />
                    Receba solicitações de serviços
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-accent" />
                    Construa sua reputação online
                  </li>
                  <li className="flex items-center">
                    <ArrowRight className="w-4 h-4 mr-2 text-accent" />
                    Amplie sua carteira de clientes
                  </li>
                </ul>
                <Button 
                  className="w-full bg-accent hover:bg-accent-hover"
                  onClick={() => navigate("/register/prestador")}
                >
                  Cadastrar como Prestador
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-semibold"
              >
                Faça login aqui
              </button>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;