import React, { useState, useCallback, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

// 🎯 Funções de Suporte (Mocks e apiPost) definidas internamente para autocontenção.

/**
 * Função para fazer a chamada à API com lógica de retentativa e formatação de erro.
 */
const apiPost = async (url: string, payload: any, retries = 3, delay = 1000) => {
    // Detecta se o payload é FormData (para upload de arquivos)
    const isFormData = payload instanceof FormData;
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
    const body = isFormData ? payload : JSON.stringify(payload);

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            if (!response.ok) {
                // 🔍 DIAGNÓSTICO MELHORADO
                const textBody = await response.text();
                let errorJson;
                try {
                    errorJson = JSON.parse(textBody);
                } catch {
                    throw new Error(`Erro Servidor (${response.status}): Verifique o terminal do Backend.`);
                }
                
                throw new Error(JSON.stringify(errorJson)); 
            }

            return response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; 
        }
    }
};

// --- MOCK DE useNavigate (react-router-dom) ---
const useNavigate = () => {
    return (path: string) => console.log(`[NAVIGATE MOCK] Navegando para: ${path}`);
};

// --- TOAST MOCK ---
interface ToastProps {
    title: string;
    description: string;
    variant?: "default" | "destructive" | "success";
}

const useToast = () => {
    const toast = useCallback(({ title, description, variant = "default" }: ToastProps) => {
        const icon = variant === "destructive" ? "❌" : variant === "success" ? "✅" : "💡";
        console.log(`[TOAST MOCK - ${variant.toUpperCase()}] ${icon} ${title}: ${description}`);
    }, []);
    return { toast };
};

// --- COMPONENTES UI MOCK ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`rounded-xl border bg-card text-card-foreground shadow-lg ${className}`}>{children}</div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <h3 className={`font-semibold tracking-tight text-xl ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-sm text-muted-foreground">{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-6 pt-0">{children}</div>
);

const Button: React.FC<{
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
}> = ({ children, className = "", disabled, onClick, type = "button" }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
        {children}
    </button>
);

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { className?: string }>(({ id, type = "text", placeholder, className = "", ...props }, ref) => (
    <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
));
Input.displayName = "Input";

const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }>(({ id, placeholder, className = "", rows = 3, ...props }, ref) => (
    <textarea
        ref={ref}
        id={id}
        rows={rows}
        placeholder={placeholder}
        className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
));
Textarea.displayName = "Textarea";

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-1">
        {children}
    </label>
);

