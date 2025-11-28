import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search as SearchIcon, MapPin, Star, SlidersHorizontal, Loader2, Briefcase, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 🔹 Interface Real (Baseada no seu ProviderListSerializer)
interface Provider {
  id: number;
  full_name: string;
  technical_qualification: string;
  service_address: string;
  profile_photo: string | null;
  email: string;
  average_rating?: number;
  total_reviews?: number;
  // Campos mockados (ainda não vêm do backend, mas mantemos para o layout não quebrar)
  avaliacao?: number;
  numAvaliacoes?: number;
  preco?: string;
  disponivel?: boolean;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados dos filtros
  const [locationFilter, setLocationFilter] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState("");

  // 🎯 Função para buscar prestadores na API Real
  const fetchProviders = async (term = "") => {
    setLoading(true);
    setError(null);
    try {
      // URL do Backend (O filtro ?search= é processado automaticamente pelo Django)
      const url = `http://127.0.0.1:8000/api/accounts/providers/?search=${encodeURIComponent(term)}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar prestadores.");
      }

      const data = await response.json();
      // O DRF pode retornar paginado ({ results: [] }) ou lista direta [].
      const results: Provider[] = Array.isArray(data) ? data : data.results || [];

      // Enriquecer com média e total de avaliações consultando o detalhe
      const enriched = await Promise.all(
        results.map(async (p) => {
          try {
            const detRes = await fetch(`http://127.0.0.1:8000/api/accounts/providers/${p.id}/`, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
            if (!detRes.ok) return p;
            const det = await detRes.json();
            return {
              ...p,
              average_rating: typeof det.average_rating === 'number' ? det.average_rating : 0,
              total_reviews: typeof det.total_reviews === 'number' ? det.total_reviews : 0,
            } as Provider;
          } catch {
            return p;
          }
        })
      );
      
      // 🎯 Aplicar filtros locais
      let filtered = enriched;
      
      // Filtro por cidade
      if (locationFilter.trim()) {
        filtered = filtered.filter(p => 
          p.service_address?.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }
      
      // Filtro por avaliação mínima
      if (minRatingFilter) {
        const minRating = parseFloat(minRatingFilter);
        filtered = filtered.filter(p => (p.average_rating ?? 0) >= minRating);
      }
      
      setProviders(filtered);
      
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os prestadores. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados ao abrir a página
  useEffect(() => {
    fetchProviders();
  }, []);

  // Handler de busca
  const handleSearch = () => {
    fetchProviders(searchTerm);
  };
  
  // Handler para aplicar filtros
  const handleApplyFilters = () => {
    fetchProviders(searchTerm);
  };
  
  // Handler para limpar filtros
  const handleClearFilters = () => {
    setLocationFilter("");
    setMinRatingFilter("");
    fetchProviders(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Helper para corrigir URL da imagem (adiciona domínio do Django se for relativo)
  const getPhotoUrl = (path: string | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  // Helper para renderizar estrelas baseado na média do backend
  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
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
                placeholder="Busque por serviço (ex: Eletricista) ou nome"
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
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pesquisar"}
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

        {/* Filter Panel */}
        {showFilters && (
          <Card className="surface-card mb-8 max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Localização</label>
                  <Input 
                    placeholder="Cidade" 
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Avaliação Mínima</label>
                  <select 
                    className="w-full p-2 border border-input rounded-lg bg-background"
                    value={minRatingFilter}
                    onChange={(e) => setMinRatingFilter(e.target.value)}
                  >
                    <option value="">Qualquer avaliação</option>
                    <option value="5">5 estrelas</option>
                    <option value="4">4+ estrelas</option>
                    <option value="3">3+ estrelas</option>
                    <option value="2">2+ estrelas</option>
                    <option value="1">1+ estrelas</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Limpar Filtros
                </Button>
                <Button 
                  size="sm" 
                  className="bg-accent hover:bg-accent-hover"
                  onClick={handleApplyFilters}
                >
                  Aplicar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {loading 
                ? "Carregando..." 
                : providers.length > 0 
                  ? `${providers.length} profissionais encontrados` 
                  : "Nenhum prestador encontrado"
              }
            </h2>
            
            {providers.length > 0 && (
              <select className="p-2 border border-input rounded-lg bg-background text-sm">
                <option value="relevance">Mais relevante</option>
                <option value="rating">Melhor avaliação</option>
              </select>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center py-10 bg-red-50 rounded-lg border border-red-200 text-red-600 mb-6">
              <p>{error}</p>
              <Button variant="outline" className="mt-4 border-red-200 text-red-600 hover:bg-red-50" onClick={() => fetchProviders()}>Tentar Novamente</Button>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && (
            <>
              {providers.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {providers.map((provider) => (
                    <Card 
                      key={provider.id} 
                      className="surface-card hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
                      onClick={() => navigate(`/prestador/${provider.id}`)}
                    >
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                          <AvatarImage src={getPhotoUrl(provider.profile_photo) || undefined} alt={provider.full_name} className="object-cover" />
                          <AvatarFallback className="bg-primary/10 text-primary">
                             {provider.full_name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{provider.full_name}</CardTitle>
                          <div className="flex items-center space-x-1 mt-1">
                            {renderStars(provider.average_rating ?? 0)}
                            {typeof provider.average_rating === 'number' && (provider.total_reviews ?? 0) > 0 ? (
                              <span className="text-sm text-muted-foreground ml-2">
                                {Number(provider.average_rating).toFixed(1)} ({provider.total_reviews} avaliações)
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground ml-2">(Novo)</span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3 flex-grow">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Briefcase className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span className="line-clamp-2">
                                {provider.technical_qualification || "Serviços Gerais"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                            <span className="line-clamp-1">
                                {provider.service_address || "Endereço não informado"}
                            </span>
                        </div>

                        {/* Tags de Serviços (Mock visual baseado na qualificação) */}
                        <div className="flex flex-wrap gap-1 pt-2">
                          <Badge variant="secondary" className="text-xs">
                            Profissional
                          </Badge>
                          {provider.technical_qualification && provider.technical_qualification.length > 20 && (
                             <Badge variant="secondary" className="text-xs">Experiente</Badge>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="border-t pt-4 mt-auto">
                         <div className="flex justify-between items-center w-full">
                            <span className="font-semibold text-accent text-sm">
                                {/* Preço Mockado */}
                                A combinar
                            </span>
                            <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full mr-2 bg-green-500" />
                                <span className="text-xs text-green-600">Disponível</span>
                            </div>
                         </div>
                      </CardFooter>
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
                    Tente usar termos diferentes na busca.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      fetchProviders("");
                    }}
                    className="btn-outline-brand"
                  >
                    Limpar Pesquisa
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Search;