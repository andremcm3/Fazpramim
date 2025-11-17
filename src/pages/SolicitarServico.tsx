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
import { Calendar, DollarSign, MessageSquare } from "lucide-react";

const SolicitarServico = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    descricao: "",
    horario: "",
    valorProposto: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validação básica
    if (!formData.descricao || !formData.horario || !formData.valorProposto) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Solicitação enviada!",
      description: "O prestador receberá sua solicitação em breve.",
    });

    setIsSubmitting(false);
    
    // Redirecionar para o chat
    navigate(`/chat/${id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Solicitar Serviço</CardTitle>
              <CardDescription>
                Preencha os detalhes da sua solicitação e aguarde a resposta do prestador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="descricao">
                    <MessageSquare className="inline w-4 h-4 mr-2" />
                    Descrição do Serviço *
                  </Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    placeholder="Descreva detalhadamente o serviço que você precisa..."
                    value={formData.descricao}
                    onChange={handleChange}
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    Horário Desejado *
                  </Label>
                  <Input
                    id="horario"
                    name="horario"
                    type="datetime-local"
                    value={formData.horario}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorProposto">
                    <DollarSign className="inline w-4 h-4 mr-2" />
                    Valor Proposto (R$) *
                  </Label>
                  <Input
                    id="valorProposto"
                    name="valorProposto"
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={formData.valorProposto}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                  </Button>
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

export default SolicitarServico;
