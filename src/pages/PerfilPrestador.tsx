import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Plus, Trash2, Save } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const servicoSchema = z.object({
  nome: z.string().min(3, "Nome do serviço deve ter no mínimo 3 caracteres").max(100),
  descricao: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres").max(500),
  preco: z.string().min(1, "Preço é obrigatório"),
});

const perfilSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  telefone: z.string().min(10, "Telefone inválido").max(20),
  descricao: z.string().min(20, "Descrição deve ter no mínimo 20 caracteres").max(1000),
  cidade: z.string().min(2, "Cidade é obrigatória").max(100),
  estado: z.string().length(2, "Use a sigla do estado (ex: SP)"),
  // disponibilidade removida
});

type PerfilFormData = z.infer<typeof perfilSchema>;
type ServicoFormData = z.infer<typeof servicoSchema>;

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
}

interface PortfolioPhoto {
  id: number;
  photo: string;
  title: string;
  description: string;
}

const PerfilPrestador = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fotoPerfil, setFotoPerfil] = useState<string>("/placeholder.svg");
  const [servicos, setServicos] = useState<Servico[]>([
    { id: "1", nome: "Serviço Exemplo", descricao: "Descrição do serviço exemplo", preco: "R$ 150,00" }
  ]);
  const [mostrarFormServico, setMostrarFormServico] = useState(false);
  const [certificacoes, setCertificacoes] = useState<string[]>([]);
  const [novaCertificacao, setNovaCertificacao] = useState<File | null>(null);
  const [portfolioPhotos, setPortfolioPhotos] = useState<PortfolioPhoto[]>([]);

  const form = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
      descricao: "Profissional experiente com mais de 10 anos de atuação. Atendimento de qualidade e pontualidade garantida.",
      cidade: "São Paulo",
      estado: "SP",
      // disponibilidade removida
    },
  });

  const formatPhone = (value: string) => {
    if (!value) return "";
    const digits = String(value).replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return "";
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (!rest) return `(${ddd}) `;
    if (rest.length <= 4) return `(${ddd}) ${rest}`;
    const prefix = rest.slice(0, rest.length - 4);
    const last4 = rest.slice(-4);
    return `(${ddd}) ${prefix}-${last4}`;
  };

  // Carregar dados do usuário do localStorage e do backend quando o componente montar
  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = localStorage.getItem('user');
      const storedProviderProfile = localStorage.getItem('provider_profile');
      let userData: any = null;
      let providerData: any = null;
      
      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
        } catch (error) {
          console.error('Erro ao parsear userData do localStorage:', error);
        }
      }

      if (storedProviderProfile) {
        try {
          providerData = JSON.parse(storedProviderProfile);
        } catch (error) {
          console.error('Erro ao parsear providerData do localStorage:', error);
        }
      }

      // Tentar buscar dados atualizados do backend via providers-edit/
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const resp = await fetch('https://fazpramim-back.onrender.com/api/accounts/providers-edit/', {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
            },
          });

          if (resp.ok) {
            const backendData = await resp.json();
            // Usar dados do backend se disponível
            providerData = backendData;
            console.log('Dados carregados do backend:', backendData);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do backend:', error);
        // Continua com dados do localStorage em caso de erro
      }

      // Mesclar dados: backend + localStorage
      const mergedData = { ...userData, ...providerData };
      
      // Atualizar foto de perfil se existir (prioritário: backend > localStorage)
      // Aceitar tanto 'profile_photo' (novo backend) quanto 'profile_picture' (compatibilidade)
      if (mergedData?.profile_photo || mergedData?.profile_picture) {
        setFotoPerfil(mergedData.profile_photo || mergedData.profile_picture);
      }

      // Carregar certificações se o backend expõe
      // Aceita array em mergedData.certifications ou lista em mergedData.certifications_urls
      const certs = Array.isArray(mergedData?.certifications)
        ? mergedData.certifications
        : Array.isArray(mergedData?.certifications_urls)
          ? mergedData.certifications_urls
          : [];
      setCertificacoes(certs.filter((c: any) => typeof c === 'string'));

      // Carregar fotos do portfólio
      if (Array.isArray(mergedData?.portfolio_photos)) {
        setPortfolioPhotos(mergedData.portfolio_photos);
      }
      
      // Preencher o formulário com os dados (backend sobrescreve localStorage)
      form.reset({
        nome: mergedData?.full_name || mergedData?.nome || "",
        email: mergedData?.professional_email || mergedData?.email || "",
        telefone: formatPhone(mergedData?.phone || mergedData?.telefone || ""),
        descricao: mergedData?.technical_qualification || mergedData?.descricao || "",
        cidade: mergedData?.city || mergedData?.cidade || "",
        estado: mergedData?.state || mergedData?.estado || "",
        // disponibilidade removida
      });
    };

    loadUserData();
  }, []);

  const formServico = useForm<ServicoFormData>({
    resolver: zodResolver(servicoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      preco: "",
    },
  });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfil(reader.result as string);
        toast({
          title: "Foto atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitPerfil = (data: PerfilFormData) => {
    (async () => {
      console.log("Perfil atualizado:", data);

      // Atualizar dados do usuário no localStorage (mantendo comportamento atual)
      const storedUser = localStorage.getItem('user');
      const storedProviderProfile = localStorage.getItem('provider_profile');
      let userData: any = null;
      let providerData: any = null;
      
      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
        } catch (e) {
          console.error('Erro ao parsear user:', e);
        }
      }

      if (storedProviderProfile) {
        try {
          providerData = JSON.parse(storedProviderProfile);
        } catch (e) {
          console.error('Erro ao parsear provider_profile:', e);
        }
      }

      if (userData) {
        userData.nome = data.nome;
        userData.full_name = data.nome;
        userData.email = data.email;
        userData.professional_email = data.email;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      if (providerData) {
        providerData.full_name = data.nome;
        providerData.professional_email = data.email;
        providerData.phone = data.telefone;
        providerData.technical_qualification = data.descricao;
        providerData.city = data.cidade;
        providerData.state = data.estado;
        // disponibilidade removida do providerData
        localStorage.setItem('provider_profile', JSON.stringify(providerData));
      }

      // Enviar atualização para o backend (se o token/endpoint estiver disponível)
      try {
        const token = localStorage.getItem('token');

        // O backend agora expõe `providers-edit/` que usa o token para identificar o prestador.
        // Não é necessário enviar o providerId na URL.
        if (token) {
          // Usar FormData para permitir envio de arquivo
          const formData = new FormData();
          formData.append('full_name', data.nome);
          formData.append('professional_email', data.email);
          formData.append('phone', data.telefone);
          formData.append('technical_qualification', data.descricao);
          formData.append('city', data.cidade);
          formData.append('state', data.estado);
          // disponibilidade removida do formData

          // Enviar nova certificação se selecionada
          if (novaCertificacao) {
            formData.append('certifications', novaCertificacao, novaCertificacao.name);
          }

          // Adicionar imagem se houver e for uma nova imagem (base64 = nova)
          if (fotoPerfil && fotoPerfil.startsWith('data:')) {
            // Converter data URL para Blob
            const response = await fetch(fotoPerfil);
            const blob = await response.blob();
            // Usar 'profile_photo' conforme esperado pelo backend
            formData.append('profile_photo', blob, 'profile.jpg');
          }

          const resp = await fetch(`https://fazpramim-back.onrender.com/api/accounts/providers-edit/`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Token ${token}`,
              // Não incluir Content-Type; o browser o define automaticamente com boundary para multipart
            },
            body: formData,
          });

          if (!resp.ok) {
            const text = await resp.text().catch(() => '');
            console.error('Erro ao salvar no backend:');
            console.error('Status:', resp.status);
            console.error('Resposta:', text);
            toast({
              title: 'Erro ao salvar',
              description: `Não foi possível salvar suas informações no servidor. Status: ${resp.status}`,
            });
            return;
          }

          // Atualizar com dados da resposta do backend
          try {
            const responseData = await resp.json();
            console.log('Resposta do backend:', responseData);
            
            // Atualizar foto se o backend retornou uma nova URL
            if (responseData.profile_photo) {
              setFotoPerfil(responseData.profile_photo);
              console.log('Foto atualizada com URL do backend:', responseData.profile_photo);
            }
            
            // Atualizar provider_profile no localStorage com dados atualizados
            if (providerData) {
              providerData = { ...providerData, ...responseData };
              localStorage.setItem('provider_profile', JSON.stringify(providerData));
            }

            // Atualizar certificações na UI se vierem na resposta
            const certsResp = Array.isArray(responseData?.certifications)
              ? responseData.certifications
              : Array.isArray(responseData?.certifications_urls)
                ? responseData.certifications_urls
                : null;
            if (certsResp) {
              setCertificacoes(certsResp.filter((c: any) => typeof c === 'string'));
            }
          } catch (parseError) {
            console.error('Erro ao fazer parse da resposta:', parseError);
          }
        }

        toast({
          title: "Perfil salvo!",
          description: "Suas informações foram atualizadas com sucesso.",
        });
      } catch (err) {
        console.error('Erro na requisição de salvar perfil:', err);
        toast({
          title: 'Erro ao salvar',
          description: 'Ocorreu um erro ao tentar salvar. Verifique sua conexão ou o backend.',
        });
      }
    })();
  };

  const onSubmitServico = (data: ServicoFormData) => {
    const novoServico: Servico = {
      id: Date.now().toString(),
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
    };
    setServicos([...servicos, novoServico]);
    formServico.reset();
    setMostrarFormServico(false);
    toast({
      title: "Serviço adicionado!",
      description: "O novo serviço foi adicionado ao seu perfil.",
    });
  };

  const removerServico = (id: string) => {
    setServicos(servicos.filter(s => s.id !== id));
    toast({
      title: "Serviço removido",
      description: "O serviço foi removido do seu perfil.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-muted-foreground mt-1">Gerencie suas informações e serviços</p>
            </div>
            <Button onClick={() => navigate("/")}>
              Voltar ao Início
            </Button>
          </div>

          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>Adicione uma foto profissional para seu perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={fotoPerfil}
                    alt="Foto de perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-border"
                  />
                  <label
                    htmlFor="foto-upload"
                    className="absolute bottom-0 right-0 bg-primary hover:bg-primary-hover text-primary-foreground p-2 rounded-full cursor-pointer transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    <input
                      id="foto-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFotoChange}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Clique no ícone da câmera para alterar sua foto
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatos aceitos: JPG, PNG (máx. 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados pessoais e de contato</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitPerfil)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="(00) 00000-0000"
                                {...field}
                                value={field.value || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const formatted = formatPhone(e.target.value);
                                  e.target.value = formatted;
                                  field.onChange(formatted);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Campo de disponibilidade removido conforme solicitação */}

                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Sua cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sobre Você</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte um pouco sobre sua experiência e qualificações..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Informações
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Certificações */}
          <Card>
            <CardHeader>
              <CardTitle>Certificações</CardTitle>
              <CardDescription>Arquivos e documentos de certificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {certificacoes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma certificação enviada ainda.</p>
                ) : (
                  certificacoes.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <a
                        href={url.startsWith('http') ? url : `https://fazpramim-back.onrender.com${url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline text-sm truncate max-w-[70%]"
                      >
                        {url.split('/').pop()}
                      </a>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cert-upload">Adicionar nova certificação</Label>
                <Input
                  id="cert-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setNovaCertificacao(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  onClick={() => onSubmitPerfil(form.getValues())}
                  disabled={!novaCertificacao}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enviar Certificação
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Meu Portfólio */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meu Portfólio</CardTitle>
                  <CardDescription>Fotos e vídeos dos seus trabalhos realizados</CardDescription>
                </div>
                <Button
                  onClick={() => navigate("/gerenciar-portfolio")}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Gerenciar Portfólio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {portfolioPhotos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">Nenhuma foto no portfólio ainda.</p>
                  <Button onClick={() => navigate("/gerenciar-portfolio")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Foto
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {portfolioPhotos.slice(0, 8).map((photo) => {
                    const photoUrl = photo.photo.startsWith('http') ? photo.photo : `https://fazpramim-back.onrender.com${photo.photo}`;
                    return (
                      <div key={photo.id} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border hover:border-primary transition-colors">
                        <img
                          src={photoUrl}
                          alt={photo.title || 'Trabalho'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="font-semibold truncate">{photo.title || 'Sem título'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {portfolioPhotos.length > 8 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => navigate("/gerenciar-portfolio")}>
                    Ver Todas ({portfolioPhotos.length} fotos)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PerfilPrestador;
