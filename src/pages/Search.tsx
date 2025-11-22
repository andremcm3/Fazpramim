import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search as SearchIcon, MapPin, Star, Filter, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Mock data para prestadores
const mockPrestadores = [
  {
    id: 1,
    nome: "Carlos Silva",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    servicoPrincipal: "Eletricista Residencial",
    avaliacao: 4.8,
    numAvaliacoes: 127,
    preco: "R$ 80-120/hora",
    localizacao: "São Paulo - SP",
    servicos: ["Instalação Elétrica", "Manutenção", "Reparo"],
    disponivel: true
  },
  {
    id: 2,
    nome: "Ana Costa",
    foto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    servicoPrincipal: "Limpeza Doméstica",
    avaliacao: 4.9,
    numAvaliacoes: 203,
    preco: "R$ 25-35/hora",
    localizacao: "Rio de Janeiro - RJ",
    servicos: ["Limpeza Residencial", "Organização", "Passadoria"],
    disponivel: true
  },
  {
    id: 3,
    nome: "Pedro Oliveira",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    servicoPrincipal: "Encanador",
    avaliacao: 4.7,
    numAvaliacoes: 89,
    preco: "R$ 70-100/hora",
    localizacao: "Belo Horizonte - MG",
    servicos: ["Instalação Hidráulica", "Desentupimento", "Vazamentos"],
    disponivel: false
  },
  {
    id: 4,
    nome: "Mariana Santos",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    servicoPrincipal: "Personal Trainer",
    avaliacao: 5.0,
    numAvaliacoes: 45,
    preco: "R$ 80-150/sessão",
    localizacao: "São Paulo - SP",
    servicos: ["Treino Funcional", "Musculação", "Pilates"],
    disponivel: true
  },
  {
    id: 5,
    nome: "Roberto Ferreira",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    servicoPrincipal: "Pintor Residencial",
    avaliacao: 4.6,
    numAvaliacoes: 156,
    preco: "R$ 40-60/m²",
    localizacao: "Curitiba - PR",
    servicos: ["Pintura Interna", "Pintura Externa", "Textura"],
    disponivel: true
  }
];

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPrestadores, setFilteredPrestadores] = useState(mockPrestadores);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredPrestadores(mockPrestadores);
      return;
    }

    const filtered = mockPrestadores.filter(prestador =>
      prestador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestador.servicoPrincipal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prestador.servicos.some(servico => 
        servico.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    setFilteredPrestadores(filtered);
  };

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Encontre o Profissional Ideal
          </h1>
          <p className="text-muted-foreground mb-8">
            Pesquise por serviço ou nome do prestador
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Busque por serviço ou nome do prestador"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button 
              onClick={handleSearch}
              size="lg"
              className="bg-primary hover:bg-primary-hover px-8"
            >
              Pesquisar
            </Button>
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline-brand"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Filter Panel (Optional - collapsible) */}
        {showFilters && (
          <Card className="surface-card mb-8 max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Localização</label>
                  <Input placeholder="Cidade ou CEP" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Avaliação Mínima</label>
                  <select className="w-full p-2 border border-input rounded-lg bg-background">
                    <option value="">Qualquer avaliação</option>
                    <option value="4">4+ estrelas</option>
                    <option value="4.5">4.5+ estrelas</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preço Máximo</label>
                  <Input placeholder="R$ 100/hora" />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <Button variant="outline" size="sm">Limpar Filtros</Button>
                <Button size="sm" className="bg-accent hover:bg-accent-hover">Aplicar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {filteredPrestadores.length > 0 
                ? `${filteredPrestadores.length} profissionais encontrados`
                : "Nenhum prestador encontrado"
              }
            </h2>
            
            {filteredPrestadores.length > 0 && (
              <select className="p-2 border border-input rounded-lg bg-background text-sm">
                <option value="relevance">Mais relevante</option>
                <option value="rating">Melhor avaliação</option>
                <option value="price_low">Menor preço</option>
                <option value="distance">Mais próximo</option>
              </select>
            )}
          </div>

          {/* Results Grid */}
          {filteredPrestadores.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrestadores.map((prestador) => (
                <Card 
                  key={prestador.id} 
                  className="surface-card hover:shadow-[var(--shadow-medium)] transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/prestador/${prestador.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={prestador.foto} alt={prestador.nome} />
                        <AvatarFallback>{prestador.nome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-1">
                          {prestador.nome}
                        </h3>
                        <p className="text-primary font-medium mb-2">
                          {prestador.servicoPrincipal}
                        </p>
                        <div className="flex items-center space-x-1 mb-2">
                          {renderStars(prestador.avaliacao)}
                          <span className="text-sm text-muted-foreground ml-2">
                            {prestador.avaliacao} ({prestador.numAvaliacoes} avaliações)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {prestador.localizacao}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {prestador.servicos.slice(0, 2).map((servico, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {servico}
                          </Badge>
                        ))}
                        {prestador.servicos.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{prestador.servicos.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold text-accent">
                          {prestador.preco}
                        </span>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            prestador.disponivel ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className={`text-xs ${
                            prestador.disponivel ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {prestador.disponivel ? 'Disponível' : 'Ocupado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhum prestador encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Ajuste os filtros de pesquisa ou tente outros termos
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilteredPrestadores(mockPrestadores);
                }}
                className="btn-outline-brand"
              >
                Limpar Pesquisa
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;