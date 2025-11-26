import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ RESOLUÇÃO DOS IMPORTS:
// Mantemos os imports de UI e Layout
import Header from "@/components/Header";
import Footer from "@/components/Footer";
// Mantemos o hook que precisamos para notificações
import { useToast } from "@/hooks/use-toast";
// Importando o useAuth para sincronizar o estado de autenticação
import { useAuth } from "@/hooks/useAuth"; 

// 🎯 MANTEMOS SUA FUNÇÃO DE INTEGRAÇÃO (HEAD)
const apiPost = async (url: string, payload: any) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(JSON.stringify(errorBody)); 
    }

    return response.json();
};

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  
  // ✅ RESOLUÇÃO DOS HOOKS:
  // Mantemos o toast (Sua versão)
  const { toast } = useToast(); 
  // Usando o useAuth para sincronizar o estado global de autenticação
  const auth = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ✅ RESOLUÇÃO DA LÓGICA (ONSUBMIT):
  // Mantemos INTEGRALMENTE a sua versão (HEAD), pois ela tem a conexão real com a API.
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const apiPayload = {
        username: data.email,
        password: data.senha
    };

    try {
      const apiUrl = "http://127.0.0.1:8000/api/accounts/login/";
      
      const response = await apiPost(apiUrl, apiPayload);

      if (response.token) {
          localStorage.setItem('token', response.token);
          
          // Log para debug - ver o que o backend retorna
          console.log('Response do backend:', response);
          console.log('Response.user:', response.user);
          
          // Detectar se é prestador baseado em múltiplos campos possíveis
          const isPrestador = response.user?.is_provider || 
                             response.user?.is_prestador || 
                             response.user?.user_type === 'provider' ||
                             response.user?.user_type === 'prestador' ||
                             response.user?.tipo === 'prestador' ||
                             response.user?.role === 'provider' ||
                             response.user?.role === 'prestador';
          
          // Formatando o usuário para o padrão esperado pelo useAuth
          const userData = {
            id: response.user?.id || '1',
            email: response.user?.email || data.email,
            nome: response.user?.nome || response.user?.username || response.user?.full_name || data.email.split('@')[0],
            tipo: isPrestador ? 'prestador' : 'cliente',
            // Manter campos originais também para referência
            ...(response.user || {})
          };
          
          console.log('userData formatado:', userData);
          
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('user_type', isPrestador ? 'prestador' : 'cliente');
          
          // Força a atualização do contexto de autenticação
          window.dispatchEvent(new Event('storage'));
      }

      if (toast) {
        toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta.",
            variant: "default", 
        });
      }
      
      // Recarrega a página para garantir que o AuthProvider pegue o usuário do localStorage
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 1000);

    } catch (err: any) {
      let msg = "E-mail ou senha incorretos.";
      try {
          const json = JSON.parse(err.message);
          if (json.non_field_errors) {
              msg = json.non_field_errors[0];
          } else if (json.detail) {
              msg = json.detail;
          }
      } catch {
          // msg padrão
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground">
              Entre com suas credenciais para acessar sua conta
            </p>
          </div>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-xl text-center">Fazer Login</CardTitle>
              <CardDescription className="text-center">
                Acesse sua conta no FAZ PRA MIM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div className="form-field">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="seu@email.com"
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Senha */}
                <div className="form-field">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      {...register("senha")}
                      placeholder="Digite sua senha"
                      className={`pl-10 pr-10 ${errors.senha ? "border-destructive" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.senha && (
                    <p className="text-sm text-destructive mt-1">{errors.senha.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <Alert className="border-destructive bg-red-50">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive ml-2">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-hover" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>

                {/* Links */}
                <div className="text-center space-y-2 pt-2">
                  <button 
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => console.log("Implementar recuperação de senha")}
                  >
                    Esqueceu sua senha?
                  </button>
                  <div className="text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <button 
                      type="button"
                      onClick={() => navigate("/register")} 
                      className="text-primary hover:underline font-semibold"
                    >
                      Cadastre-se aqui
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;