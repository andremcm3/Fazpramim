import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft } from "lucide-react";
import { getChatMessages, sendChatMessage } from "@/service/app";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: string;
  content: string;
  created_at: string;
  is_from_client: boolean;
}

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userType, setUserType] = useState<"cliente" | "prestador">("cliente");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Detectar tipo de usuário baseado no localStorage ou rota
    const tipo = localStorage.getItem('user_type') || 'cliente';
    setUserType(tipo as "cliente" | "prestador");
    
    // Buscar mensagens ao carregar
    fetchMessages();
    
    // Poll para atualizar mensagens a cada 3 segundos
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getChatMessages(parseInt(id), token);
      setMessages(data);
    } catch (error: any) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      await sendChatMessage(parseInt(id), newMessage, token);
      setNewMessage("");
      await fetchMessages(); // Atualizar lista de mensagens
    } catch (error: any) {
      toast({ 
        title: "Erro ao enviar mensagem", 
        description: error?.message || "Tente novamente." 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determinar se a mensagem é do usuário atual
  const isMyMessage = (message: Message) => {
    if (userType === "cliente") {
      return message.is_from_client;
    } else {
      return !message.is_from_client;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Card className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
          {/* Header do Chat */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>PS</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">Prestador de Serviço</h2>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma mensagem ainda. Comece a conversa!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    isMyMessage(message) ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isMyMessage(message)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensagem */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;
