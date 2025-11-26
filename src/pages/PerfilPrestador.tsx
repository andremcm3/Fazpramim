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
  disponibilidade: z.string().min(10, "Informe sua disponibilidade").max(200),
});

type PerfilFormData = z.infer<typeof perfilSchema>;
type ServicoFormData = z.infer<typeof servicoSchema>;

interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
}

const PerfilPrestador = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fotoPerfil, setFotoPerfil] = useState<string>("/placeholder.svg");
  const [servicos, setServicos] = useState<Servico[]>([
    { id: "1", nome: "Serviço Exemplo", descricao: "Descrição do serviço exemplo", preco: "R$ 150,00" }
  ]);
  const [mostrarFormServico, setMostrarFormServico] = useState(false);

  const form = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
      descricao: "Profissional experiente com mais de 10 anos de atuação. Atendimento de qualidade e pontualidade garantida.",
      cidade: "São Paulo",
      estado: "SP",
      disponibilidade: "Segunda a Sexta: 08:00 - 18:00 | Sábado: 08:00 - 12:00",
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
          const resp = await fetch('http://127.0.0.1:8000/api/accounts/providers-edit/', {
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
      
      // Preencher o formulário com os dados (backend sobrescreve localStorage)
      form.reset({
        nome: mergedData?.full_name || mergedData?.nome || "",
        email: mergedData?.professional_email || mergedData?.email || "",
        telefone: formatPhone(mergedData?.phone || mergedData?.telefone || ""),
        descricao: mergedData?.technical_qualification || mergedData?.descricao || "",
        cidade: mergedData?.city || mergedData?.cidade || "",
        estado: mergedData?.state || mergedData?.estado || "",
        disponibilidade: mergedData?.availability || mergedData?.disponibilidade || "",
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
        providerData.availability = data.disponibilidade;
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
          formData.append('availability', data.disponibilidade);

          // Adicionar imagem se houver e for uma nova imagem (base64 = nova)
          if (fotoPerfil && fotoPerfil.startsWith('data:')) {
            // Converter data URL para Blob
            const response = await fetch(fotoPerfil);
            const blob = await response.blob();
            // Usar 'profile_photo' conforme esperado pelo backend
            formData.append('profile_photo', blob, 'profile.jpg');
          }

          const resp = await fetch(`http://127.0.0.1:8000/api/accounts/providers-edit/`, {
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

                    <FormField
                      control={form.control}
                      name="disponibilidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Disponibilidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Seg-Sex 08:00-18:00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

          {/* Serviços Oferecidos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Serviços Oferecidos</CardTitle>
                  <CardDescription>Gerencie os serviços que você oferece</CardDescription>
                </div>
                <Button
                  onClick={() => setMostrarFormServico(!mostrarFormServico)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulário de Novo Serviço */}
              {mostrarFormServico && (
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <Form {...formServico}>
                      <form onSubmit={formServico.handleSubmit(onSubmitServico)} className="space-y-4">
                        <FormField
                          control={formServico.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Serviço</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Instalação Elétrica" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formServico.control}
                          name="descricao"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descreva o serviço oferecido..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={formServico.control}
                          name="preco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: R$ 150,00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <Button type="submit">Adicionar</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setMostrarFormServico(false);
                              formServico.reset();
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* Lista de Serviços */}
              <div className="space-y-3">
                {servicos.map((servico) => (
                  <Card key={servico.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground">
                            {servico.nome}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {servico.descricao}
                          </p>
                          <p className="text-primary font-semibold mt-2">
                            {servico.preco}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removerServico(servico.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PerfilPrestador;
