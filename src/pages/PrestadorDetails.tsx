import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Star, Clock, MessageCircle, CheckCircle, Award, Phone, Mail, ArrowLeft, Loader2, Briefcase 
} from "lucide-react";

// --- COMPONENTES UI MOCKADOS (Para garantir que funcione aqui e no seu VS Code) ---
// Se preferir, pode substituir pelos seus imports: import { Button } from "@/components/ui/button"; etc.

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost', size?: 'default' | 'lg' | 'sm' }> = ({ children, className = "", variant = 'default', size = 'default', ...props }) => {
    const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground"
    };
    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 px-8 text-lg"
    };
    return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => <h3 className={`font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Avatar: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`relative flex shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>
);
const AvatarImage: React.FC<{ src?: string; alt?: string; className?: string }> = ({ src, alt, className = "" }) => (
    src ? <img src={src} alt={alt} className={`aspect-square h-full w-full ${className}`} /> : null
);
const AvatarFallback: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>{children}</div>
);
const Separator = ({ className = "" }) => <div className={`shrink-0 bg-border h-[1px] w-full ${className}`} />;
const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'secondary'; className?: string }> = ({ children, className = "", variant = 'default' }) => (
    <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variant === 'secondary' ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80'} ${className}`}>{children}</div>
);

const Header = () => (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-14 items-center px-4 mx-auto"><h1 className="text-xl font-bold text-blue-600">FAZ PRA MIM</h1></div>
    </header>
);
const Footer = () => (
    <footer className="border-t mt-12 py-4"><div className="container mx-auto px-4 text-center text-xs text-gray-500">&copy; 2025 FAZ PRA MIM.</div></footer>
);

// --- INTERFACES DA API ---

interface PortfolioPhoto {
  id: number;
  photo: string;
  title: string;
  description: string;
}

interface Review {
  id: number;
  client_rating: number;
  client_comment: string;
  client_name: string;
  client_reviewed_at: string;
  client_photo: string | null;
}

interface ProviderDetail {
  id: number;
  full_name: string;
  technical_qualification: string;
  service_address: string;
  profile_photo: string | null;
  email: string;
  professional_email?: string;
  average_rating: number;
  total_reviews: number;
  portfolio_photos: PortfolioPhoto[];
  reviews: Review[];
  certifications_urls?: string[];
  certifications?: string | Array<string | { file?: string; url?: string; path?: string; name?: string }>;
}

const PrestadorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🎯 Fetch dos dados reais
  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/accounts/providers/${id}/`);
        
        if (!res.ok) {
            if (res.status === 404) throw new Error("Prestador não encontrado.");
            throw new Error("Erro ao carregar detalhes.");
        }
        
        const data = await res.json();
        setProvider(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro de conexão.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const getPhotoUrl = (path: string | null) => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  const getCertUrl = (item: any) => {
    if (!item) return undefined;
    if (typeof item === 'string') return getPhotoUrl(item) || undefined;
    const p = item.url || item.file || item.path || '';
    return p ? getPhotoUrl(p) : undefined;
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

  // Disponibilidade típica removida conforme solicitação

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Prestador não encontrado"}</h1>
          <Button onClick={() => navigate("/search")} className="bg-primary hover:bg-primary-hover">
            Voltar à pesquisa
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Botão Voltar */}
          <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>

          {/* Header do Prestador */}
          <Card className="surface-card mb-8 bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Foto */}
                <div className="flex-shrink-0">
                  <Avatar className="w-32 h-32 mx-auto md:mx-0 border-4 border-white shadow-lg">
                    <AvatarImage src={getPhotoUrl(provider.profile_photo) || undefined} alt={provider.full_name} className="object-cover"/>
                    <AvatarFallback className="text-2xl bg-gray-100">{provider.full_name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Informações Principais */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {provider.full_name}
                  </h1>
                  <p className="text-xl text-blue-600 font-semibold mb-4 flex items-center justify-center md:justify-start gap-2">
                    <Briefcase className="w-5 h-5" />
                    {provider.technical_qualification.split('\n')[0].substring(0, 40)}...
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(provider.average_rating)}
                      <span className="font-bold ml-2 text-lg">{provider.average_rating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-sm">
                        ({provider.total_reviews} avaliações)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start mb-6 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-red-500" />
                      {provider.service_address}
                    </div>
                    {/* Telefone e Email ainda não estão públicos no serializer padrão por privacidade, 
                        mas se estiverem, você pode descomentar:
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {provider.professional_email || provider.email}
                    </div>
                    */}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Button 
                      size="lg" 
                      onClick={() => navigate(`/solicitar/${provider.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 shadow-md"
                    >
                      Solicitar Serviço
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      // Lógica de chat futura:
                      // onClick={() => navigate(`/chat/${provider.id}`)} 
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Dúvidas?
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
                    <Award className="w-5 h-5 mr-2 text-blue-500" />
                    Sobre o Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {provider.technical_qualification || "O profissional não forneceu uma descrição detalhada."}
                  </p>
                </CardContent>
              </Card>

              {/* Portfólio (INTEGRAÇÃO NOVA) */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                     <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                     Portfólio e Trabalhos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {provider.portfolio_photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {provider.portfolio_photos.map(photo => (
                            <div key={photo.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                <img 
                                    src={getPhotoUrl(photo.photo)} 
                                    alt={photo.title} 
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                    {photo.title || "Trabalho realizado"}
                                </div>
                            </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Nenhuma foto de portfólio disponível.</p>
                  )}
                </CardContent>
              </Card>

              {/* Certificações (INTEGRAÇÃO NOVA) */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
                    Certificações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Priorizar certifications_urls; fallback para certifications (string única ou array)
                    const certList = (Array.isArray(provider.certifications_urls) && provider.certifications_urls.length > 0)
                      ? provider.certifications_urls
                      : (typeof provider.certifications === 'string' && provider.certifications)
                        ? [provider.certifications]
                        : (Array.isArray(provider.certifications) ? provider.certifications : []);
                    
                    return certList.length > 0 ? (
                      <ul className="space-y-2">
                        {certList.map((c, idx) => {
                          const url = getCertUrl(c);
                          const label = typeof c === 'string' ? c.split('/').pop() : (c?.name || (c?.file || c?.url || c?.path || '')?.toString().split('/').pop());
                          return (
                            <li key={idx} className="flex items-center justify-between">
                              {url ? (
                                <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate max-w-[80%]">
                                  {label || 'Certificação'}
                                </a>
                              ) : (
                                <span className="text-sm text-muted-foreground">{label || 'Certificação'}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Nenhuma certificação disponível.</p>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Avaliações (INTEGRAÇÃO NOVA) */}
              <Card className="surface-card">
                <CardHeader>
                  <CardTitle>Avaliações dos Clientes ({provider.total_reviews})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {provider.reviews.length > 0 ? (
                        provider.reviews.map((avaliacao) => (
                        <div key={avaliacao.id}>
                            <div className="flex items-start space-x-4">
                            <Avatar className="w-10 h-10 bg-gray-100">
                                <AvatarFallback className="text-gray-600">
                                {avaliacao.client_name ? avaliacao.client_name[0].toUpperCase() : 'C'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-gray-900">{avaliacao.client_name || "Cliente"}</span>
                                <div className="flex items-center text-yellow-400">
                                    {renderStars(avaliacao.client_rating)}
                                </div>
                                <span className="text-sm text-gray-400">
                                    {new Date(avaliacao.client_reviewed_at).toLocaleDateString('pt-BR')}
                                </span>
                                </div>
                                <p className="text-gray-600 italic">
                                "{avaliacao.client_comment}"
                                </p>
                                {avaliacao.client_photo && (
                                    <img 
                                        src={getPhotoUrl(avaliacao.client_photo)} 
                                        alt="Foto da avaliação" 
                                        className="mt-3 w-20 h-20 object-cover rounded-md border border-gray-200"
                                    />
                                )}
                            </div>
                            </div>
                            {avaliacao.id !== provider.reviews[provider.reviews.length - 1].id && (
                            <Separator className="mt-6" />
                            )}
                        </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Este prestador ainda não possui avaliações.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar removida */}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrestadorDetails;