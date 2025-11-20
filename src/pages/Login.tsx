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
// Importe seus componentes de Header e Footer
import Header from "@/components/Header"; // Verifique se o caminho está correto no seu projeto
import Footer from "@/components/Footer"; // Verifique se o caminho está correto no seu projeto
import { useToast } from "@/hooks/use-toast"; // Se tiver esse hook, senão pode remover ou usar mock

// 🎯 Função de API (Autocontida)
const apiPost = async (url: string, payload: any) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            // Se precisar de auth no futuro, o header iria aqui
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
  const { toast } = useToast(); // Se não tiver o hook, pode comentar
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

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    // 🔹 Mapeando os dados para o formato que o Django/Knox espera
    // O LoginSerializer padrão espera 'username' e 'password'.
    // Como usamos o email como username no cadastro, enviamos o email no campo username.
    const apiPayload = {
        username: data.email,
        password: data.senha
    };

    try {
      // 🎯 URL do Endpoint de Login
      const apiUrl = "http://127.0.0.1:8000/api/accounts/login/";
      
      const response = await apiPost(apiUrl, apiPayload);

      // ✅ Sucesso!
      // O backend Knox retorna algo como: { "expiry": "...", "token": "..." } ou { "user": {..}, "token": "..." }
      // Precisamos salvar esse token para usar nas próximas requisições privadas.
      
      if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user || {})); // Salva dados básicos do user se vierem
      }

      if (toast) {
        toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta.",
            variant: "default", // ou 'default' se 'success' não existir no seu componente
        });
      }
      
      // Redirecionar para a Home (Dashboard)
      // Pode ser "/" ou "/dashboard" dependendo da sua rota
      setTimeout(() => navigate("/"), 1000);

    } catch (err: any) {
      let msg = "E-mail ou senha incorretos.";
      
      // Tenta ler mensagens específicas do backend (ex: "Credenciais inválidas")
      try {
          const json = JSON.parse(err.message);
          if (json.non_field_errors) {
              msg = json.non_field_errors[0]; // Erro comum do DRF para login
          } else if (json.detail) {
              msg = json.detail;
          }
      } catch {
          // Mantém a mensagem padrão
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
                    {/* Aqui assumo que você tem uma página de seleção ou vai direto pra cliente */}
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