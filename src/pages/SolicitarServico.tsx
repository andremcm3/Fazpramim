import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Certifique-se que este componente existe
import { CheckCircle, AlertCircle } from "lucide-react";


// 🎯 Função de API Autocontida
const apiPost = async (url: string, payload: any) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}` // Token obrigatório
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Sessão expirada. Faça login novamente.");
        }
        const errorBody = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(JSON.stringify(errorBody)); 
    }

    return response.json();
};

// --- SCHEMA DE VALIDAÇÃO ---
const requestSchema = z.object({
  description: z.string().min(10, "Descreva o serviço com pelo menos 10 caracteres."),
  desired_datetime: z.string().refine((val) => new Date(val) > new Date(), {
    message: "A data e hora devem ser no futuro.",
  }),
  proposed_value: z.string().min(1, "Informe um valor proposto."),
});

type RequestFormData = z.infer<typeof requestSchema>;

const SolicitarServico = () => {
  const { id } = useParams(); // ID do Prestador
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    descricao: "",
    horario: "",
    valorProposto: "",
  });

  // Mantemos o hook form para validação, mas usamos state local para input controlado se preferir,
  // ou integramos totalmente com o react-hook-form (recomendado abaixo):
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  // Handler auxiliar para manter sincronia se necessário, ou deixe o register cuidar de tudo
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValue(e.target.name as any, e.target.value); // Sincroniza com react-hook-form
  };

  const onSubmit = async (data: RequestFormData) => {
    setIsLoading(true);
    setFeedback(null);

    const token = localStorage.getItem('token');
    if (!token) {
        setFeedback({ type: 'error', message: 'Você precisa estar logado.' });
        setTimeout(() => navigate("/login"), 2000);
        setIsLoading(false);
        return;
    }

    // Formatação para API
    const apiPayload = {
        description: data.description,
        desired_datetime: data.desired_datetime, 
        proposed_value: parseFloat(data.proposed_value.toString().replace(',', '.')),
    };

    try {
      const apiUrl = `http://127.0.0.1:8000/api/accounts/providers/${id}/requests/`;
      const responseData = await apiPost(apiUrl, apiPayload);

      toast({
        title: "Solicitação enviada!",
        description: "O prestador foi notificado.",
      });
      
      setFeedback({ type: 'success', message: 'Solicitação enviada com sucesso!' });

      // Redireciona para a página de detalhes da solicitação
      setTimeout(() => navigate(`/solicitacao/${responseData.id}`), 1500);

    } catch (error: any) {
      let msg = "Erro ao enviar.";
      try {
          const json = JSON.parse(error.message);
          msg = json.detail || Object.values(json).flat().join(', ');
      } catch {
          msg = error.message;
      }
      
      setFeedback({ type: 'error', message: msg });
      if (msg.includes("Sessão expirada")) setTimeout(() => navigate("/login"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6 pl-0 hover:bg-transparent hover:text-primary" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Solicitar Serviço</CardTitle>
              <CardDescription>
                Preencha os detalhes e aguarde a resposta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">
                    <MessageSquare className="inline w-4 h-4 mr-2" /> Descrição *
                  </Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Descreva o serviço..."
                    onChange={handleChange}
                    className="min-h-[120px]"
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="desired_datetime"><Calendar className="inline w-4 h-4 mr-2" /> Data e Hora *</Label>
                        <Input
                            id="desired_datetime"
                            type="datetime-local"
                            {...register("desired_datetime")}
                            onChange={handleChange}
                        />
                        {errors.desired_datetime && <p className="text-sm text-destructive">{errors.desired_datetime.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="proposed_value"><DollarSign className="inline w-4 h-4 mr-2" /> Valor (R$) *</Label>
                        <Input
                            id="proposed_value"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...register("proposed_value")}
                            onChange={handleChange}
                        />
                        {errors.proposed_value && <p className="text-sm text-destructive">{errors.proposed_value.message}</p>}
                    </div>
                </div>

                {feedback && (
                  <Alert className={feedback.type === 'success' ? "border-green-500 bg-green-50" : "border-destructive bg-red-50"}>
                    <div className="flex items-center">
                        {feedback.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600 mr-2" /> : <AlertCircle className="h-4 w-4 text-destructive mr-2" />}
                        <AlertDescription className={feedback.type === 'success' ? "text-green-700" : "text-destructive"}>{feedback.message}</AlertDescription>
                    </div>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : "Enviar Solicitação"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SolicitarServico;