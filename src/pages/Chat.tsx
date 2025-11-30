import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, AlertCircle } from "lucide-react";
import { getChatMessages, sendChatMessage, getProviderDetails } from "@/service/app";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  sender: number;
  sender_name: string;
  content: string;
  created_at: string;
  is_read: boolean;
  is_me: boolean;
}

interface ProviderData {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
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
  const [providerData, setProviderData] = useState<ProviderData | null>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const tipo = localStorage.getItem("user_type") || "cliente";
    setUserType(tipo as "cliente" | "prestador");

    fetchMessages();
    fetchProviderData();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token") || "";
      const data = await getChatMessages(parseInt(id), token);
      setMessages(data);
    } catch (error: any) {
      console.error("Erro ao buscar mensagens:", error);
    }
  };

  const fetchProviderData = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token") || "";
      const userType = localStorage.getItem("user_type") || "cliente";
      
      // Buscar os dados da solicitação para pegar prestador e cliente
      const res = await fetch(
        `http://127.0.0.1:8000/api/accounts/requests/${id}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
        }
      );
      const requestData = await res.json();
      
      // Verificar status da solicitação
      if (requestData.status !== "accepted" && requestData.status !== "completed") {
        // Redirecionar para solicitações
        if (userType === "cliente") {
          navigate("/solicitacoes-cliente");
        } else {
          navigate("/solicitacoes-prestador");
        }
        return;
      }
      
      setRequestStatus(requestData.status);
      
      // Se for cliente, mostrar dados do prestador. Se for prestador, mostrar dados do cliente
      let userData;
      if (userType === "cliente" && requestData.provider) {
        userData = requestData.provider;
      } else if (userType === "prestador" && requestData.client) {
        userData = requestData.client;
      }
      
      if (userData) {
        // Para cliente (userData é provider)
        if (userData.user) {
          setProviderData({
            id: userData.user.id || 0,
            username: userData.user.username || "",
            first_name: userData.full_name?.split(" ")[0] || userData.user.full_name?.split(" ")[0] || "",
            last_name: userData.full_name?.split(" ").slice(1).join(" ") || userData.user.full_name?.split(" ").slice(1).join(" ") || "",
            profile_picture: userData.profile_photo || "/placeholder.svg",
          });
        } else {
          // Para prestador (userData é client User)
          setProviderData({
            id: userData.id || 0,
            username: userData.username || "",
            first_name: userData.full_name?.split(" ")[0] || "",
            last_name: userData.full_name?.split(" ").slice(1).join(" ") || "",
            profile_picture: "/placeholder.svg",
          });
        }
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error("Erro ao buscar dados:", error);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      await sendChatMessage(parseInt(id), newMessage, token);
      setNewMessage("");
      await fetchMessages();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error?.message || "Tente novamente.",
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

  // ➤ Determina se é uma mensagem enviada pelo usuário atual
  // Usa o campo is_me que vem da API (muito mais confiável)
  const isMyMessage = (message: Message) => {
    return message.is_me === true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {isLoading ? (
          <Card className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex items-center justify-center">
            <p className="text-muted-foreground">Carregando chat...</p>
          </Card>
        ) : (
          <Card className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={providerData?.profile_picture || "/placeholder.svg"} />
                  <AvatarFallback>
                    {providerData?.first_name?.[0]}{providerData?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {providerData
                      ? `${providerData.first_name || providerData.username} ${providerData.last_name || ""}`.trim()
                      : "Carregando..."}
                  </h2>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </div>

            {/* Lista de mensagens */}
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
                      isMyMessage(message)
                        ? "justify-end" 
                        : "justify-start" 
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 shadow ${
                        isMyMessage(message)
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted" 
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block text-right">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={loading || !newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Chat;
