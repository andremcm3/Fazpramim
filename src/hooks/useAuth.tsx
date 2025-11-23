import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  nome: string;
  tipo: 'cliente' | 'prestador';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Carregar usuário do localStorage ao iniciar
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const raw = JSON.parse(storedUser);
        
        console.log('useAuth - raw do localStorage:', raw);

        // Detecta se é prestador por vários campos possíveis
        const isPrestador = raw.tipo === 'prestador' || 
                           raw.is_provider === true || 
                           raw.is_prestador === true ||
                           raw.user_type === 'provider' ||
                           raw.user_type === 'prestador' ||
                           raw.role === 'provider' ||
                           raw.role === 'prestador';

        // Garante que o objeto user usado no app tenha sempre o campo "tipo"
        const normalizedUser: User = {
          id: raw.id?.toString() || '1',
          email: raw.email || '',
          nome: raw.nome || raw.username || raw.full_name || (raw.email ? String(raw.email).split('@')[0] : ''),
          tipo: isPrestador ? 'prestador' : 'cliente',
        };

        console.log('useAuth - normalizedUser:', normalizedUser);
        console.log('useAuth - tipo final:', normalizedUser.tipo);

        setUser(normalizedUser);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (email: string, senha: string) => {
    // Simular API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user - em produção isso viria do backend
    const mockUser: User = {
      id: '1',
      email,
      nome: email.split('@')[0],
      tipo: 'cliente', // fallback apenas para cenário de mock
    };

    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
