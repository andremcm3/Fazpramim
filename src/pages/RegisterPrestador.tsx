import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, Eye, EyeOff, Briefcase, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// 🎯 Função de API Integrada
const apiPost = async (url: string, payload: any) => {
    // Se for FormData, o browser define o Content-Type automaticamente
    const isFormData = payload instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? payload : JSON.stringify(payload);

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Erro desconhecido na requisição' }));
        // Lança string JSON para ser parseada no catch
        throw new Error(JSON.stringify(errorBody)); 
    }

    return response.json();
};

const prestadorSchema = z.object({
  nomeCompleto: z.string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email deve ter no máximo 255 caracteres"),
  senha: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter ao menos: 1 minúscula, 1 maiúscula, 1 número"),
  confirmarSenha: z.string(),
  telefone: z.string()
    .min(10, "Telefone inválido")
    .max(15, "Telefone inválido")
    .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, "Telefone deve ter formato válido"),
  endereco: z.string()
    .min(10, "Endereço deve ter pelo menos 10 caracteres")
    .max(500, "Endereço deve ter no máximo 500 caracteres"),
  qualificacaoTecnica: z.string()
    .min(20, "Descreva sua qualificação técnica (mínimo 20 caracteres)")
    .max(1000, "Qualificação técnica deve ter no máximo 1000 caracteres"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
});

type PrestadorFormData = z.infer<typeof prestadorSchema>;