const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] ${className}`}>
        {children}
    </div>
);

const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <p className={`text-sm [&:not(:last-child)]:mb-0 pl-7 ${className}`}>{children}</p>
);

const Header: React.FC = () => (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between mx-auto px-4">
            <h1 className="text-xl font-bold text-blue-600">FAZ PRA MIM</h1>
        </div>
    </header>
);

const Footer: React.FC = () => (
    <footer className="border-t mt-12 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} FAZ PRA MIM. Todos os direitos reservados.
        </div>
    </footer>
);

// --- ZOD SCHEMA ---
const clienteSchema = z
    .object({
        nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100).regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
        email: z.string().email("Email inválido").max(255),
        cpf: z.string().min(11, "CPF inválido").max(14).regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF deve ter formato válido"),
        senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Senha deve conter: 1 minúscula, 1 maiúscula, 1 número"),
        confirmarSenha: z.string(),
        telefone: z.string().min(10, "Telefone inválido").max(15).regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, "Telefone deve ter formato válido"),
        endereco: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres").max(500),
    })
    .refine((data) => data.senha === data.confirmarSenha, { message: "Senhas não coincidem", path: ["confirmarSenha"] });

type ClienteFormData = z.infer<typeof clienteSchema>;

// --- COMPONENTE PRINCIPAL ---
const RegisterCliente: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [documento, setDocumento] = useState<File | null>(null);
    const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string; } | null>(null);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ClienteFormData>({ resolver: zodResolver(clienteSchema) });
    const senha = watch("senha");

    const getPasswordStrength = (password: string) => {
        if (!password) return { score: 0, text: "", color: "" };
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z\d]/.test(password)) score++;
        if (score <= 2) return { score, text: "Fraca", color: "text-red-500" };
        if (score <= 3) return { score, text: "Média", color: "text-yellow-500" };
        return { score, text: "Forte", color: "text-green-500" };
    };

    const passwordStrength = getPasswordStrength(senha || "");

    const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: "Arquivo muito grande", description: "Máximo 5MB", variant: "destructive" });
                return;
            }
            setDocumento(file);
        }
    };

    const handleFotoPerfilUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({ title: "Arquivo muito grande", description: "Máximo 5MB", variant: "destructive" });
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast({ title: "Formato inválido", description: "Apenas imagens são aceitas", variant: "destructive" });
                return;
            }
            setFotoPerfil(file);
        }
    };

    const onSubmit = async (data: ClienteFormData) => {
        if (!documento) {
            setFeedback({ type: "error", message: "Por favor, envie um documento de identidade. Obrigatório." });
            return;
        }

        setIsLoading(true);
        setFeedback(null);

        const formData = new FormData();
        formData.append('username', data.email); 
        formData.append('email', data.email);
        formData.append('password', data.senha);
        
        // 🚨 CORREÇÃO: Adicionando password2 que o backend exige
        formData.append('password2', data.confirmarSenha);

        formData.append('full_name', data.nomeCompleto);
        formData.append('cpf', data.cpf);
        formData.append('phone', data.telefone); 
        formData.append('address', data.endereco);
        formData.append('identity_document', documento);
        if (fotoPerfil) {
            formData.append('profile_picture', fotoPerfil);
        }

        try {
            const apiUrl = "http://127.0.0.1:8000/api/accounts/register/client/"; 
            const response = await apiPost(apiUrl, formData);

            toast({ title: "Cadastro realizado!", description: (response as any)?.message || "Sucesso!", variant: "success" });
            setFeedback({ type: "success", message: "Cadastro realizado com sucesso! Redirecionando..." });
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000); 
        } catch (error) {
            let errorMessage = "Erro interno.";
            if (error instanceof Error) {
                try {
                    const errorJson = JSON.parse(error.message);
                    if (typeof errorJson === 'object' && errorJson !== null) {
                        const firstKey = Object.keys(errorJson)[0];
                        const firstMessage = Array.isArray(errorJson[firstKey]) ? errorJson[firstKey][0] : JSON.stringify(errorJson[firstKey]);
                        errorMessage = `${firstKey.toUpperCase()}: ${firstMessage}`;
                    } else {
                        errorMessage = error.message;
                    }
                } catch {
                    errorMessage = error.message;
                }
            }
            setFeedback({ type: "error", message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    // Formata telefone enquanto o usuário digita: (DD) 99999-9999 ou (DD) 9999-9999
    const formatPhone = (value: string) => {
        if (!value) return "";
        const digits = String(value).replace(/\D/g, '').slice(0, 11); // limita a 11 dígitos (DDD + 9)
        if (digits.length === 0) return "";
        const ddd = digits.slice(0, 2);
        const rest = digits.slice(2);
        if (!rest) return `(${ddd}) `;
        if (rest.length <= 4) return `(${ddd}) ${rest}`;
        const prefix = rest.slice(0, rest.length - 4);
        const last4 = rest.slice(-4);
        return `(${ddd}) ${prefix}-${last4}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8 flex-grow">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Cadastro de Cliente</h1>
                        <p className="text-gray-500">Preencha os dados para criar sua conta</p>
                    </div>
                    <Card className="surface-card border-gray-200 bg-white">
                        <CardHeader>
                            <CardTitle className="text-2xl text-blue-600">Crie sua Conta</CardTitle>
                            <CardDescription>Todas as informações são obrigatórias.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                                <div>
                                    <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                                    <Input id="nomeCompleto" {...register("nomeCompleto")} placeholder="Nome completo" className={errors.nomeCompleto ? "border-red-500" : ""} />
                                    {errors.nomeCompleto && <p className="text-sm text-red-500 mt-1">{errors.nomeCompleto.message}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">E-mail *</Label>
                                        <Input id="email" type="email" {...register("email")} placeholder="seu@email.com" className={errors.email ? "border-red-500" : ""} />
                                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="cpf">CPF *</Label>
                                        <Input id="cpf" {...register("cpf")} placeholder="000.000.000-00" className={errors.cpf ? "border-red-500" : ""} />
                                        {errors.cpf && <p className="text-sm text-red-500 mt-1">{errors.cpf.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="senha">Senha *</Label>
                                        <div className="relative">
                                            <Input id="senha" type={showPassword ? "text" : "password"} {...register("senha")} placeholder="Senha segura" className={errors.senha ? "border-red-500 pr-10" : "pr-10"} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 p-1">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {senha && (
                                            <div className="flex items-center space-x-2 mt-2">
                                                <div className="flex space-x-1">
                                                    {[1, 2, 3, 4].map((i) => (<div key={i} className={`w-2 h-2 rounded-full ${i <= passwordStrength.score ? passwordStrength.color.replace("text-", "bg-") : "bg-gray-200"}`} />))}
                                                </div>
                                                <span className={`text-xs ${passwordStrength.color} font-medium`}>{passwordStrength.text}</span>
                                            </div>
                                        )}
                                        {errors.senha && <p className="text-sm text-red-500 mt-1">{errors.senha.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                                        <div className="relative">
                                            <Input id="confirmarSenha" type={showConfirmPassword ? "text" : "password"} {...register("confirmarSenha")} placeholder="Repita a senha" className={errors.confirmarSenha ? "border-red-500 pr-10" : "pr-10"} />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 p-1">
                                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.confirmarSenha && <p className="text-sm text-red-500 mt-1">{errors.confirmarSenha.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="telefone">Telefone *</Label>
                                    {(() => {
                                        const phoneReg = register("telefone");
                                        return (
                                            <Input
                                                id="telefone"
                                                {...phoneReg}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const raw = e.target.value;
                                                    const formatted = formatPhone(raw);
                                                    e.target.value = formatted;
                                                    if (phoneReg.onChange) phoneReg.onChange(e);
                                                    setValue('telefone', formatted, { shouldValidate: true, shouldDirty: true });
                                                }}
                                                placeholder="(11) 99999-9999"
                                                className={errors.telefone ? "border-red-500" : ""}
                                            />
                                        );
                                    })()}
                                    {errors.telefone && <p className="text-sm text-red-500 mt-1">{errors.telefone.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="endereco">Endereço Completo *</Label>
                                    <Textarea id="endereco" {...register("endereco")} placeholder="Rua, número, bairro..." className={errors.endereco ? "border-red-500" : ""} rows={3} />
                                    {errors.endereco && <p className="text-sm text-red-500 mt-1">{errors.endereco.message}</p>}
                                </div>
                                <div>
                                    <Label>Foto de Perfil</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                                        <input type="file" id="fotoPerfil" accept="image/*" onChange={handleFotoPerfilUpload} className="hidden" />
                                        <label htmlFor="fotoPerfil" className="cursor-pointer block">
                                            <div className="flex flex-col items-center space-y-2">
                                                {fotoPerfil ? <CheckCircle className="w-8 h-8 text-green-500" /> : <Upload className="w-8 h-8 text-gray-400" />}
                                                <p className={`text-sm font-medium ${fotoPerfil ? "text-green-600" : "text-gray-700"}`}>{fotoPerfil ? `Selecionado: ${fotoPerfil.name}` : "Clique para enviar sua foto"}</p>
                                                <p className="text-xs text-gray-500">JPG ou PNG até 5MB</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <Label>Documento de Identidade *</Label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                                        <input type="file" id="documento" accept=".pdf,.jpg,.jpeg,.png" onChange={handleDocumentUpload} className="hidden" />
                                        <label htmlFor="documento" className="cursor-pointer block">
                                            <div className="flex flex-col items-center space-y-2">
                                                {documento ? <CheckCircle className="w-8 h-8 text-green-500" /> : <Upload className="w-8 h-8 text-gray-400" />}
                                                <p className={`text-sm font-medium ${documento ? "text-green-600" : "text-gray-700"}`}>{documento ? `Selecionado: ${documento.name}` : "Clique para enviar RG/CNH"}</p>
                                                <p className="text-xs text-gray-500">PDF, JPG ou PNG até 5MB</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                {feedback && (
                                    <Alert className={feedback.type === "success" ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}>
                                        {feedback.type === "success" ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                                        <AlertDescription className={feedback.type === "success" ? "text-green-700" : "text-red-700"}>{feedback.message}</AlertDescription>
                                    </Alert>
                                )}
                                <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md" disabled={isLoading}>
                                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cadastrando...</> : "Enviar Cadastro"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="text-center mt-8">
                        <p className="text-gray-500">Já tem uma conta? <button onClick={() => navigate("/login")} className="text-blue-600 hover:text-blue-700 hover:underline font-semibold">Faça login aqui</button></p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RegisterCliente;