import { useState } from "react";
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
    console.log("Perfil atualizado:", data);
    toast({
      title: "Perfil salvo!",
      description: "Suas informações foram atualizadas com sucesso.",
    });
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
                            <Input placeholder="(00) 00000-0000" {...field} />
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
