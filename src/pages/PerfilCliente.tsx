import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Save, MapPin, Mail, Phone, User as UserIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const perfilSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  telefone: z.string().min(10, "Telefone inválido").max(20),
  cidade: z.string().min(2, "Cidade é obrigatória").max(100),
  estado: z.string().length(2, "Use a sigla do estado (ex: SP)"),
  endereco: z.string().min(5, "Endereço é obrigatório").max(200),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

const PerfilCliente = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [fotoPerfil, setFotoPerfil] = useState<string>("/placeholder.svg");

  const form = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: user?.nome || "Cliente",
      email: user?.email || "",
      telefone: "",
      cidade: "",
      estado: "",
      endereco: "",
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
      let userData: any = null;
      
      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
        } catch (error) {
          console.error('Erro ao parsear userData do localStorage:', error);
        }
      }

      // Tentar buscar dados atualizados do backend
      try {
        const token = localStorage.getItem('token');
        const clientId = userData?.id || userData?.pk || userData?.user_id || (user && (user.id || user.pk));

        if (clientId && token) {
          const resp = await fetch(`http://127.0.0.1:8000/api/accounts/clients/${clientId}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
            },
          });

          if (resp.ok) {
            const backendData = await resp.json();
            // Usar dados do backend se disponível, senão usar do localStorage
            userData = { ...userData, ...backendData };
            console.log('Dados carregados do backend:', backendData);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do backend:', error);
        // Continua com dados do localStorage em caso de erro
      }

      // Atualizar foto de perfil se existir (prioritário: backend > localStorage)
      // Aceitar tanto 'profile_photo' (novo backend) quanto 'profile_picture' (compatibilidade)
      if (userData?.profile_photo || userData?.profile_picture) {
        setFotoPerfil(userData.profile_photo || userData.profile_picture);
      }
      
      // Preencher o formulário com os dados (backend sobrescreve localStorage)
      form.reset({
        nome: userData?.full_name || userData?.nome || user?.nome || "",
        email: userData?.email || user?.email || "",
        telefone: formatPhone(userData?.phone || userData?.telefone || ""),
        endereco: userData?.address || userData?.endereco || "",
        cidade: userData?.city || userData?.cidade || "",
        estado: userData?.state || userData?.estado || "",
      });
    };

    loadUserData();
  }, [user]);

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
      let userData: any = null;
      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
          userData.nome = data.nome;
          userData.full_name = data.nome;
          userData.email = data.email;
          userData.telefone = data.telefone;
          userData.phone = data.telefone;
          userData.endereco = data.endereco;
          userData.address = data.endereco;
          userData.cidade = data.cidade;
          userData.city = data.cidade;
          userData.estado = data.estado;
          userData.state = data.estado;
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (e) {
          console.error('Erro ao atualizar localStorage:', e);
        }
      }

      // Enviar atualização para o backend (se token/endpoint disponível)
      try {
        const token = localStorage.getItem('token');
        const clientId = userData?.id || userData?.pk || userData?.user_id || (user && (user.id || user.pk));

        if (clientId && token) {
          // Usar FormData para permitir envio de arquivo
          const formData = new FormData();
          formData.append('full_name', data.nome);
          formData.append('email', data.email);
          formData.append('phone', data.telefone);
          formData.append('address', data.endereco);
          formData.append('city', data.cidade);
          formData.append('state', data.estado);

          // Adicionar imagem se houver e for uma nova imagem (base64 = nova)
          if (fotoPerfil && fotoPerfil.startsWith('data:')) {
            // Converter data URL para Blob
            const response = await fetch(fotoPerfil);
            const blob = await response.blob();
            // Usar 'profile_photo' conforme esperado pelo backend
            formData.append('profile_photo', blob, 'profile.jpg');
          }

          const resp = await fetch(`http://127.0.0.1:8000/api/accounts/clients/${clientId}/`, {
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
            console.error('FormData enviado:', {
              full_name: data.nome,
              email: data.email,
              phone: data.telefone,
              address: data.endereco,
              city: data.cidade,
              state: data.estado,
              tem_imagem: fotoPerfil && fotoPerfil.startsWith('data:'),
            });
            toast({
              title: 'Erro ao salvar',
              description: `Não foi possível salvar suas informações no servidor. Status: ${resp.status}`,
            });
            return;
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
              <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
            </div>
            <Button onClick={() => navigate("/")}>
              Voltar ao Início
            </Button>
          </div>

          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>Adicione uma foto para seu perfil</CardDescription>
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
                          <FormLabel className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            Nome Completo
                          </FormLabel>
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
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Telefone
                          </FormLabel>
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
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Endereço
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número" {...field} />
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

                  <Button type="submit" className="w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Informações
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground mt-1">Serviços Solicitados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">0</p>
                  <p className="text-sm text-muted-foreground mt-1">Serviços em Andamento</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">0</p>
                  <p className="text-sm text-muted-foreground mt-1">Serviços Concluídos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>O que você deseja fazer?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1" 
                onClick={() => navigate("/search")}
              >
                Buscar Prestadores
              </Button>
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => navigate("/search")}
              >
                Solicitar Serviço
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PerfilCliente;