const RegisterPrestador = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para arquivos
  const [documento, setDocumento] = useState<File | null>(null);
  const [certificacoes, setCertificacoes] = useState<File | null>(null);
  
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PrestadorFormData>({
    resolver: zodResolver(prestadorSchema),
  });

  const senha = watch("senha");
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { score, text: "Fraca", color: "text-destructive" };
    if (score <= 3) return { score, text: "Média", color: "text-yellow-500" };
    return { score, text: "Forte", color: "text-green-600" }; // Ajustei para verde para ficar consistente
  };

  const passwordStrength = getPasswordStrength(senha || "");

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }
      setDocumento(file);
    }
  };

  const handleCertificacoesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB",
          variant: "destructive",
        });
        return;
      }
      setCertificacoes(file);
    }
  };

  const onSubmit = async (data: PrestadorFormData) => {
    // Validação de arquivos obrigatórios
    if (!documento) {
      setFeedback({
        type: 'error',
        message: 'Por favor, envie um documento de identidade.'
      });
      return;
    }
    // Nota: Certificações são opcionais no model do Django (blank=True), 
    // mas se quiser obrigar, descomente abaixo:
    /*
    if (!certificacoes) {
        setFeedback({ type: 'error', message: 'Envie suas certificações.' });
        return;
    }
    */

    setIsLoading(true);
    setFeedback(null);

    // 🔹 CONSTRUINDO O FORMDATA PARA O BACKEND
    const formData = new FormData();
    
    // Campos do User (Auth)
    formData.append("username", data.email); 
    formData.append("email", data.email);
    formData.append("password", data.senha);
    formData.append("password2", data.confirmarSenha);

    // Campos do ProviderProfile (Mapeando do seu form para o backend)
    formData.append("full_name", data.nomeCompleto);
    // Backend exige professional_email, usamos o mesmo do login por enquanto
    formData.append("professional_email", data.email); 
    formData.append("service_address", data.endereco);
    formData.append("technical_qualification", data.qualificacaoTecnica);
    
    // Nota: O backend ProviderProfile atual não tem campo 'phone'. 
    // Se quiser salvar o telefone, precisaremos adicionar esse campo ao modelo ProviderProfile no Django.
    // Por enquanto, ele será ignorado pelo backend, mas enviamos caso adicione depois.
    formData.append("phone", data.telefone);

    // Arquivos (Nomes devem bater com ProviderRegisterSerializer)
    if (documento) formData.append("identity_document", documento);
    if (certificacoes) formData.append("certifications", certificacoes);

    try {
      const apiUrl = "http://127.0.0.1:8000/api/accounts/register/provider/";
      
      const response = await apiPost(apiUrl, formData);

      toast({
        title: "Cadastro realizado!",
        description: (response as any)?.message || "Bem-vindo como prestador ao FAZ PRA MIM.",
      });

      setFeedback({
        type: 'success',
        message: 'Cadastro realizado com sucesso! Você será redirecionado para o login.'
      });

      setTimeout(() => navigate("/login"), 3000);

    } catch (error: any) {
      let errorMessage = 'Erro interno. Tente novamente.';
      try {
          // Tenta ler o erro estruturado do Django
          const json = JSON.parse(error.message);
          if (typeof json === 'object' && json !== null) {
              const key = Object.keys(json)[0];
              const msg = Array.isArray(json[key]) ? json[key][0] : json[key];
              errorMessage = `${key.toUpperCase()}: ${msg}`;
          } else {
              errorMessage = error.message;
          }
      } catch {
          errorMessage = error.message;
      }

      setFeedback({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Cadastro de Prestador
            </h1>
            <p className="text-muted-foreground">
              Conecte-se com clientes e expanda seu negócio
            </p>
          </div>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-xl">Dados Profissionais</CardTitle>
              <CardDescription>
                Preencha com informações precisas para construir sua credibilidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Nome Completo */}
                <div className="form-field">
                  <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                  <Input
                    id="nomeCompleto"
                    {...register("nomeCompleto")}
                    placeholder="Digite seu nome completo"
                    className={errors.nomeCompleto ? "border-destructive" : ""}
                  />
                  {errors.nomeCompleto && (
                    <p className="text-sm text-destructive">{errors.nomeCompleto.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="form-field">
                  <Label htmlFor="email">E-mail Profissional *</Label>
                  <Input
                    id="email" 
                    type="email"
                    {...register("email")}
                    placeholder="seu@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Senha */}
                <div className="form-field">
                  <Label htmlFor="senha">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      {...register("senha")}
                      placeholder="Digite uma senha segura"
                      className={errors.senha ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {senha && (
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i <= passwordStrength.score ? "bg-accent" : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`text-xs ${passwordStrength.color}`}>
                        {passwordStrength.text}
                      </span>
                    </div>
                  )}
                  {errors.senha && (
                    <p className="text-sm text-destructive">{errors.senha.message}</p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div className="form-field">
                  <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmarSenha")}
                      placeholder="Digite a senha novamente"
                      className={errors.confirmarSenha ? "border-destructive pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmarSenha && (
                    <p className="text-sm text-destructive">{errors.confirmarSenha.message}</p>
                  )}
                </div>

                {/* Telefone */}
                <div className="form-field">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    {...register("telefone")}
                    placeholder="(11) 99999-9999"
                    className={errors.telefone ? "border-destructive" : ""}
                  />
                  {errors.telefone && (
                    <p className="text-sm text-destructive">{errors.telefone.message}</p>
                  )}
                </div>

                {/* Endereço */}
                <div className="form-field">
                  <Label htmlFor="endereco">Endereço de Atuação *</Label>
                  <Textarea
                    id="endereco"
                    {...register("endereco")}
                    placeholder="Rua, número, bairro, cidade, CEP - Área onde você atende"
                    className={errors.endereco ? "border-destructive" : ""}
                    rows={3}
                  />
                  {errors.endereco && (
                    <p className="text-sm text-destructive">{errors.endereco.message}</p>
                  )}
                </div>

                {/* Qualificação Técnica */}
                <div className="form-field">
                  <Label htmlFor="qualificacaoTecnica">Qualificação Técnica *</Label>
                  <Textarea
                    id="qualificacaoTecnica"
                    {...register("qualificacaoTecnica")}
                    placeholder="Descreva sua experiência, especialidades, cursos e certificações relevantes..."
                    className={errors.qualificacaoTecnica ? "border-destructive" : ""}
                    rows={4}
                  />
                  <p className="text-sm text-muted-foreground">
                    Esta descrição será exibida no seu perfil público
                  </p>
                  {errors.qualificacaoTecnica && (
                    <p className="text-sm text-destructive">{errors.qualificacaoTecnica.message}</p>
                  )}
                </div>

                {/* Upload de Documento */}
                <div className="form-field">
                  <Label>Documento de Identidade *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
                    <input
                      type="file"
                      id="documento"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                    <label htmlFor="documento" className="cursor-pointer block">
                      <div className="flex flex-col items-center space-y-2">
                        {documento ? (
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        )}
                        <p
                          className={`text-sm font-medium ${
                            documento ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          {documento
                            ? `Documento selecionado: ${documento.name}`
                            : "Clique para enviar RG, CNH ou Passaporte"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, JPG ou PNG até 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Upload de Certificações */}
                <div className="form-field">
                  <Label>Certificações ou Currículo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="certificacoes"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleCertificacoesUpload}
                      className="hidden"
                    />
                    <label htmlFor="certificacoes" className="cursor-pointer block">
                      <div className="flex flex-col items-center space-y-2">
                        {certificacoes ? (
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        ) : (
                          <Upload className="w-8 h-8 text-muted-foreground" />
                        )}
                        <p
                          className={`text-sm font-medium ${
                            certificacoes ? "text-green-600" : "text-muted-foreground"
                          }`}
                        >
                          {certificacoes
                            ? `Arquivo selecionado: ${certificacoes.name}`
                            : "Adicione certificados, diplomas ou currículo"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, JPG ou PNG até 10MB
                        </p>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Certificações aumentam sua credibilidade e visibilidade
                  </p>
                </div>

                {/* Feedback Messages */}
                {feedback && (
                  <Alert
                    className={
                      feedback.type === 'success'
                        ? "border-green-500 bg-green-50"
                        : "border-destructive bg-red-50"
                    }
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <AlertDescription
                      className={
                        feedback.type === 'success'
                          ? "text-green-700"
                          : "text-destructive"
                      }
                    >
                      {feedback.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent-hover"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cadastrando...
                    </>
                  ) : (
                    "Enviar Cadastro"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
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

export default RegisterPrestador;